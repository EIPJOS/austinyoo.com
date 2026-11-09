import { useState } from 'react';
import { Card, Field } from './EstateKit.jsx';
import { useEstate } from './estateUtils.js';

const text = {
  ko: {
    na: '해당 없음',
    price: '매매가',
    deposit: '임차 보증금',
    depositHint: '세입자에게 받는 보증금만큼 내 돈이 덜 들어가요. (계약이 끝나면 돌려줘야 해요)',
    rent: '월세',
    loan: '대출금',
    rate: '대출 금리',
    cost: '취득 부대비용',
    costHint: '취득세(상가 약 4.6%) + 중개보수 + 법무사비 등을 합친 매매가 대비 비율',
    cCost: '취득 부대비용',
    cInvested: '실투자금',
    cAnnualRent: '연 월세',
    cAnnualInterest: '연 이자',
    cNetYear: '연 순수익 (세전)',
    cNetMonth: '월 순수익 (세전)',
    cYield: '실투자 수익률',
    cYieldSub: '내 돈 대비 1년에 버는 비율',
    compareTitle: '보증금 효과 비교',
    surface: '표면 수익률',
    surfaceSub: '연 월세 ÷ (매매가 − 보증금)',
    noDeposit: '보증금을 무시하고 계산하면',
    depositUp: (pp) => `보증금을 반영하면 수익률이 ${pp} 더 높아져요.`,
    depositDown: (pp) => `연 수익이 마이너스라서, 보증금으로 내 돈이 줄어들면 손실률은 ${pp} 더 커져요.`,
    formula: '실투자금 = 매매가 + 취득비용 − 대출금 − 보증금\n실투자 수익률 = (연 월세 − 연 이자) ÷ 실투자금',
    zero: '대출금과 보증금만으로 매입 비용을 모두 충당해서 실투자금이 0 이하예요. 이 경우 수익률은 정의할 수 없어요(사실상 무한대).',
    note: '이자만 내는 대출 기준이며, 재산세·관리비·수선비·소득세는 빠진 단순 계산이에요. 건물분 부가세는 일반과세자 등록 시 환급되지만 환급 전까지는 현금이 더 필요해요.',
  },
  en: {
    na: 'N/A',
    price: 'Purchase price',
    deposit: 'Tenant deposit',
    depositHint: "The tenant's deposit means less of your own cash goes in. (It must be returned when the lease ends.)",
    rent: 'Monthly rent',
    loan: 'Loan amount',
    rate: 'Loan interest rate',
    cost: 'Closing costs',
    costHint: 'Acquisition tax (about 4.6% for commercial property) + brokerage fee + legal fees, as a % of the price',
    cCost: 'Closing costs',
    cInvested: 'Cash invested',
    cAnnualRent: 'Annual rent',
    cAnnualInterest: 'Annual interest',
    cNetYear: 'Annual net income (pre-tax)',
    cNetMonth: 'Monthly net income (pre-tax)',
    cYield: 'Return on cash invested',
    cYieldSub: 'What you earn per year on your own money',
    compareTitle: 'What the deposit changes',
    surface: 'Gross yield',
    surfaceSub: 'annual rent ÷ (price − deposit)',
    noDeposit: 'If you ignored the deposit',
    depositUp: (pp) => `Counting the deposit raises the return by ${pp}.`,
    depositDown: (pp) => `Annual income is negative, so a deposit that shrinks your cash makes the loss rate ${pp} worse.`,
    formula:
      'Cash invested = price + closing costs − loan − deposit\nReturn on cash = (annual rent − annual interest) ÷ cash invested',
    zero: 'Your loan and the tenant deposit cover the whole purchase cost, so cash invested is zero or less. The return is undefined (effectively infinite).',
    note: 'Assumes an interest-only loan. Property tax, management fees, repairs, and income tax are not included. Input VAT on the building is refunded if you register as a general taxpayer, but you need the extra cash until then.',
  },
};

