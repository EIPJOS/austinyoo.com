import { useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '../../i18n/index.js';
import './loanPaymentCalc.css';

const text = {
  en: {
    heading: 'Loan Calculator',
    na: 'N/A',
    amount: 'Loan amount',
    term: 'Loan term',
    months: 'Months',
    years: 'Years',
    rate: 'Interest rate (%)',
    extra: 'Optional extra monthly payment',
    calculate: 'Calculate',
    error: 'Please enter a loan amount and term greater than 0.',
    monthly: 'Estimated monthly payment',
    principalPaid: 'Total loan amount paid',
    totalCost: 'Total cost of loan',
    interestPaid: 'Total interest paid',
    payoff: 'Payoff date',
    schedule: 'Amortization Schedule',
    lastPayment: 'Last payment:',
    thYear: 'Year',
    thPayment: 'Your payment',
    thPrincipal: 'Principal paid',
    thInterest: 'Interest paid',
    thTotalInterest: 'Total interest paid',
    thBalance: 'Balance',
    exportCsv: 'Export as CSV',
    print: 'Print-friendly version',
    locale: 'en-US',
  },
  ko: {
    heading: '대출 계산기',
    na: '해당 없음',
    amount: '대출 금액',
    term: '대출 기간',
    months: '개월',
    years: '년',
    rate: '금리(%)',
    extra: '월 추가 상환금(선택)',
    calculate: '계산하기',
    error: '대출 금액과 기간을 0보다 크게 입력해 주세요.',
    monthly: '예상 월 납입액',
    principalPaid: '총 원금 상환액',
    totalCost: '총 대출 비용',
    interestPaid: '총 이자 납입액',
    payoff: '상환 완료일',
    schedule: '상환 일정표',
    lastPayment: '마지막 납입:',
    thYear: '연도',
    thPayment: '납입액',
    thPrincipal: '원금 상환',
    thInterest: '이자 납입',
    thTotalInterest: '누적 이자',
    thBalance: '잔액',
    exportCsv: 'CSV로 내보내기',
    print: '인쇄용 보기',
    locale: 'ko-KR',
  },
};

const money = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

function calculateLoan({ amount, term, rate, extra, termType }, locale) {
  const months = termType === 'years' ? term * 12 : term;
  const monthlyRate = rate / 100 / 12;

  if (!(amount > 0) || !(months > 0) || !(rate >= 0) || !(extra >= 0)) return null;

  const monthlyPayment =
    monthlyRate === 0 ? amount / months : (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));

  let balance = amount;
  let totalInterest = 0;
  let totalPrincipal = 0;
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1); // avoid day-of-month overflow
  const schedule = [];

  while (balance > 0.01 && schedule.length < 1000) {
    const interest = balance * monthlyRate;
    let principal = monthlyPayment - interest + extra;
    if (principal > balance) principal = balance;

    const payment = principal + interest;
    balance -= principal;
    totalInterest += interest;
    totalPrincipal += principal;
    currentMonth.setMonth(currentMonth.getMonth() + 1);

    schedule.push({
      year: currentMonth.getFullYear(),
      payment,
      principal,
      interest,
      totalInterest,
      balance: Math.max(balance, 0),
    });
  }

  const yearly = new Map();
  schedule.forEach((row) => {
    if (!yearly.has(row.year)) {
      yearly.set(row.year, { year: row.year, payment: 0, principal: 0, interest: 0, totalInterest: 0, balance: 0 });
    }
    const y = yearly.get(row.year);
    y.payment += row.payment;
    y.principal += row.principal;
    y.interest += row.interest;
    y.totalInterest = row.totalInterest;
    y.balance = row.balance;
  });

  return {
    monthlyPayment: monthlyPayment + extra,
    totalPrincipal,
    totalInterest,
    totalCost: totalPrincipal + totalInterest,
    payoffText: currentMonth.toLocaleDateString(locale, { month: 'short', year: 'numeric' }),
    schedule,
    yearly: [...yearly.values()],
  };
}

