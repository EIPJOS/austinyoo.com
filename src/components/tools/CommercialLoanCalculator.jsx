import { useEffect, useState } from 'react';
import { useLang } from '../../i18n/index.js';
import './loanCalc.css';

// All money inside the calculator is in units of 만원 (10,000 KRW).
// Korean shows it as-is ("208만"); English converts to millions of KRW ("₩2.08M").
const formatters = {
  ko: (n) => Math.round(n).toLocaleString('ko-KR') + '만',
  en: (n) => {
    const m = Math.abs(n) / 100;
    return `${n < 0 ? '-' : ''}₩${m.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
  },
};

const text = {
  ko: {
    srTitle: '상가를 대출로 사서 월세로 대출을 갚는 구조를 보여주고, 조건을 바꾸면 매달 남는 돈이 계산되는 그림',
    svgTitle: '상가 대출 투자 구조',
    svgDesc: '내 돈과 은행 대출로 상가를 사고, 임차인 월세로 은행 이자와 원금을 갚고 남는 돈이 내 수익이 되는 흐름',
    diagram: {
      myMoney: ['내 돈', '자기자본+세금'],
      bankLoan: ['은행 대출', 'LTV·RTI 심사'],
      buy: ['상가 매수', '임장으로 고르기'],
      rent: ['임차인 월세', '공실이면 0원'],
      repay: ['이자+원금', '은행으로'],
      left: ['남는 돈', '내 수익'],
    },
    price: '상가 가격',
    ltv: '대출 비율(LTV)',
    yield: '임대 수익률',
    rate: '대출 금리',
    vacancy: '1년 중 공실',
    repayment: '상환 방식',
    interestOnly: '이자만 내기',
    amortized: '원금까지 20년 상환',
    units: {
      price: { suffix: '억', scale: 1, min: 0.01, max: 200 },
      percent: { suffix: '%', scale: 1 },
      months: { suffix: '개월', scale: 1, min: 0, max: 12 },
    },
    barTitle: '월세 한 달치가 어디로 가나',
    barInterest: '이자',
    barPrincipal: '원금',
    barLeft: '남는 돈',
    barCovered: '내 돈으로 메움',
    cardRent: '월세(공실 반영)',
    cardPay: '은행에 낼 돈/월',
    cardLeft: '매달 남는 돈',
    cardRti: 'RTI (1.5배 이상 필요)',
    rtiValue: (x) => `${x.toFixed(2)}배`,
    noLoan: '대출 없음',
    msgLowRti: '월세가 이자의 1.5배가 안 돼서, 이 조건이면 은행이 대출 한도를 줄일 가능성이 커요.',
    msgShort: (amount) => `월세로 은행 돈을 다 못 내요. 모자란 ${amount}원을 매달 내 주머니에서 내야 해요.`,
    msgOk: (amount) => `월세로 은행 돈을 내고도 매달 ${amount}원이 남아요. 공실 슬라이더를 올려 보세요.`,
    footnote: '재산세, 관리비, 수선비, 소득세는 빠진 단순 계산이에요. 실제로 남는 돈은 이보다 적어요.',
  },
  en: {
    srTitle:
      'A diagram showing a commercial property bought with a loan and the loan repaid from rent, with the monthly leftover recalculated as you change the conditions',
    svgTitle: 'Commercial property loan investment structure',
    svgDesc:
      'You buy a commercial property with your own money and a bank loan; tenant rent pays the bank interest and principal, and what is left is your profit',
    diagram: {
      myMoney: ['Your money', 'equity + taxes'],
      bankLoan: ['Bank loan', 'LTV · RTI review'],
      buy: ['Buy property', 'pick via site visits'],
      rent: ['Tenant rent', '0 if vacant'],
      repay: ['Loan payment', 'to the bank'],
      left: ['Left over', 'your profit'],
    },
    price: 'Property price',
    ltv: 'Loan-to-value (LTV)',
    yield: 'Rental yield',
    rate: 'Loan interest rate',
    vacancy: 'Vacancy per year',
    repayment: 'Repayment',
    interestOnly: 'Interest only',
    amortized: 'Principal + interest, 20 years',
    // internally the price is stored in 억 (100M KRW); English users type millions of won
    units: {
      price: { prefix: '₩', suffix: 'M', scale: 100, min: 1, max: 20000 },
      percent: { suffix: '%', scale: 1 },
      months: { suffix: 'mo', scale: 1, min: 0, max: 12 },
    },
    barTitle: 'Where one month of rent goes',
    barInterest: 'Interest',
    barPrincipal: 'Principal',
    barLeft: 'Left over',
    barCovered: 'Covered by you',
    cardRent: 'Rent (after vacancy)',
    cardPay: 'Paid to the bank / month',
    cardLeft: 'Left over / month',
    cardRti: 'RTI (needs 1.5× or more)',
    rtiValue: (x) => `${x.toFixed(2)}×`,
    noLoan: 'No loan',
    msgLowRti:
      'Rent is less than 1.5× the interest, so under these conditions the bank is likely to reduce your loan limit.',
    msgShort: (amount) =>
      `Rent does not cover the bank payment. You would have to cover the ${amount} shortfall out of pocket every month.`,
    msgOk: (amount) =>
      `Rent covers the bank payment and leaves ${amount} every month. Try raising the vacancy slider.`,
    footnote:
      'A simplified calculation: property tax, management fees, repairs, and income tax are not included, so the real amount left over is lower. Amounts are in Korean won (₩); M = million.',
  },
};

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Text input with up to 2 decimals, kept in sync with its slider.
 * `scale` converts between the stored value and what the user sees (e.g. 억 -> ₩M).
 * Values typed outside the slider's range are allowed up to `min`/`max`.
 */
function NumberField({ label, value, onChange, unit, min, max, resetKey }) {
  const { scale = 1, prefix = '', suffix = '' } = unit;
  const [draft, setDraft] = useState(null); // null = not editing, show the live value

  // Moving the slider always wins over a half-typed value (on touch devices the text
  // field may keep focus while the slider is dragged).
  useEffect(() => {
    setDraft(null);
  }, [resetKey]);
  const shown = draft ?? String(round2(value * scale));

  const handleChange = (e) => {
    const v = e.target.value;
    if (!/^\d{0,6}(\.\d{0,2})?$/.test(v)) return; // digits with at most 2 decimals
    setDraft(v);
    const n = parseFloat(v);
    if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n)) / scale);
  };

  return (
    <span className="num">
      <em className="pre">{prefix}</em>
      <input
        type="text"
        inputMode="decimal"
        aria-label={label}
        value={shown}
        onChange={handleChange}
        onFocus={(e) => e.target.select()}
        onBlur={() => setDraft(null)}
      />
      <em className="suf">{suffix}</em>
    </span>
  );
}

function Slider({ id, label, min, max, step, value, onChange, unit, inputMin, inputMax }) {
  const scale = unit.scale || 1;
  const [dragTick, setDragTick] = useState(0);
  return (
    <div className="row">
      <label htmlFor={id}>{label}</label>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          setDragTick((n) => n + 1);
          onChange(+e.target.value);
        }}
      />
      <NumberField
        resetKey={dragTick}
        label={label}
        value={value}
        onChange={onChange}
        unit={unit}
        min={inputMin ?? unit.min ?? min * scale}
        max={inputMax ?? unit.max ?? max * scale}
      />
    </div>
  );
}

export default function CommercialLoanCalculator() {
  const lang = useLang();
  const t = text[lang];
  const fmt = formatters[lang];
  const [price, setPrice] = useState(5); // 억
  const [ltv, setLtv] = useState(60); // %
  const [yieldPct, setYieldPct] = useState(5); // %
  const [rate, setRate] = useState(4.5); // %
  const [vacancy, setVacancy] = useState(0); // 개월
  const [mode, setMode] = useState('i'); // i: 이자만, a: 원금균등 20년

  const P = price * 10000;
  const L = ltv / 100;
  const Y = yieldPct / 100;
  const R = rate / 100;

  const rentFull = (P * Y) / 12;
  const rent = (rentFull * (12 - vacancy)) / 12;
  const loan = P * L;
  const i = R / 12;
  const int = loan * i;
  let pay = int;
  if (mode === 'a' && loan > 0) pay = (loan * i) / (1 - Math.pow(1 + i, -240));
  const prin = pay - int;
  const left = rent - pay;
  const rti = int > 0 ? rentFull / int : Infinity;

  const tot = Math.max(rent, pay) || 1;
  const w = (x) => Math.max(0, (x / tot) * 100) + '%';

  let msg;
  if (rti < 1.5) {
    msg = t.msgLowRti;
  } else if (left < 0) {
    msg = t.msgShort(fmt(-left));
  } else {
    msg = t.msgOk(fmt(left));
  }

  const d = t.diagram;

  return (
    <div className="loan-calc">
      <h2 className="sr-only">{t.srTitle}</h2>
      <svg width="100%" viewBox="0 0 680 170" role="img">
        <title>{t.svgTitle}</title>
        <desc>{t.svgDesc}</desc>
        <defs>
          <marker
            id="loan-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path
              d="M2 1L8 5L2 9"
              fill="none"
              stroke="context-stroke"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>
        <g className="c-gray">
          <rect x="20" y="20" width="120" height="50" rx="8" strokeWidth="0.5" />
          <text className="th" x="80" y="38" textAnchor="middle" dominantBaseline="central">{d.myMoney[0]}</text>
          <text className="ts" x="80" y="56" textAnchor="middle" dominantBaseline="central">{d.myMoney[1]}</text>
        </g>
        <g className="c-purple">
          <rect x="20" y="100" width="120" height="50" rx="8" strokeWidth="0.5" />
          <text className="th" x="80" y="118" textAnchor="middle" dominantBaseline="central">{d.bankLoan[0]}</text>
          <text className="ts" x="80" y="136" textAnchor="middle" dominantBaseline="central">{d.bankLoan[1]}</text>
        </g>
        <g className="c-gray">
          <rect x="200" y="60" width="120" height="50" rx="8" strokeWidth="0.5" />
          <text className="th" x="260" y="78" textAnchor="middle" dominantBaseline="central">{d.buy[0]}</text>
          <text className="ts" x="260" y="96" textAnchor="middle" dominantBaseline="central">{d.buy[1]}</text>
        </g>
        <g className="c-teal">
          <rect x="380" y="60" width="120" height="50" rx="8" strokeWidth="0.5" />
          <text className="th" x="440" y="78" textAnchor="middle" dominantBaseline="central">{d.rent[0]}</text>
          <text className="ts" x="440" y="96" textAnchor="middle" dominantBaseline="central">{d.rent[1]}</text>
        </g>
        <g className="c-purple">
          <rect x="550" y="20" width="110" height="50" rx="8" strokeWidth="0.5" />
          <text className="th" x="605" y="38" textAnchor="middle" dominantBaseline="central">{d.repay[0]}</text>
          <text className="ts" x="605" y="56" textAnchor="middle" dominantBaseline="central">{d.repay[1]}</text>
        </g>
        <g className="c-teal">
          <rect x="550" y="100" width="110" height="50" rx="8" strokeWidth="0.5" />
          <text className="th" x="605" y="118" textAnchor="middle" dominantBaseline="central">{d.left[0]}</text>
          <text className="ts" x="605" y="136" textAnchor="middle" dominantBaseline="central">{d.left[1]}</text>
        </g>
        <path d="M140 45 L170 45 L170 75 L198 75" className="arr" markerEnd="url(#loan-arrow)" />
        <path d="M140 125 L170 125 L170 95 L198 95" className="arr" markerEnd="url(#loan-arrow)" />
        <line x1="320" y1="85" x2="378" y2="85" className="arr" markerEnd="url(#loan-arrow)" />
        <path d="M500 75 L525 75 L525 45 L548 45" className="arr" markerEnd="url(#loan-arrow)" />
        <path d="M500 95 L525 95 L525 125 L548 125" className="arr" markerEnd="url(#loan-arrow)" />
      </svg>

      <div style={{ marginTop: '1rem' }}>
        <Slider id="p" label={t.price} min={1} max={20} step={0.5} value={price} onChange={setPrice} unit={t.units.price} />
        <Slider id="l" label={t.ltv} min={0} max={80} step={5} value={ltv} onChange={setLtv} unit={t.units.percent} inputMin={0} inputMax={100} />
        <Slider id="y" label={t.yield} min={2} max={9} step={0.1} value={yieldPct} onChange={setYieldPct} unit={t.units.percent} inputMin={0} inputMax={30} />
        <Slider id="r" label={t.rate} min={2} max={8} step={0.1} value={rate} onChange={setRate} unit={t.units.percent} inputMin={0} inputMax={30} />
        <Slider id="v" label={t.vacancy} min={0} max={6} step={1} value={vacancy} onChange={setVacancy} unit={t.units.months} />
        <div className="row">
          <label htmlFor="m">{t.repayment}</label>
          <select id="m" style={{ flex: 1 }} value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="i">{t.interestOnly}</option>
            <option value="a">{t.amortized}</option>
          </select>
        </div>
      </div>

      <div style={{ margin: '1rem 0 6px', fontSize: 13, color: 'var(--text-secondary)' }}>
        {t.barTitle}
      </div>
      <div className="bar">
        <div style={{ width: w(Math.min(int, rent)), background: '#CECBF6', color: '#3C3489' }}>{t.barInterest}</div>
        {prin > 0 && (
          <div style={{ width: w(Math.min(prin, Math.max(0, rent - int))), background: '#AFA9EC', color: '#26215C' }}>
            {t.barPrincipal}
          </div>
        )}
        {left > 0 ? (
          <div style={{ width: w(left), background: '#9FE1CB', color: '#085041' }}>{t.barLeft}</div>
        ) : (
          <div style={{ width: w(-left), background: '#F7C1C1', color: '#791F1F' }}>{t.barCovered}</div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
          gap: 10,
          marginTop: '1rem',
        }}
      >
        <div className="mc"><p>{t.cardRent}</p><b>{fmt(rent)}</b></div>
        <div className="mc"><p>{t.cardPay}</p><b>{fmt(pay)}</b></div>
        <div className="mc">
          <p>{t.cardLeft}</p>
          <b style={{ color: left < 0 ? 'var(--text-danger)' : 'var(--text-success)' }}>{fmt(left)}</b>
        </div>
        <div className="mc">
          <p>{t.cardRti}</p>
          <b style={{ color: rti < 1.5 ? 'var(--text-danger)' : 'var(--text-primary)' }}>
            {isFinite(rti) ? t.rtiValue(rti) : t.noLoan}
          </b>
        </div>
      </div>
      <p
        style={{
          fontSize: 13,
          margin: '10px 0 0',
          color: rti < 1.5 || left < 0 ? 'var(--text-danger)' : 'var(--text-secondary)',
        }}
      >
        {msg}
      </p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '6px 0 0' }}>{t.footnote}</p>
    </div>
  );
}