export default function InvestmentYieldCalculator() {
  const { lang, fmt } = useEstate();
  const t = text[lang];

  const [price, setPrice] = useState(100000); // 만원 (10억)
  const [deposit, setDeposit] = useState(10000); // 1억
  const [rent, setRent] = useState(400);
  const [loan, setLoan] = useState(50000); // 5억
  const [rate, setRate] = useState(4.5);
  const [costPct, setCostPct] = useState(5.5);

  const costs = (price * costPct) / 100;
  const invested = price + costs - loan - deposit;
  const annualRent = rent * 12;
  const annualInterest = (loan * rate) / 100;
  const netYear = annualRent - annualInterest;
  const real = invested > 0 ? (netYear / invested) * 100 : null;

  const surface = price - deposit > 0 ? (annualRent / (price - deposit)) * 100 : null;
  const noDepositBase = price + costs - loan;
  const noDeposit = noDepositBase > 0 ? (netYear / noDepositBase) * 100 : null;
  const effect = real !== null && noDeposit !== null ? real - noDeposit : null;

  return (
    <div className="estate-calc">
      <Field id="iy-price" label={t.price} unit="eok" value={price} onChange={setPrice} slider={{ min: 10000, max: 300000, step: 5000 }} min={1} />
      <Field id="iy-deposit" label={t.deposit} unit="eok" value={deposit} onChange={setDeposit} slider={{ min: 0, max: 50000, step: 1000 }} hint={t.depositHint} />
      <Field id="iy-rent" label={t.rent} unit="man" value={rent} onChange={setRent} slider={{ min: 0, max: 2000, step: 10 }} />
      <Field id="iy-loan" label={t.loan} unit="eok" value={loan} onChange={setLoan} slider={{ min: 0, max: 200000, step: 5000 }} />
      <Field id="iy-rate" label={t.rate} unit="pct" value={rate} onChange={setRate} slider={{ min: 2, max: 8, step: 0.1 }} max={30} />
      <Field id="iy-cost" label={t.cost} unit="pct" value={costPct} onChange={setCostPct} slider={{ min: 0, max: 10, step: 0.1 }} max={30} hint={t.costHint} />

      <div className="cards">
        <Card label={t.cCost} value={fmt.money(costs)} />
        <Card label={t.cInvested} value={fmt.money(invested)} tone={invested <= 0 ? 'neg' : ''} />
        <Card label={t.cAnnualRent} value={fmt.money(annualRent)} />
        <Card label={t.cAnnualInterest} value={fmt.money(annualInterest)} />
        <Card label={t.cNetYear} value={fmt.money(netYear)} tone={netYear < 0 ? 'neg' : 'pos'} />
        <Card label={t.cNetMonth} value={fmt.money(netYear / 12)} tone={netYear < 0 ? 'neg' : 'pos'} />
      </div>

      <div className="cards">
        <Card
          hl
          label={t.cYield}
          value={real === null ? t.na : fmt.pct(real)}
          sub={t.cYieldSub}
          tone={real !== null && real < 0 ? 'neg' : ''}
        />
      </div>

      {real === null ? (
        <p className="msg warn">{t.zero}</p>
      ) : (
        <>
          <div className="group-title">{t.compareTitle}</div>
          <div className="cards" style={{ marginTop: 6 }}>
            <Card label={t.surface} value={surface === null ? t.na : fmt.pct(surface)} sub={t.surfaceSub} />
            <Card label={t.noDeposit} value={noDeposit === null ? t.na : fmt.pct(noDeposit)} />
          </div>
          {effect !== null && (
            <p className="msg">
              {effect >= 0 ? t.depositUp(`${effect.toFixed(2)}%p`) : t.depositDown(`${Math.abs(effect).toFixed(2)}%p`)}
            </p>
          )}
        </>
      )}

      <p className="formula" style={{ whiteSpace: 'pre-line' }}>{t.formula}</p>
      <p className="note">{t.note}</p>
    </div>
  );
}
