import { useState } from 'react';
import { Card, Field, SelectField } from './EstateKit.jsx';
import { monthlyPayment, useEstate } from './estateUtils.js';

const text = {
  ko: {
    na: '해당 없음',
    rent: '월세',
    loan: '대출금',
    rate: '대출 금리',
    other: '월 기타 비용',
    otherHint: '관리비, 재산세 등 매달 나가는 돈 (선택)',
    mode: '상환 방식',
    interestOnly: '이자만 내기',
    amortized: '원금까지 20년 상환',
    cBreakEven: '손익분기 공실',
    cBreakEvenSub: '1년에 이만큼 비어도 적자가 아니에요',
    cRate: '손익분기 공실률',
    cOutgo: '매달 나가는 돈',
    cOutgoSub: '대출 상환 + 기타 비용',
    cCushion: '공실이 없을 때 월 여유',
    legendOk: '월세를 받는 달',
    legendVacant: '비어도 되는 달',
    stripNote: '12개월 중 비어도 적자가 나지 않는 기간',
    msgAlready: (v) => `공실이 전혀 없어도 매달 ${v} 적자예요. 손익분기 공실은 0개월이에요.`,
    msgOk: (m) => `1년에 ${m}까지 비어도 현금흐름이 마이너스가 되지 않아요.`,
    msgAll: '월세로 낼 돈이 없어서 1년 내내 비어 있어도 적자가 나지 않아요.',
    perVacant: '공실 1개월당 줄어드는 수입',
    tableTitle: '금리에 따른 손익분기 공실',
    thRate: '대출 금리',
    thMonths: '손익분기 공실',
    thRatePct: '공실률',
    thPay: '월 지출',
    zeroRent: '월세가 0이면 손익분기 공실을 계산할 수 없어요.',
    formula: '손익분기 공실(개월) = 12 × (월세 − 월 지출) ÷ 월세',
    note: '월 지출 = 대출 상환액 + 기타 비용. 세금과 보증금 반환은 반영하지 않았어요.',
  },
  en: {
    na: 'N/A',
    rent: 'Monthly rent',
    loan: 'Loan amount',
    rate: 'Loan interest rate',
    other: 'Other monthly costs',
    otherHint: 'Management fees, property tax, etc. paid every month (optional)',
    mode: 'Repayment',
    interestOnly: 'Interest only',
    amortized: 'Principal + interest, 20 years',
    cBreakEven: 'Break-even vacancy',
    cBreakEvenSub: 'Months per year it can sit empty without a loss',
    cRate: 'Break-even vacancy rate',
    cOutgo: 'Monthly outgo',
    cOutgoSub: 'loan payment + other costs',
    cCushion: 'Monthly cushion with no vacancy',
    legendOk: 'Months with rent',
    legendVacant: 'Months it can be empty',
    stripNote: 'Of 12 months, how long it can be vacant without a loss',
    msgAlready: (v) => `Even with no vacancy at all you lose ${v} every month, so break-even vacancy is 0 months.`,
    msgOk: (m) => `The property can sit empty for up to ${m} a year without turning cash flow negative.`,
    msgAll: 'There is nothing to pay out of rent, so it can sit empty all year without a loss.',
    perVacant: 'Income lost per vacant month',
    tableTitle: 'Break-even vacancy by interest rate',
    thRate: 'Loan rate',
    thMonths: 'Break-even vacancy',
    thRatePct: 'Vacancy rate',
    thPay: 'Monthly outgo',
    zeroRent: 'With zero rent, break-even vacancy cannot be calculated.',
    formula: 'Break-even vacancy (months) = 12 × (rent − monthly outgo) ÷ rent',
    note: 'Monthly outgo = loan payment + other costs. Taxes and deposit refunds are not included.',
  },
};

