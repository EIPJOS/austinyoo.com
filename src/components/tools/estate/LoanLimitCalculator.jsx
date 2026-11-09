import { useState } from 'react';
import { Card, Field } from './EstateKit.jsx';
import { useEstate } from './estateUtils.js';

const text = {
  ko: {
    na: '해당 없음',
    appraisal: '감정가',
    appraisalHint: '은행 감정평가액 기준이에요. 매매가와 다를 수 있어요.',
    ltv: '적용 LTV',
    rent: '월세 (임대수입)',
    rate: '심사용 금리',
    rateHint: '은행이 한도를 심사할 때 쓰는 금리예요. 실제 대출 금리보다 높게 적용될 수 있어요.',
    rti: 'RTI 기준',
    rtiHint: 'RTI = 연 임대소득 ÷ 연 이자비용. 보통 1.5배 이상을 요구해요.',
    barLtv: 'LTV 한도',
    barRti: 'RTI 한도',
    barFinal: '최종 한도',
    cFinal: '최종 대출 한도',
    cFinalSub: '두 한도 중 작은 값',
    cBinding: '한도를 막는 조건',
    bindLtv: 'LTV',
    bindRti: 'RTI',
    bindSame: 'LTV = RTI',
    cInterest: '한도 대출의 월 이자',
    cNeedRent: 'LTV 한도 전액을 받으려면 필요한 월세',
    cRtiAtLtv: 'LTV 한도 전액 대출 시 RTI',
    msgLtv: 'LTV가 한도를 정해요. 월세가 충분해서 RTI는 여유가 있어요.',
    msgRti: (need) => `RTI가 한도를 정해요. LTV 한도만큼 빌리려면 월세가 ${need}은 되어야 해요.`,
    msgNoRent: '월세가 0이면 RTI 기준 한도도 0이 돼요.',
    formula: '최종 한도 = min(감정가 × LTV, (연 월세 ÷ RTI) ÷ 심사용 금리)',
    note: '단순 시뮬레이션이에요. 실제 한도는 은행, 지역, 상품, 차주 DSR, 최우선변제 소액임차보증금 공제 등에 따라 달라요.',
  },
  en: {
    na: 'N/A',
    appraisal: 'Appraised value',
    appraisalHint: "Based on the bank's appraisal, which can differ from the purchase price.",
    ltv: 'LTV applied',
    rent: 'Monthly rent',
    rate: 'Underwriting rate',
    rateHint: 'The rate the bank uses to size the loan. It can be higher than your actual loan rate.',
    rti: 'RTI requirement',
    rtiHint: 'RTI = annual rental income ÷ annual interest cost. Banks typically require 1.5× or more.',
    barLtv: 'LTV limit',
    barRti: 'RTI limit',
    barFinal: 'Final limit',
    cFinal: 'Maximum loan',
    cFinalSub: 'The smaller of the two limits',
    cBinding: 'What is capping the loan',
    bindLtv: 'LTV',
    bindRti: 'RTI',
    bindSame: 'LTV = RTI',
    cInterest: 'Monthly interest at the limit',
    cNeedRent: 'Rent needed to borrow the full LTV amount',
    cRtiAtLtv: 'RTI if you borrow the full LTV amount',
    msgLtv: 'LTV sets the limit. Rent is high enough that RTI has room to spare.',
    msgRti: (need) => `RTI sets the limit. To borrow the full LTV amount, rent would need to be at least ${need}.`,
    msgNoRent: 'With zero rent, the RTI-based limit is also zero.',
    formula: 'Maximum loan = min(appraised value × LTV, (annual rent ÷ RTI) ÷ underwriting rate)',
    note: 'A simplified simulation. The real limit depends on the bank, region, product, your DSR, and deductions such as senior-priority small tenant deposits.',
  },
};