export default function LoanPaymentCalculator() {
  const t = text[useLang()];
  const [form, setForm] = useState({ amount: '10000', term: '5', termType: 'years', rate: '10', extra: '0' });
  const [applied, setApplied] = useState(form);
  const canvasRef = useRef(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const result = useMemo(
    () =>
      calculateLoan(
        {
          amount: Number(applied.amount),
          term: Number(applied.term),
          rate: Number(applied.rate),
          extra: Number(applied.extra),
          termType: applied.termType,
        },
        t.locale
      ),
    [applied, t.locale]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!result) return;

    const total = result.totalPrincipal + result.totalInterest;
    const principalAngle = (result.totalPrincipal / total) * Math.PI * 2;

    ctx.beginPath();
    ctx.moveTo(90, 90);
    ctx.arc(90, 90, 75, 0, principalAngle);
    ctx.closePath();
    ctx.fillStyle = '#2c4fbd';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(90, 90);
    ctx.arc(90, 90, 75, principalAngle, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = '#61a36f';
    ctx.fill();
  }, [result]);

  const exportCSV = () => {
    if (!result) return;
    let csv = 'Year,Payment,Principal Paid,Interest Paid,Total Interest Paid,Balance\n';
    result.schedule.forEach((row) => {
      csv += `${row.year},${row.payment.toFixed(2)},${row.principal.toFixed(2)},${row.interest.toFixed(2)},${row.totalInterest.toFixed(2)},${row.balance.toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loan_schedule.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="loan-pmt">
      <div className="container">
        <div className="sidebar">
          <h3>{t.heading}</h3>

          <label htmlFor="lp-amount">{t.amount}</label>
          <input id="lp-amount" type="number" value={form.amount} onChange={set('amount')} />

          <label htmlFor="lp-term">{t.term}</label>
          <input id="lp-term" type="number" value={form.term} onChange={set('term')} />

          <div className="radio-row">
            <label>
              <input type="radio" name="lp-termType" value="months" checked={form.termType === 'months'} onChange={set('termType')} />
              {t.months}
            </label>
            <label>
              <input type="radio" name="lp-termType" value="years" checked={form.termType === 'years'} onChange={set('termType')} />
              {t.years}
            </label>
          </div>

          <label htmlFor="lp-rate">{t.rate}</label>
          <input id="lp-rate" type="number" step="0.01" value={form.rate} onChange={set('rate')} />

          <label htmlFor="lp-extra">{t.extra}</label>
          <input id="lp-extra" type="number" value={form.extra} onChange={set('extra')} />

          <button type="button" onClick={() => setApplied(form)}>{t.calculate}</button>
          {!result && <p className="error">{t.error}</p>}
        </div>

        <div className="main">
          <div className="result-card">
            <div>
              <h4>{t.monthly}</h4>
              <div className="payment">{result ? money(result.monthlyPayment) : t.na}</div>

              <div className="stats">
                <div>
                  <div className="stat-title">{t.principalPaid}</div>
                  <div className="stat-value">{result ? money(result.totalPrincipal) : t.na}</div>
                </div>
                <div>
                  <div className="stat-title">{t.totalCost}</div>
                  <div className="stat-value">{result ? money(result.totalCost) : t.na}</div>
                </div>
                <div>
                  <div className="stat-title">{t.interestPaid}</div>
                  <div className="stat-value">{result ? money(result.totalInterest) : t.na}</div>
                </div>
                <div>
                  <div className="stat-title">{t.payoff}</div>
                  <div className="stat-value">{result ? result.payoffText : t.na}</div>
                </div>
              </div>
            </div>

            <div className="chart-wrap">
              <canvas ref={canvasRef} width="180" height="180" />
              <div className="legend">
                <div><span className="blue-box" />{t.principalPaid}</div>
                <div><span className="green-box" />{t.interestPaid}</div>
              </div>
            </div>
          </div>

          <div className="schedule-header">
            <h3>{t.schedule}</h3>
            <div>
              <strong>{t.lastPayment}</strong> <span>{result ? result.payoffText : t.na}</span>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t.thYear}</th>
                  <th>{t.thPayment}</th>
                  <th>{t.thPrincipal}</th>
                  <th>{t.thInterest}</th>
                  <th>{t.thTotalInterest}</th>
                  <th>{t.thBalance}</th>
                </tr>
              </thead>
              <tbody>
                {result &&
                  result.yearly.map((row) => (
                    <tr key={row.year}>
                      <td>+ {row.year}</td>
                      <td>{money(row.payment)}</td>
                      <td>{money(row.principal)}</td>
                      <td>{money(row.interest)}</td>
                      <td>{money(row.totalInterest)}</td>
                      <td>{money(row.balance)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="links">
            <button type="button" onClick={exportCSV}>{t.exportCsv}</button>
            <button type="button" onClick={() => window.print()}>{t.print}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