export default function BreakEvenVacancyCalculator() {
  const { lang, fmt } = useEstate();
  const t = text[lang];

  const [rent, setRent] = useState(400);
  const [loan, setLoan] = useState(50000);
  const [rate, setRate] = useState(4.5);
  const [other, setOther] = useState(0);
  const [mode, setMode] = useState('i');

  const breakEven = (r) => {
    const outgo = monthlyPayment(loan, r, mode) + other;
    const months = rent > 0 ? Math.min(12, Math.max(0, (12 * (rent - outgo)) / rent)) : 0;
    return { outgo, months };
  };

  const cur = breakEven(rate);
  const cushion = rent - cur.outgo;
  const rowRates = [-1, 0, 1, 2].map((d) => Math.round((rate + d) * 100) / 100).filter((r) => r >= 0);

  // 12-month strip: the first `fullOk` months are "can be empty", one partial month, rest earn rent
  const fullOk = Math.floor(cur.months + 1e-9);
  const partial = cur.months - fullOk;
  const monthsLabel = fmt.months(cur.months);

  let message;
  if (rent <= 0) message = t.zeroRent;
  else if (cur.months <= 0 && cushion < 0) message = t.msgAlready(fmt.money(-cushion));
  else if (cur.months >= 12) message = t.msgAll;
  else message = t.msgOk(monthsLabel);

  return (
    <div className="estate-calc">
      <Field id="be-rent" label={t.rent} unit="man" value={rent} onChange={setRent} slider={{ min: 0, max: 2000, step: 10 }} />
      <Field id="be-loan" label={t.loan} unit="eok" value={loan} onChange={setLoan} slider={{ min: 0, max: 200000, step: 5000 }} />
      <Field id="be-rate" label={t.rate} unit="pct" value={rate} onChange={setRate} slider={{ min: 2, max: 8, step: 0.1 }} max={30} />
      <Field id="be-other" label={t.other} unit="man" value={other} onChange={setOther} hint={t.otherHint} />
      <SelectField
        id="be-mode"
        label={t.mode}
        value={mode}
        onChange={setMode}
        options={[['i', t.interestOnly], ['a', t.amortized]]}
      />

      <div className="cards">
        <Card hl label={t.cBreakEven} value={rent > 0 ? monthsLabel : t.na} sub={t.cBreakEvenSub} tone={cur.months <= 0 ? 'neg' : ''} />
        <Card label={t.cRate} value={rent > 0 ? fmt.pct((cur.months / 12) * 100) : t.na} />
        <Card label={t.cOutgo} value={fmt.money(cur.outgo)} sub={t.cOutgoSub} />
        <Card label={t.cCushion} value={fmt.money(cushion)} tone={cushion < 0 ? 'neg' : 'pos'} />
        <Card label={t.perVacant} value={fmt.money(rent)} />
      </div>

      {rent > 0 && (
        <>
          <div className="strip" aria-label={t.stripNote}>
            {Array.from({ length: 12 }, (_, i) => {
              if (i < fullOk) return <i key={i} className="empty" />;
              if (i === fullOk && partial > 0.01) {
                return <i key={i} className="part" style={{ '--p': `${Math.round(partial * 100)}%` }} />;
              }
              return <i key={i} />;
            })}
          </div>
          <div className="strip-legend">
            <span className="v">{t.legendVacant}</span>
            <span>{t.legendOk}</span>
          </div>
        </>
      )}

      <p className={`msg${cur.months <= 0 || rent <= 0 ? ' warn' : ''}`}>{message}</p>

      {rent > 0 && (
        <>
          <div className="group-title">{t.tableTitle}</div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t.thRate}</th>
                  <th>{t.thMonths}</th>
                  <th>{t.thRatePct}</th>
                  <th>{t.thPay}</th>
                </tr>
              </thead>
              <tbody>
                {rowRates.map((r) => {
                  const b = breakEven(r);
                  const isCur = Math.abs(r - rate) < 1e-9;
                  return (
                    <tr key={r} className={isCur ? 'cur-row' : ''}>
                      <td>{fmt.pct(r)}</td>
                      <td className={isCur ? 'cur' : b.months <= 0 ? 'neg' : ''}>{fmt.months(b.months)}</td>
                      <td>{fmt.pct((b.months / 12) * 100)}</td>
                      <td>{fmt.money(b.outgo)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="formula">{t.formula}</p>
      <p className="note">{t.note}</p>
    </div>
  );
}
