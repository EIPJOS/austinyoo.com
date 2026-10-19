import { useState } from 'react';
import { Card, Field, SelectField } from './EstateKit.jsx';
import { monthlyPayment, useEstate } from './estateUtils.js';

const RATE_SHOCKS = [0, 1, 2, 3]; // %p
const VACANCIES = [0, 1, 2, 3, 6]; // months per year

const text = {
  ko: {
    loan: '대출금',
    rate: '현재 대출 금리',
    rent: '월세',
    other: '월 기타 비용',
    otherHint: '관리비, 재산세 등 매달 나가는 돈 (선택)',
    mode: '상환 방식',
    interestOnly: '이자만 내기',
    amortized: '원금까지 20년 상환',
    scenarioTitle: '내 시나리오',
    rateUp: '금리 인상폭',
    vacancy: '1년 중 공실',
    cBase: '지금 (금리 인상·공실 없음)',
    cScenario: '내 시나리오의 월 현금흐름',
    cYear: '연 합계',
    cWorst: '최악 (금리 +3%p, 공실 6개월)',
    perMonth: '월 평균',
    gridTitle: '월 평균 현금흐름 표',
    thRate: '금리 ↓ / 공실 →',
    colVacancy: (m) => (m === 0 ? '공실 없음' : `공실 ${m}개월`),
    rowRate: (p, r) => (p === 0 ? `현재 ${r.toFixed(2)}%` : `+${p}%p → ${r.toFixed(2)}%`),
    ok: (v) => `이 시나리오에서도 매달 ${v}이 남아요.`,
    cover: (v, y) => `매달 ${v}을 내 돈으로 메워야 해요 (1년이면 ${y}).`,
    zeroLoan: '대출금이 0이면 금리 인상의 영향이 없어요.',
    formula: '월 현금흐름 = 월세 × (12 − 공실 개월) ÷ 12 − 월 상환액(올린 금리) − 월 기타 비용',
    note: '월 평균으로 환산한 값이에요(공실 달에는 실제로 그 달 월세가 0이에요). 세금과 보증금 반환은 반영하지 않았어요.',
  },
  en: {
    loan: 'Loan amount',
    rate: 'Current loan rate',
    rent: 'Monthly rent',
    other: 'Other monthly costs',
    otherHint: 'Management fees, property tax, etc. paid every month (optional)',
    mode: 'Repayment',
    interestOnly: 'Interest only',
    amortized: 'Principal + interest, 20 years',
    scenarioTitle: 'Your scenario',
    rateUp: 'Rate increase',
    vacancy: 'Vacancy per year',
    cBase: 'Today (no rate rise, no vacancy)',
    cScenario: 'Monthly cash flow in your scenario',
    cYear: 'Annual total',
    cWorst: 'Worst case (rate +3%p, 6 months vacant)',
    perMonth: 'monthly average',
    gridTitle: 'Monthly average cash flow',
    thRate: 'Rate ↓ / Vacancy →',
    colVacancy: (m) => (m === 0 ? 'No vacancy' : `${m} mo vacant`),
    rowRate: (p, r) => (p === 0 ? `Now ${r.toFixed(2)}%` : `+${p}%p → ${r.toFixed(2)}%`),
    ok: (v) => `Even in this scenario you keep ${v} every month.`,
    cover: (v, y) => `You would have to cover ${v} every month out of pocket (${y} per year).`,
    zeroLoan: 'With no loan, a rate increase has no effect.',
    formula: 'Monthly cash flow = rent × (12 − vacant months) ÷ 12 − monthly loan payment (at the higher rate) − other monthly costs',
    note: 'Shown as a monthly average (in a vacant month the real rent is zero). Taxes and deposit refunds are not included.',
  },
};

export default function StressTestCalculator() {
  const { lang, fmt } = useEstate();
  const t = text[lang];

  const [loan, setLoan] = useState(50000);
  const [rate, setRate] = useState(4.5);
  const [rent, setRent] = useState(400);
  const [other, setOther] = useState(0);
  const [mode, setMode] = useState('i');
  const [rateUp, setRateUp] = useState(1.5);
  const [vacancy, setVacancy] = useState(2);

  const flow = (up, vac) => (rent * (12 - vac)) / 12 - monthlyPayment(loan, rate + up, mode) - other;

  const base = flow(0, 0);
  const scenario = flow(rateUp, vacancy);
  const worst = flow(3, 6);

  const tone = (v) => (v < 0 ? 'neg' : 'pos');

  return (
    <div className="estate-calc">
      <Field id="st-loan" label={t.loan} unit="eok" value={loan} onChange={setLoan} slider={{ min: 0, max: 200000, step: 5000 }} />
      <Field id="st-rate" label={t.rate} unit="pct" value={rate} onChange={setRate} slider={{ min: 2, max: 8, step: 0.1 }} max={30} />
      <Field id="st-rent" label={t.rent} unit="man" value={rent} onChange={setRent} slider={{ min: 0, max: 2000, step: 10 }} />
      <Field id="st-other" label={t.other} unit="man" value={other} onChange={setOther} hint={t.otherHint} />
      <SelectField
        id="st-mode"
        label={t.mode}
        value={mode}
        onChange={setMode}
        options={[['i', t.interestOnly], ['a', t.amortized]]}
      />

      <div className="group-title">{t.scenarioTitle}</div>
      <Field id="st-up" label={t.rateUp} unit="pp" value={rateUp} onChange={setRateUp} slider={{ min: 0, max: 5, step: 0.25 }} max={20} />
      <Field id="st-vac" label={t.vacancy} unit="mo" value={vacancy} onChange={setVacancy} slider={{ min: 0, max: 12, step: 1 }} />

      <div className="cards">
        <Card label={t.cBase} value={fmt.money(base)} tone={tone(base)} sub={t.perMonth} />
        <Card hl label={t.cScenario} value={fmt.money(scenario)} tone={tone(scenario)} sub={`${t.cYear}: ${fmt.money(scenario * 12)}`} />
        <Card label={t.cWorst} value={fmt.money(worst)} tone={tone(worst)} sub={t.perMonth} />
      </div>

      <p className={`msg${scenario < 0 ? ' warn' : ''}`}>
        {scenario < 0 ? t.cover(fmt.money(-scenario), fmt.money(-scenario * 12)) : t.ok(fmt.money(scenario))}
        {loan <= 0 ? ` ${t.zeroLoan}` : ''}
      </p>

      <div className="group-title">{t.gridTitle}</div>
      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>{t.thRate}</th>
              {VACANCIES.map((m) => (
                <th key={m}>{t.colVacancy(m)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RATE_SHOCKS.map((p) => (
              <tr key={p}>
                <td>{t.rowRate(p, rate + p)}</td>
                {VACANCIES.map((m) => {
                  const v = flow(p, m);
                  return (
                    <td key={m} className={v < 0 ? 'neg' : 'pos'}>
                      {fmt.money(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="formula">{t.formula}</p>
      <p className="note">{t.note}</p>
    </div>
  );
}
