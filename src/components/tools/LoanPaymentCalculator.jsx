import { useEffect, useMemo, useRef, useState } from 'react';
import './loanPaymentCalc.css';

const money = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

function calculateLoan({ amount, term, rate, extra, termType }) {
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
    payoffText: currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    schedule,
    yearly: [...yearly.values()],
  };
}

export default function LoanPaymentCalculator() {
  const [form, setForm] = useState({ amount: '10000', term: '5', termType: 'years', rate: '10', extra: '0' });
  const [applied, setApplied] = useState(form);
  const canvasRef = useRef(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const result = useMemo(
    () =>
      calculateLoan({
        amount: Number(applied.amount),
        term: Number(applied.term),
        rate: Number(applied.rate),
        extra: Number(applied.extra),
        termType: applied.termType,
      }),
    [applied]
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
          <h3>Loan Calculator</h3>

          <label htmlFor="lp-amount">Loan amount</label>
          <input id="lp-amount" type="number" value={form.amount} onChange={set('amount')} />

          <label htmlFor="lp-term">Loan term</label>
          <input id="lp-term" type="number" value={form.term} onChange={set('term')} />

          <div className="radio-row">
            <label>
              <input type="radio" name="lp-termType" value="months" checked={form.termType === 'months'} onChange={set('termType')} />
              Months
            </label>
            <label>
              <input type="radio" name="lp-termType" value="years" checked={form.termType === 'years'} onChange={set('termType')} />
              Years
            </label>
          </div>

          <label htmlFor="lp-rate">Interest rate (%)</label>
          <input id="lp-rate" type="number" step="0.01" value={form.rate} onChange={set('rate')} />

          <label htmlFor="lp-extra">Optional extra monthly payment</label>
          <input id="lp-extra" type="number" value={form.extra} onChange={set('extra')} />

          <button type="button" onClick={() => setApplied(form)}>Calculate</button>
          {!result && <p className="error">Please enter a loan amount and term greater than 0.</p>}
        </div>

        <div className="main">
          <div className="result-card">
            <div>
              <h4>Estimated monthly payment</h4>
              <div className="payment">{result ? money(result.monthlyPayment) : '—'}</div>

              <div className="stats">
                <div>
                  <div className="stat-title">Total loan amount paid</div>
                  <div className="stat-value">{result ? money(result.totalPrincipal) : '—'}</div>
                </div>
                <div>
                  <div className="stat-title">Total cost of loan</div>
                  <div className="stat-value">{result ? money(result.totalCost) : '—'}</div>
                </div>
                <div>
                  <div className="stat-title">Total interest paid</div>
                  <div className="stat-value">{result ? money(result.totalInterest) : '—'}</div>
                </div>
                <div>
                  <div className="stat-title">Payoff date</div>
                  <div className="stat-value">{result ? result.payoffText : '—'}</div>
                </div>
              </div>
            </div>

            <div className="chart-wrap">
              <canvas ref={canvasRef} width="180" height="180" />
              <div className="legend">
                <div><span className="blue-box" />Total loan amount paid</div>
                <div><span className="green-box" />Total interest paid</div>
              </div>
            </div>
          </div>

          <div className="schedule-header">
            <h3>Amortization Schedule</h3>
            <div>
              <strong>Last payment:</strong> <span>{result ? result.payoffText : '—'}</span>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Your payment</th>
                  <th>Principal paid</th>
                  <th>Interest paid</th>
                  <th>Total interest paid</th>
                  <th>Balance</th>
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
            <button type="button" onClick={exportCSV}>Export as CSV</button>
            <button type="button" onClick={() => window.print()}>Print-friendly version</button>
          </div>
        </div>
      </div>
    </div>
  );
}
