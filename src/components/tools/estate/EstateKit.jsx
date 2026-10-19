import { useEffect, useState } from 'react';
import { clean, round2, useEstate } from './estateUtils.js';
import './estate.css';

function NumInput({ label, value, onChange, def, min, max, resetKey }) {
  const { div, prefix = '', suffix = '' } = def;
  const [draft, setDraft] = useState(null); // null = show the live value

  // Moving the slider wins over a half-typed value.
  useEffect(() => {
    setDraft(null);
  }, [resetKey]);

  const shown = draft ?? String(round2(value / div));

  const handleChange = (e) => {
    const v = e.target.value;
    if (!/^\d{0,9}(\.\d{0,2})?$/.test(v)) return; // digits, at most 2 decimals
    setDraft(v);
    const n = parseFloat(v);
    if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, clean(n * div))));
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

/**
 * Labeled number field, optionally with a slider.
 * `value`, `min`, `max`, `slider.{min,max,step}` are all in stored units (만원 / % / months).
 */
export function Field({ id, label, hint, value, onChange, unit, slider, min = 0, max }) {
  const { units } = useEstate();
  const def = units[unit];
  const [tick, setTick] = useState(0);
  const hardMax = max ?? (unit === 'pct' || unit === 'pp' ? 100 : unit === 'mo' ? 12 : unit === 'x' ? 20 : 100000000);

  return (
    <>
      <div className="field-row">
        <label htmlFor={id}>{label}</label>
        {slider ? (
          <input
            type="range"
            id={id}
            min={slider.min}
            max={slider.max}
            step={slider.step}
            value={value}
            onChange={(e) => {
              setTick((n) => n + 1);
              onChange(+e.target.value);
            }}
          />
        ) : (
          <span />
        )}
        <NumInput label={label} value={value} onChange={onChange} def={def} min={min} max={hardMax} resetKey={tick} />
      </div>
      {hint && <p className="hint">{hint}</p>}
    </>
  );
}

export function SelectField({ id, label, value, onChange, options }) {
  return (
    <div className="field-row select-row">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Card({ label, value, sub, tone, hl }) {
  return (
    <div className={`mc${hl ? ' hl' : ''}`}>
      <p>{label}</p>
      <b className={tone || ''}>{value}</b>
      {sub && <small>{sub}</small>}
    </div>
  );
}
