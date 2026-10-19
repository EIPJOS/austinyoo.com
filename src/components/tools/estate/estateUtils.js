import { useLang } from '../../../i18n/index.js';

/*
 * Shared building blocks for the commercial-property calculators.
 *
 * Every money value is stored in 만원 (10,000 KRW). Korean shows it as 억/만원,
 * English shows millions of won (₩M). `div` converts stored value -> displayed value.
 */

export const round2 = (n) => Math.round(n * 100) / 100;
export const clean = (n) => Math.round(n * 1e6) / 1e6;

export const UNIT_DEFS = {
  ko: {
    eok: { div: 10000, suffix: '억' },
    man: { div: 1, suffix: '만원' },
    pct: { div: 1, suffix: '%' },
    mo: { div: 1, suffix: '개월' },
    x: { div: 1, suffix: '배' },
    pp: { div: 1, suffix: '%p' },
  },
  en: {
    eok: { div: 100, prefix: '₩', suffix: 'M' },
    man: { div: 100, prefix: '₩', suffix: 'M' },
    pct: { div: 1, suffix: '%' },
    mo: { div: 1, suffix: 'mo' },
    x: { div: 1, suffix: '×' },
    pp: { div: 1, suffix: '%p' },
  },
};

/** Formatters for result values, per language. Money input is in 만원. */
export function makeFormatters(lang) {
  if (lang === 'ko') {
    return {
      money: (n) => {
        const a = Math.round(Math.abs(n));
        const sign = n < 0 && a !== 0 ? '-' : '';
        if (a >= 10000) {
          const eok = Math.floor(a / 10000);
          const rest = a % 10000;
          return `${sign}${eok.toLocaleString('ko-KR')}억${rest ? ` ${rest.toLocaleString('ko-KR')}만` : ''}`;
        }
        return `${sign}${a.toLocaleString('ko-KR')}만`;
      },
      months: (v) => `${v.toFixed(1)}개월`,
      pct: (v) => `${v.toFixed(2)}%`,
      pp: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%p`,
      times: (v) => `${v.toFixed(2)}배`,
    };
  }
  return {
    money: (n) => {
      const m = Math.abs(n) / 100;
      const sign = n < 0 && Math.round(m * 100) !== 0 ? '-' : '';
      if (m >= 1000) return `${sign}₩${(m / 1000).toFixed(2)}B`;
      return `${sign}₩${m.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
    },
    months: (v) => `${v.toFixed(1)} mo`,
    pct: (v) => `${v.toFixed(2)}%`,
    pp: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%p`,
    times: (v) => `${v.toFixed(2)}×`,
  };
}

/** Monthly payment on a loan (amounts in 만원). */
export function monthlyPayment(loan, ratePct, mode) {
  if (!(loan > 0)) return 0;
  const i = ratePct / 100 / 12;
  if (mode === 'a') {
    return i === 0 ? loan / 240 : (loan * i) / (1 - Math.pow(1 + i, -240));
  }
  return loan * i;
}

export function useEstate() {
  const lang = useLang();
  return { lang, units: UNIT_DEFS[lang], fmt: makeFormatters(lang) };
}
