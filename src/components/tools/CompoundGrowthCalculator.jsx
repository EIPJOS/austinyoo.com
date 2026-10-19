import { useEffect, useMemo, useRef, useState } from 'react';
import './growthCalc.css';

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const num = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

function uniqueRoundedSequence(start, end, count) {
  if (count <= 1) return [Math.round(start)];
  const vals = [];
  for (let i = 0; i < count; i++) {
    vals.push(Math.round(start + ((end - start) * i) / (count - 1)));
  }
  return [...new Set(vals)];
}

function growthData({ deposit, years, rate, compound, contrib, contribFreq }) {
  const yrs = Math.max(1, Math.floor(num(years, 15)));
  const r = Math.max(0, num(rate, 6.2)) / 100;
  const compoundN = Math.max(1, num(compound, 1));
  const contribN = contribFreq === 'Monthly' ? 12 : 1;

  let balance = Math.max(0, num(deposit, 10000));
  let principal = balance;
  const contributionAmount = Math.max(0, num(contrib, 100));
  const currentYear = new Date().getFullYear();

  const rows = [
    { YearIndex: 0, Principal: principal, Balance: balance, Interest: balance - principal, LabelYear: 'Now' },
  ];

  for (let y = 1; y <= yrs; y++) {
    for (let i = 0; i < compoundN; i++) balance = balance * (1 + r / compoundN);
    const yearlyContrib = contributionAmount * contribN;
    balance += yearlyContrib;
    principal += yearlyContrib;
    rows.push({
      YearIndex: y,
      Principal: principal,
      Balance: balance,
      Interest: balance - principal,
      LabelYear: String(currentYear + y),
    });
  }
  return rows;
}

export default function CompoundGrowthCalculator() {
  const [form, setForm] = useState({
    deposit: '10000',
    years: '15',
    rate: '6.2',
    compound: '1',
    contrib: '100',
    contribFreq: 'Monthly',
  });
  const plotRef = useRef(null);
  const plotlyRef = useRef(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const rows = useMemo(() => growthData(form), [form]);
  const finalBalance = rows[rows.length - 1].Balance;

  useEffect(() => {
    let cancelled = false;
    const el = plotRef.current;

    import('plotly.js-basic-dist-min').then((mod) => {
      if (cancelled || !el) return;
      const Plotly = mod.default || mod;
      plotlyRef.current = Plotly;

      const ymaxRaw = Math.max(...rows.map((d) => d.Balance));
      const ymax = Math.ceil(ymaxRaw / 1000) * 1000 || 1000;
      const yBreaks = Array.from({ length: 6 }, (_, i) => (ymax * i) / 5);

      const years = Math.max(1, Math.floor(num(form.years, 15)));
      const xBreaks = uniqueRoundedSequence(0, years, 5);
      const currentYear = new Date().getFullYear();
      const xLabels = xBreaks.map((x) => (x === 0 ? 'Now' : String(currentYear + x)));

      const x = rows.map((d) => d.YearIndex);
      const principal = rows.map((d) => d.Principal);
      const balance = rows.map((d) => d.Balance);
      const hoverText = rows.map(
        (row) =>
          `<b>Year ${row.LabelYear}</b><br>` +
          `Total balance: ${money.format(row.Balance)}<br>` +
          `Total principal: ${money.format(row.Principal)}<br>` +
          `Total interest: ${money.format(row.Interest)}`
      );

      const traces = [
        {
          type: 'scatter', mode: 'lines', x, y: principal, fill: 'tozeroy',
          fillcolor: 'rgba(59, 102, 201, 0.18)', line: { color: 'rgba(0,0,0,0)', width: 0 },
          hoverinfo: 'skip', showlegend: false, name: 'Total principal',
        },
        {
          type: 'scatter', mode: 'lines', x, y: principal,
          line: { color: '#2F5FB3', width: 2 }, text: hoverText,
          hovertemplate: '%{text}<extra></extra>', name: 'Total principal',
        },
        {
          type: 'scatter', mode: 'lines', x, y: balance, fill: 'tonexty',
          fillcolor: 'rgba(62,124,89,0.15)', line: { color: 'rgba(0,0,0,0)', width: 0 },
          hoverinfo: 'skip', showlegend: false, name: 'Total interest',
        },
        {
          type: 'scatter', mode: 'lines', x, y: balance,
          line: { color: '#3E7C19', width: 3 }, text: hoverText,
          hovertemplate: '%{text}<extra></extra>', name: 'Total interest',
        },
      ];

      const layout = {
        hovermode: 'x unified',
        xaxis: {
          title: 'Year', tickmode: 'array', tickvals: xBreaks, ticktext: xLabels,
          showgrid: false, zeroline: false,
        },
        yaxis: {
          title: '', tickmode: 'array', tickvals: yBreaks,
          ticktext: yBreaks.map((v) => money.format(v)), showgrid: true,
          gridcolor: 'rgba(180,180,180,0.25)', zeroline: false, range: [0, ymax],
        },
        legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.12 },
        plot_bgcolor: '#f9f9f9',
        paper_bgcolor: '#f9f9f9',
        margin: { l: 60, r: 20, t: 10, b: 70 },
      };

      Plotly.react(el, traces, layout, { responsive: true, displayModeBar: true });
    });

    return () => {
      cancelled = true;
    };
  }, [rows, form.years]);

  useEffect(() => {
    const el = plotRef.current;
    return () => {
      if (plotlyRef.current && el) plotlyRef.current.purge(el);
    };
  }, []);

  return (
    <div className="growth-calc">
      <div className="layout">
        <aside className="sidebar">
          <div className="field">
            <label htmlFor="gc-deposit">Initial deposit</label>
            <input id="gc-deposit" type="number" min="0" step="any" value={form.deposit} onChange={set('deposit')} />
          </div>

          <div className="field">
            <label htmlFor="gc-years">Years of growth</label>
            <input id="gc-years" type="number" min="1" step="1" value={form.years} onChange={set('years')} />
          </div>

          <div className="field">
            <label htmlFor="gc-rate">Estimated rate of return (%)</label>
            <input id="gc-rate" type="number" min="0" step="any" value={form.rate} onChange={set('rate')} />
          </div>

          <div className="field">
            <label htmlFor="gc-compound">Compound frequency</label>
            <select id="gc-compound" value={form.compound} onChange={set('compound')}>
              <option value="1">Annually</option>
              <option value="12">Monthly</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="gc-contrib">Contribution amount</label>
            <input id="gc-contrib" type="number" min="0" step="any" value={form.contrib} onChange={set('contrib')} />
          </div>

          <div className="field">
            <div className="radio-group-title">Contribution frequency</div>
            <div className="radio-inline">
              {['Monthly', 'Annually'].map((freq) => (
                <label key={freq}>
                  <input
                    type="radio"
                    name="contrib_freq"
                    value={freq}
                    checked={form.contribFreq === freq}
                    onChange={set('contribFreq')}
                  />{' '}
                  {freq}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <main className="main">
          <h3 className="balance-title">Total Balance</h3>
          <p className="balance-value" id="final_balance">{money.format(finalBalance)}</p>
          <div ref={plotRef} className="plot" />
        </main>
      </div>
    </div>
  );
}
