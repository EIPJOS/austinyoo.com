import { useEffect, useRef, useState } from 'react';
import { useLang } from '../../i18n/index.js';
import './portfolioCalc.css';

const text = {
  en: {
    subtitle:
      'Enter stock positions by shares or by total dollar value, then click Run Portfolio to update the chart and table.',
    add: 'Add Stock Slot',
    run: 'Run Portfolio',
    reset: 'Reset All',
    slot: (id) => `Stock Slot ${id}`,
    remove: 'Remove',
    ticker: 'Ticker',
    tickerPlaceholder: 'e.g. AAPL',
    inputMethod: 'Input Method',
    modeShares: 'Shares',
    modeValue: 'Total Value',
    shares: 'Shares',
    price: 'Price per Share',
    value: 'Total Position Value ($)',
    totalValue: 'Total Portfolio Value',
    uniqueTickers: 'Unique Tickers',
    pieTitle: 'Portfolio Pie Chart',
    tableTitle: 'Portfolio Table',
    thTicker: 'Ticker',
    thShares: 'Shares',
    thPrice: 'Price per Share',
    thValue: 'Value',
    thWeight: 'Weight',
    mixed: 'Mixed',
    emptyTable: 'No valid positions entered yet.',
    emptyChart: 'Enter at least one valid stock position.',
    zeroChart: 'Portfolio value must be greater than 0.',
    hoverValue: 'Value',
    hoverWeight: 'Weight',
    msg: {
      tickerRequired: 'Ticker is required.',
      sharesRequired: 'Shares is required when Input Method is Shares.',
      priceRequired: 'Price per Share is required when Input Method is Shares.',
      sharesInvalid: 'Shares must be a valid number greater than or equal to 0.',
      priceInvalid: 'Price per Share must be a valid number greater than or equal to 0.',
      valueRequired: 'Total Position Value is required when Input Method is Total Value.',
      valueInvalid: 'Total Position Value must be a valid number greater than or equal to 0.',
    },
  },
  ko: {
    subtitle:
      '종목별 보유 수량(주식 수) 또는 총 평가금액을 입력한 뒤 "포트폴리오 실행"을 누르면 차트와 표가 업데이트됩니다.',
    add: '종목 추가',
    run: '포트폴리오 실행',
    reset: '전체 초기화',
    slot: (id) => `종목 ${id}`,
    remove: '삭제',
    ticker: '티커',
    tickerPlaceholder: '예: AAPL',
    inputMethod: '입력 방식',
    modeShares: '주식 수',
    modeValue: '총 평가금액',
    shares: '주식 수',
    price: '주당 가격',
    value: '포지션 총 평가금액 ($)',
    totalValue: '포트폴리오 총 평가액',
    uniqueTickers: '종목 수',
    pieTitle: '포트폴리오 파이 차트',
    tableTitle: '포트폴리오 표',
    thTicker: '티커',
    thShares: '주식 수',
    thPrice: '주당 가격',
    thValue: '평가금액',
    thWeight: '비중',
    mixed: '혼합',
    emptyTable: '아직 입력된 유효한 종목이 없어요.',
    emptyChart: '유효한 종목을 한 개 이상 입력해 주세요.',
    zeroChart: '포트폴리오 총액이 0보다 커야 해요.',
    hoverValue: '평가금액',
    hoverWeight: '비중',
    msg: {
      tickerRequired: '티커를 입력해 주세요.',
      sharesRequired: '입력 방식이 "주식 수"일 때는 주식 수가 필요해요.',
      priceRequired: '입력 방식이 "주식 수"일 때는 주당 가격이 필요해요.',
      sharesInvalid: '주식 수는 0 이상의 올바른 숫자여야 해요.',
      priceInvalid: '주당 가격은 0 이상의 올바른 숫자여야 해요.',
      valueRequired: '입력 방식이 "총 평가금액"일 때는 포지션 총 평가금액이 필요해요.',
      valueInvalid: '포지션 총 평가금액은 0 이상의 올바른 숫자여야 해요.',
    },
  },
};

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
function validateCard(card, m) {
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
    messages.push(m.tickerRequired);
    invalid.push('ticker');
  }

  if (card.mode === 'shares') {
    if (sharesRaw === '') {
      messages.push(m.sharesRequired);
      invalid.push('shares');
    }
    if (priceRaw === '') {
      messages.push(m.priceRequired);
      invalid.push('price');
    }
    const shares = Number(sharesRaw);
    const price = Number(priceRaw);
    if (sharesRaw !== '' && (!Number.isFinite(shares) || shares < 0)) {
      messages.push(m.sharesInvalid);
      invalid.push('shares');
    }
    if (priceRaw !== '' && (!Number.isFinite(price) || price < 0)) {
      messages.push(m.priceInvalid);
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
    messages.push(m.valueRequired);
    invalid.push('value');
  }
  const value = Number(valueRaw);
  if (valueRaw !== '' && (!Number.isFinite(value) || value < 0)) {
    messages.push(m.valueInvalid);
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

function runAll(cards, m) {
  const results = cards.map((c) => ({ id: c.id, ...validateCard(c, m) }));
  const errors = {};
  results.forEach((r) => {
    if (r.active && !r.valid) errors[r.id] = { messages: r.messages, invalid: r.invalid };
  });
  if (Object.keys(errors).length) return { errors, df: null };
  const rows = results.filter((r) => r.active && r.valid && r.data).map((r) => r.data);
  return { errors: {}, df: buildPortfolio(rows) };
}

export default function PortfolioAllocationDashboard() {
  const lang = useLang();
  const t = text[lang];
  const [cards, setCards] = useState(defaultCards);
  const [errors, setErrors] = useState({});
  const [df, setDf] = useState(() => runAll(defaultCards(), text.en.msg).df);
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
    const result = runAll(cards, t.msg);
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
        ? t.emptyChart
        : total <= 0
          ? t.zeroChart
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
            hovertemplate: `<b>%{label}</b><br>${t.hoverValue}: $%{value:,.2f}<br>${t.hoverWeight}: %{percent}<extra></extra>`,
          },
        ],
        { showlegend: true, paper_bgcolor: 'white', plot_bgcolor: 'white', margin: { l: 20, r: 20, t: 10, b: 10 } },
        config
      );
    });

    return () => {
      cancelled = true;
    };
  }, [df, total, t]);

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
          {t.subtitle}
        </p>
        <div className="btn-row">
          <button type="button" className="btn-primary" onClick={addCard}>{t.add}</button>
          <button type="button" className="btn-run" onClick={run}>{t.run}</button>
          <button type="button" className="btn-default" onClick={reset}>{t.reset}</button>
        </div>
      </div>

      <div className="layout">
        <div>
          {cards.map((card) => {
            const id = card.id;
            return (
              <div className="stock-card" key={id}>
                <div className="stock-card-header">
                  <h4>{t.slot(id)}</h4>
                  <button type="button" className="btn-danger" onClick={() => removeCard(id)}>{t.remove}</button>
                </div>

                <div className="field">
                  <label htmlFor={`pa-ticker-${id}`}>{t.ticker}</label>
                  <input
                    id={`pa-ticker-${id}`}
                    type="text"
                    placeholder={t.tickerPlaceholder}
                    className={cls(id, 'ticker')}
                    value={card.ticker}
                    onChange={(e) => updateCard(id, { ticker: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label htmlFor={`pa-mode-${id}`}>{t.inputMethod}</label>
                  <select
                    id={`pa-mode-${id}`}
                    value={card.mode}
                    onChange={(e) => updateCard(id, { mode: e.target.value })}
                  >
                    <option value="shares">{t.modeShares}</option>
                    <option value="value">{t.modeValue}</option>
                  </select>
                </div>

                {card.mode === 'shares' ? (
                  <div>
                    <div className="field">
                      <label htmlFor={`pa-shares-${id}`}>{t.shares}</label>
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
                      <label htmlFor={`pa-price-${id}`}>{t.price}</label>
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
                    <label htmlFor={`pa-value-${id}`}>{t.value}</label>
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
              <div className="summary-label">{t.totalValue}</div>
            </div>
            <div className="summary-box">
              <div className="summary-number">{df.length}</div>
              <div className="summary-label">{t.uniqueTickers}</div>
            </div>
          </div>

          <div className="top-card">
            <div className="section-title">{t.pieTitle}</div>
            <div ref={pieRef} className="pie" />
          </div>

          <div className="top-card">
            <div className="section-title">{t.tableTitle}</div>
            <div className="table-wrap">
              {df.length === 0 ? (
                <div className="empty-state">{t.emptyTable}</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>{t.thTicker}</th>
                      <th>{t.thShares}</th>
                      <th>{t.thPrice}</th>
                      <th>{t.thValue}</th>
                      <th>{t.thWeight}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {df.map((row) => (
                      <tr key={row.Ticker}>
                        <td>{row.Ticker}</td>
                        <td>{row.Shares === null ? '' : fmtNumber(row.Shares, 4)}</td>
                        <td>{row.Price === null ? '' : row.Price === 'Mixed' ? t.mixed : fmtNumber(row.Price, 2)}</td>
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
