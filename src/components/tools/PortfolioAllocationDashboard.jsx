import { useEffect, useRef, useState } from 'react';
import './portfolioCalc.css';

const money2 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fmtNumber = (value, digits = 2) =>
  Number(value).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

const emptyCard = (id) => ({ id, ticker: '', mode: 'shares', shares: '', price: '', value: '' });

const defaultCards = () => [
  { ...emptyCard(1), ticker: 'AAPL', shares: '10', price: '270.75' },
  { ...emptyCard(2), ticker: 'AMZN', shares: '15', price: '250.74' },
  { ...emptyCard(3), ticker: 'BRK.B', shares: '10', price: '474.90' },
];

// Returns { active, valid, data, messages, invalid } for one stock card.
function validateCard(card) {
  const ticker = card.ticker.trim().toUpperCase();
  const sharesRaw = card.shares.trim();
  const priceRaw = card.price.trim();
  const valueRaw = card.value.trim();

  if (ticker === '' && sharesRaw === '' && priceRaw === '' && valueRaw === '') {
    return { active: false, valid: true, data: null, messages: [], invalid: [] };
  }

  const messages = [];
  const invalid = [];

  if (!ticker) {
    messages.push('Ticker is required.');
    invalid.push('ticker');
  }

  if (card.mode === 'shares') {
    if (sharesRaw === '') {
      messages.push('Shares is required when Input Method is Shares.');
      invalid.push('shares');
    }
    if (priceRaw === '') {
      messages.push('Price per Share is required when Input Method is Shares.');
      invalid.push('price');
    }
    const shares = Number(sharesRaw);
    const price = Number(priceRaw);
    if (sharesRaw !== '' && (!Number.isFinite(shares) || shares < 0)) {
      messages.push('Shares must be a valid number greater than or equal to 0.');
      invalid.push('shares');
    }
    if (priceRaw !== '' && (!Number.isFinite(price) || price < 0)) {
      messages.push('Price per Share must be a valid number greater than or equal to 0.');
      invalid.push('price');
    }
    if (messages.length) return { active: true, valid: false, data: null, messages, invalid };
    return {
      active: true,
      valid: true,
      data: { Ticker: ticker, Shares: shares, Price: price, Value: shares * price },
      messages: [],
      invalid: [],
    };
  }

  if (valueRaw === '') {
    messages.push('Total Position Value is required when Input Method is Total Value.');
    invalid.push('value');
  }
  const value = Number(valueRaw);
  if (valueRaw !== '' && (!Number.isFinite(value) || value < 0)) {
    messages.push('Total Position Value must be a valid number greater than or equal to 0.');
    invalid.push('value');
  }
  if (messages.length) return { active: true, valid: false, data: null, messages, invalid };
  return {
    active: true,
    valid: true,
    data: { Ticker: ticker, Shares: null, Price: null, Value: value },
    messages: [],
    invalid: [],
  };
}

function buildPortfolio(rows) {
  if (rows.length === 0) return [];
  const grouped = new Map();

  rows.forEach((row) => {
    if (!grouped.has(row.Ticker)) {
      grouped.set(row.Ticker, { Ticker: row.Ticker, totalShares: 0, hasAnyShares: false, Value: 0, prices: [] });
    }
    const acc = grouped.get(row.Ticker);
    acc.Value += row.Value;
    if (row.Shares !== null && Number.isFinite(row.Shares)) {
      acc.totalShares += row.Shares;
      acc.hasAnyShares = true;
    }
    if (row.Price !== null && Number.isFinite(row.Price)) acc.prices.push(row.Price);
  });

  const df = Array.from(grouped.values())
    .map((item) => {
      let displayPrice = null;
      if (item.prices.length === 1) {
        displayPrice = item.prices[0];
      } else if (item.prices.length > 1) {
        const unique = [...new Set(item.prices.map((p) => Number(p).toFixed(4)))];
        displayPrice = unique.length === 1 ? Number(unique[0]) : 'Mixed';
      }
      return {
        Ticker: item.Ticker,
        Shares: item.hasAnyShares ? item.totalShares : null,
        Price: displayPrice,
        Value: item.Value,
      };
    })
    .sort((a, b) => b.Value - a.Value);

  const total = df.reduce((sum, row) => sum + row.Value, 0);
  df.forEach((row) => {
    row.Weight = total > 0 ? Number(((100 * row.Value) / total).toFixed(2)) : 0;
  });
  return df;
}

