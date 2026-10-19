import { useState } from 'react';
import './loanCalc.css';

const fmt = (n) => Math.round(n).toLocaleString('ko-KR') + '만';

function Slider({ id, label, min, max, step, value, onChange, display }) {
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
        onChange={(e) => onChange(+e.target.value)}
      />
      <span>{display}</span>
    </div>
  );
}

export default function CommercialLoanCalculator() {
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
    msg = '월세가 이자의 1.5배가 안 돼서, 이 조건이면 은행이 대출 한도를 줄일 가능성이 커요.';
  } else if (left < 0) {
    msg = '월세로 은행 돈을 다 못 내요. 모자란 ' + fmt(-left) + '원을 매달 내 주머니에서 내야 해요.';
  } else {
    msg = '월세로 은행 돈을 내고도 매달 ' + fmt(left) + '원이 남아요. 공실 슬라이더를 올려 보세요.';
  }

  return (
    <div className="loan-calc">
      <h2 className="sr-only">
        상가를 대출로 사서 월세로 대출을 갚는 구조를 보여주고, 조건을 바꾸면 매달 남는 돈이 계산되는 그림
      </h2>
      <svg width="100%" viewBox="0 0 680 170" role="img">
        <title>상가 대출 투자 구조</title>
        <desc>
          내 돈과 은행 대출로 상가를 사고, 임차인 월세로 은행 이자와 원금을 갚고 남는 돈이 내 수익이 되는 흐름
        </desc>
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
          <text className="th" x="80" y="38" textAnchor="middle" dominantBaseline="central">내 돈</text>
          <text className="ts" x="80" y="56" textAnchor="middle" dominantBaseline="central">자기자본+세금</text>
        </g>
        <g className="c-purple">
          <rect x="20" y="100" width="120" height="50" rx="8" strokeWidth="0.5" />
          <text className="th" x="80" y="118" textAnchor="middle" dominantBaseline="central">은행 대출</text>
          <text className="ts" x="80" y="136" textAnchor="middle" dominantBaseline="central">LTV·RTI 심사</text>
        </g>
        <g className="c-gray">
          <rect x="200" y="60" width="120" height="50" rx="8" strokeWidth="0.5" />
          <text className="th" x="260" y="78" textAnchor="middle" dominantBaseline="central">상가 매수</text>
          <text className="ts" x="260" y="96" textAnchor="middle" dominantBaseline="central">임장으로 고르기</text>
        </g>
        <g className="c-teal">
          <rect x="380" y="60" width="120" height="50" rx="8" strokeWidth="0.5" />
          <text className="th" x="440" y="78" textAnchor="middle" dominantBaseline="central">임차인 월세</text>
          <text className="ts" x="440" y="96" textAnchor="middle" dominantBaseline="central">공실이면 0원</text>
        </g>
        <g className="c-purple">
          <rect x="550" y="20" width="110" height="50" rx="8" strokeWidth="0.5" />
          <text className="th" x="605" y="38" textAnchor="middle" dominantBaseline="central">이자+원금</text>
          <text className="ts" x="605" y="56" textAnchor="middle" dominantBaseline="central">은행으로</text>
        </g>
        <g className="c-teal">
          <rect x="550" y="100" width="110" height="50" rx="8" strokeWidth="0.5" />
          <text className="th" x="605" y="118" textAnchor="middle" dominantBaseline="central">남는 돈</text>
          <text className="ts" x="605" y="136" textAnchor="middle" dominantBaseline="central">내 수익</text>
        </g>
        <path d="M140 45 L170 45 L170 75 L198 75" className="arr" markerEnd="url(#loan-arrow)" />
        <path d="M140 125 L170 125 L170 95 L198 95" className="arr" markerEnd="url(#loan-arrow)" />
        <line x1="320" y1="85" x2="378" y2="85" className="arr" markerEnd="url(#loan-arrow)" />
        <path d="M500 75 L525 75 L525 45 L548 45" className="arr" markerEnd="url(#loan-arrow)" />
        <path d="M500 95 L525 95 L525 125 L548 125" className="arr" markerEnd="url(#loan-arrow)" />
      </svg>

      <div style={{ marginTop: '1rem' }}>
        <Slider id="p" label="상가 가격" min={1} max={20} step={0.5} value={price} onChange={setPrice} display={price + '억'} />
        <Slider id="l" label="대출 비율(LTV)" min={0} max={80} step={5} value={ltv} onChange={setLtv} display={ltv + '%'} />
        <Slider id="y" label="임대 수익률" min={2} max={9} step={0.1} value={yieldPct} onChange={setYieldPct} display={yieldPct.toFixed(1) + '%'} />
        <Slider id="r" label="대출 금리" min={2} max={8} step={0.1} value={rate} onChange={setRate} display={rate.toFixed(1) + '%'} />
        <Slider id="v" label="1년 중 공실" min={0} max={6} step={1} value={vacancy} onChange={setVacancy} display={vacancy + '개월'} />
        <div className="row">
          <label htmlFor="m">상환 방식</label>
          <select id="m" style={{ flex: 1 }} value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="i">이자만 내기</option>
            <option value="a">원금까지 20년 상환</option>
          </select>
        </div>
      </div>

      <div style={{ margin: '1rem 0 6px', fontSize: 13, color: 'var(--text-secondary)' }}>
        월세 한 달치가 어디로 가나
      </div>
      <div className="bar">
        <div style={{ width: w(Math.min(int, rent)), background: '#CECBF6', color: '#3C3489' }}>이자</div>
        {prin > 0 && (
          <div style={{ width: w(Math.min(prin, Math.max(0, rent - int))), background: '#AFA9EC', color: '#26215C' }}>
            원금
          </div>
        )}
        {left > 0 ? (
          <div style={{ width: w(left), background: '#9FE1CB', color: '#085041' }}>남는 돈</div>
        ) : (
          <div style={{ width: w(-left), background: '#F7C1C1', color: '#791F1F' }}>내 돈으로 메움</div>
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
        <div className="mc"><p>월세(공실 반영)</p><b>{fmt(rent)}</b></div>
        <div className="mc"><p>은행에 낼 돈/월</p><b>{fmt(pay)}</b></div>
        <div className="mc">
          <p>매달 남는 돈</p>
          <b style={{ color: left < 0 ? 'var(--text-danger)' : 'var(--text-success)' }}>{fmt(left)}</b>
        </div>
        <div className="mc">
          <p>RTI (1.5배 이상 필요)</p>
          <b style={{ color: rti < 1.5 ? 'var(--text-danger)' : 'var(--text-primary)' }}>
            {isFinite(rti) ? rti.toFixed(2) + '배' : '대출 없음'}
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
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '6px 0 0' }}>
        재산세, 관리비, 수선비, 소득세는 빠진 단순 계산이에요. 실제로 남는 돈은 이보다 적어요.
      </p>
    </div>
  );
}