export default function LoanLimitCalculator() {
  const { lang, fmt } = useEstate();
  const t = text[lang];

  const [appraisal, setAppraisal] = useState(100000);
  const [ltv, setLtv] = useState(60);
  const [rent, setRent] = useState(400);
  const [rate, setRate] = useState(4.5);
  const [rti, setRti] = useState(1.5);

  const ltvLimit = (appraisal * ltv) / 100;
  const annualRent = rent * 12;
  const rateDec = rate / 100;
  const rtiLimit = rti > 0 && rateDec > 0 ? annualRent / rti / rateDec : ltvLimit; // no rate/RTI -> no RTI cap
  const finalLimit = Math.max(0, Math.min(ltvLimit, rtiLimit));
  const bindingLtv = ltvLimit <= rtiLimit;
  const same = Math.abs(ltvLimit - rtiLimit) < 0.5;

  const monthlyInterest = (finalLimit * rateDec) / 12;
  const needRent = (ltvLimit * rateDec * rti) / 12;
  const rtiAtLtv = ltvLimit * rateDec > 0 ? annualRent / (ltvLimit * rateDec) : Infinity;

  const maxBar = Math.max(ltvLimit, rtiLimit, 1);
  const pctOf = (v) => `${Math.max(0, (v / maxBar) * 100)}%`;

  let message;
  if (rent <= 0) message = t.msgNoRent;
  else if (bindingLtv) message = t.msgLtv;
  else message = t.msgRti(fmt.money(needRent));

  return (
    <div className="estate-calc">
      <Field id="ll-appraisal" label={t.appraisal} unit="eok" value={appraisal} onChange={setAppraisal} slider={{ min: 10000, max: 300000, step: 5000 }} min={1} hint={t.appraisalHint} />
      <Field id="ll-ltv" label={t.ltv} unit="pct" value={ltv} onChange={setLtv} slider={{ min: 0, max: 80, step: 5 }} max={100} />
      <Field id="ll-rent" label={t.rent} unit="man" value={rent} onChange={setRent} slider={{ min: 0, max: 2000, step: 10 }} />
      <Field id="ll-rate" label={t.rate} unit="pct" value={rate} onChange={setRate} slider={{ min: 2, max: 10, step: 0.1 }} max={30} hint={t.rateHint} />
      <Field id="ll-rti" label={t.rti} unit="x" value={rti} onChange={setRti} slider={{ min: 1, max: 3, step: 0.1 }} min={0.1} max={20} hint={t.rtiHint} />

      <div className="bars">
        <div className="bar-row">
          <span>{t.barLtv}</span>
          <div className="bar-track"><div className="bar-fill" style={{ width: pctOf(ltvLimit) }} /></div>
          <span className="bar-val">{fmt.money(ltvLimit)}</span>
        </div>
        <div className="bar-row">
          <span>{t.barRti}</span>
          <div className="bar-track"><div className="bar-fill" style={{ width: pctOf(rtiLimit) }} /></div>
          <span className="bar-val">{fmt.money(rtiLimit)}</span>
        </div>
        <div className="bar-row">
          <span>{t.barFinal}</span>
          <div className="bar-track"><div className="bar-fill final" style={{ width: pctOf(finalLimit) }} /></div>
          <span className="bar-val">{fmt.money(finalLimit)}</span>
        </div>
      </div>

      <div className="cards">
        <Card hl label={t.cFinal} value={fmt.money(finalLimit)} sub={t.cFinalSub} />
        <Card label={t.cBinding} value={same ? t.bindSame : bindingLtv ? t.bindLtv : t.bindRti} />
        <Card label={t.cInterest} value={fmt.money(monthlyInterest)} />
        <Card label={t.cNeedRent} value={fmt.money(needRent)} />
        <Card
          label={t.cRtiAtLtv}
          value={Number.isFinite(rtiAtLtv) ? fmt.times(rtiAtLtv) : t.na}
          tone={Number.isFinite(rtiAtLtv) && rtiAtLtv < rti ? 'neg' : ''}
        />
      </div>

      <p className={`msg${bindingLtv ? '' : ' warn'}`}>{message}</p>
      <p className="formula">{t.formula}</p>
      <p className="note">{t.note}</p>
    </div>
  );
}