function runAll(cards) {
  const results = cards.map((c) => ({ id: c.id, ...validateCard(c) }));
  const errors = {};
  results.forEach((r) => {
    if (r.active && !r.valid) errors[r.id] = { messages: r.messages, invalid: r.invalid };
  });
  if (Object.keys(errors).length) return { errors, df: null };
  const rows = results.filter((r) => r.active && r.valid && r.data).map((r) => r.data);
  return { errors: {}, df: buildPortfolio(rows) };
}

export default function PortfolioAllocationDashboard() {
  const [cards, setCards] = useState(defaultCards);
  const [errors, setErrors] = useState({});
  const [df, setDf] = useState(() => runAll(defaultCards()).df);
  const pieRef = useRef(null);
  const plotlyRef = useRef(null);

  const total = df.reduce((sum, row) => sum + row.Value, 0);

  const updateCard = (id, patch) => {
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    setErrors((e) => {
      if (!e[id]) return e;
      const next = { ...e };
      delete next[id];
      return next;
    });
  };

  const addCard = () => {
    setCards((cs) => [...cs, emptyCard(cs.length ? Math.max(...cs.map((c) => c.id)) + 1 : 1)]);
  };

  const removeCard = (id) => {
    setCards((cs) => (cs.length > 1 ? cs.filter((c) => c.id !== id) : cs));
  };

  const run = () => {
    const result = runAll(cards);
    setErrors(result.errors);
    if (result.df) setDf(result.df);
  };

  const reset = () => {
    setCards(defaultCards());
    setErrors({});
    setDf([]);
  };

  useEffect(() => {
    let cancelled = false;
    const el = pieRef.current;

    import('plotly.js-basic-dist-min').then((mod) => {
      if (cancelled || !el) return;
      const Plotly = mod.default || mod;
      plotlyRef.current = Plotly;
      const config = { responsive: true, displayModeBar: true };

      const message = df.length === 0
        ? 'Enter at least one valid stock position.'
        : total <= 0
          ? 'Portfolio value must be greater than 0.'
          : null;

      if (message) {
        Plotly.newPlot(
          el,
          [],
          {
            annotations: [{ text: message, showarrow: false, font: { size: 16, color: '#6c757d' } }],
            xaxis: { visible: false },
            yaxis: { visible: false },
            paper_bgcolor: 'white',
            plot_bgcolor: 'white',
            margin: { l: 20, r: 20, t: 20, b: 20 },
          },
          config
        );
        return;
      }

      Plotly.newPlot(
        el,
        [
          {
            labels: df.map((row) => row.Ticker),
            values: df.map((row) => row.Value),
            type: 'pie',
            textinfo: 'label+percent',
            hovertemplate: '<b>%{label}</b><br>Value: $%{value:,.2f}<br>Weight: %{percent}<extra></extra>',
          },
        ],
        { showlegend: true, paper_bgcolor: 'white', plot_bgcolor: 'white', margin: { l: 20, r: 20, t: 10, b: 10 } },
        config
      );
    });

    return () => {
      cancelled = true;
    };
  }, [df, total]);

  useEffect(() => {
    const el = pieRef.current;
    return () => {
      if (plotlyRef.current && el) plotlyRef.current.purge(el);
    };
  }, []);

  const cls = (id, field) => (errors[id]?.invalid.includes(field) ? 'invalid' : '');

  return (
    <div className="portfolio-calc">
      <div className="top-card">
        <p className="app-subtitle">
          Enter stock positions by shares or by total dollar value, then click Run Portfolio to update the chart and table.
        </p>
        <div className="btn-row">
          <button type="button" className="btn-primary" onClick={addCard}>Add Stock Slot</button>
          <button type="button" className="btn-run" onClick={run}>Run Portfolio</button>
          <button type="button" className="btn-default" onClick={reset}>Reset All</button>
        </div>
      </div>

      <div className="layout">
        <div>
          {cards.map((card) => {
            const id = card.id;
            return (
              <div className="stock-card" key={id}>
                <div className="stock-card-header">
                  <h4>Stock Slot {id}</h4>
                  <button type="button" className="btn-danger" onClick={() => removeCard(id)}>Remove</button>
                </div>

                <div className="field">
                  <label htmlFor={`pa-ticker-${id}`}>Ticker</label>
                  <input
                    id={`pa-ticker-${id}`}
                    type="text"
                    placeholder="e.g. AAPL"
                    className={cls(id, 'ticker')}
                    value={card.ticker}
                    onChange={(e) => updateCard(id, { ticker: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label htmlFor={`pa-mode-${id}`}>Input Method</label>
                  <select
                    id={`pa-mode-${id}`}
                    value={card.mode}
                    onChange={(e) => updateCard(id, { mode: e.target.value })}
                  >
                    <option value="shares">Shares</option>
                    <option value="value">Total Value</option>
                  </select>
                </div>

                {card.mode === 'shares' ? (
                  <div>
                    <div className="field">
                      <label htmlFor={`pa-shares-${id}`}>Shares</label>
                      <input
                        id={`pa-shares-${id}`}
                        type="number"
                        min="0"
                        step="0.0001"
                        className={cls(id, 'shares')}
                        value={card.shares}
                        onChange={(e) => updateCard(id, { shares: e.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`pa-price-${id}`}>Price per Share</label>
                      <input
                        id={`pa-price-${id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        className={cls(id, 'price')}
                        value={card.price}
                        onChange={(e) => updateCard(id, { price: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="field">
                    <label htmlFor={`pa-value-${id}`}>Total Position Value ($)</label>
                    <input
                      id={`pa-value-${id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      className={cls(id, 'value')}
                      value={card.value}
                      onChange={(e) => updateCard(id, { value: e.target.value })}
                    />
                  </div>
                )}

                {errors[id] && (
                  <div className="validation-box">
                    <ul>
                      {errors[id].messages.map((msg) => (
                        <li key={msg}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div>
          <div className="summary-grid">
            <div className="summary-box">
              <div className="summary-number">{money2.format(total)}</div>
              <div className="summary-label">Total Portfolio Value</div>
            </div>
            <div className="summary-box">
              <div className="summary-number">{df.length}</div>
              <div className="summary-label">Unique Tickers</div>
            </div>
          </div>

          <div className="top-card">
            <div className="section-title">Portfolio Pie Chart</div>
            <div ref={pieRef} className="pie" />
          </div>

          <div className="top-card">
            <div className="section-title">Portfolio Table</div>
            <div className="table-wrap">
              {df.length === 0 ? (
                <div className="empty-state">No valid positions entered yet.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Ticker</th>
                      <th>Shares</th>
                      <th>Price per Share</th>
                      <th>Value</th>
                      <th>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {df.map((row) => (
                      <tr key={row.Ticker}>
                        <td>{row.Ticker}</td>
                        <td>{row.Shares === null ? '' : fmtNumber(row.Shares, 4)}</td>
                        <td>{row.Price === null ? '' : row.Price === 'Mixed' ? 'Mixed' : fmtNumber(row.Price, 2)}</td>
                        <td>{fmtNumber(row.Value, 2)}</td>
                        <td>{fmtNumber(row.Weight, 2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
