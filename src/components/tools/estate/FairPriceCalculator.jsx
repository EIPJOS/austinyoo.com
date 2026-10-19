import { useState } from 'react';
import { Card, Field } from './EstateKit.jsx';
import { useEstate } from './estateUtils.js';

const text = {
  ko: {
    rent: '월세',
    deposit: '임차 보증금',
    target: '목표 수익률',
    targetHint: '수익률 = 연 월세 ÷ (매매가 − 보증금)',
    cost: '취득 부대비용',
    cSimple: '단순 계산',
    cSimpleSub: '연 월세 ÷ 목표 수익률',
    cDeposit: '보증금 반영',
    cDepositSub: '+ 보증금',
    cFull: '적정 매입가',
    cFullSub: '보증금 + 취득비용 반영 (이 가격 이하로 사세요)',
    tableTitle: '목표 수익률별 적정 매입가',
    thTarget: '목표 수익률',
    thSimple: '단순',
    thDeposit: '보증금 반영',
    thFull: '보증금+취득비용 반영',
    zero: '목표 수익률은 0보다 커야 해요.',
    formula:
      '단순: 연 월세 ÷ 목표 수익률\n보증금 반영: 단순 + 보증금\n보증금+취득비용 반영: (단순 + 보증금) ÷ (1 + 취득비용 비율)',
    note: '세금, 관리비, 공실은 반영하지 않았어요. 공실을 감안하려면 월세를 낮춰 입력해 보세요.',
  },
  en: {
    rent: 'Monthly rent',
    deposit: 'Tenant deposit',
    target: 'Target yield',
    targetHint: 'Yield = annual rent ÷ (price − deposit)',
    cost: 'Closing costs',
    cSimple: 'Simple',
    cSimpleSub: 'annual rent ÷ target yield',
    cDeposit: 'With deposit',
    cDepositSub: '+ deposit',
    cFull: 'Fair purchase price',
    cFullSub: 'Including deposit and closing costs (pay no more than this)',
    tableTitle: 'Fair price by target yield',
    thTarget: 'Target yield',
    thSimple: 'Simple',
    thDeposit: 'With deposit',
    thFull: 'With deposit + costs',
    zero: 'The target yield must be greater than 0.',
    formula:
      'Simple: annual rent ÷ target yield\nWith deposit: simple + deposit\nWith deposit + costs: (simple + deposit) ÷ (1 + closing cost %)',
    note: 'Taxes, management fees, and vacancy are not included. To allow for vacancy, enter a lower rent.',
  },
};

export default function FairPriceCalculator() {
  const { lang, fmt } = useEstate();
  const t = text[lang];

  const [rent, setRent] = useState(400);
  const [deposit, setDeposit] = useState(10000);
  const [target, setTarget] = useState(6);
  const [costPct, setCostPct] = useState(5.5);

  const annualRent = rent * 12;
  const calc = (y) => {
    const simple = annualRent / (y / 100);
    const withDeposit = simple + deposit;
    return { simple, withDeposit, full: withDeposit / (1 + costPct / 100) };
  };

  const valid = target > 0;
  const main = valid ? calc(target) : null;
  const rows = [-1, 0, 1, 2]
    .map((d) => Math.round((target + d) * 100) / 100)
    .filter((y) => y > 0)
    .map((y) => ({ y, ...calc(y), cur: y === Math.round(target * 100) / 100 }));

  return (
    <div className="estate-calc">
      <Field id="fp-rent" label={t.rent} unit="man" value={rent} onChange={setRent} slider={{ min: 0, max: 2000, step: 10 }} />
      <Field id="fp-deposit" label={t.deposit} unit="eok" value={deposit} onChange={setDeposit} slider={{ min: 0, max: 50000, step: 1000 }} />
      <Field id="fp-target" label={t.target} unit="pct" value={target} onChange={setTarget} slider={{ min: 2, max: 12, step: 0.1 }} max={50} hint={t.targetHint} />
      <Field id="fp-cost" label={t.cost} unit="pct" value={costPct} onChange={setCostPct} slider={{ min: 0, max: 10, step: 0.1 }} max={30} />

      {valid ? (
        <>
          <div className="cards">
            <Card label={t.cSimple} value={fmt.money(main.simple)} sub={t.cSimpleSub} />
            <Card label={t.cDeposit} value={fmt.money(main.withDeposit)} sub={t.cDepositSub} />
            <Card hl label={t.cFull} value={fmt.money(main.full)} sub={t.cFullSub} />
          </div>

          <div className="group-title">{t.tableTitle}</div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t.thTarget}</th>
                  <th>{t.thSimple}</th>
                  <th>{t.thDeposit}</th>
                  <th>{t.thFull}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.y} className={r.cur ? 'cur-row' : ''}>
                    <td>{fmt.pct(r.y)}</td>
                    <td>{fmt.money(r.simple)}</td>
                    <td>{fmt.money(r.withDeposit)}</td>
                    <td className={r.cur ? 'cur' : ''}>{fmt.money(r.full)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="msg warn">{t.zero}</p>
      )}

      <p className="formula" style={{ whiteSpace: 'pre-line' }}>{t.formula}</p>
      <p className="note">{t.note}</p>
    </div>
  );
}
