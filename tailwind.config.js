import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx,md}'],
  theme: {
    extend: {
      colors: {
        navy: '#0F172A',
        slate: '#475569',
        'smart-blue': '#3B82F6',
        'light-bg': '#F8FAFC',
      },
      fontFamily: {
        // Pretendard covers Latin + Hangul with matching weights; the rest are fallbacks.
        sans: [
          '"Pretendard Variable"',
          'Pretendard',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Apple SD Gothic Neo"',
          '"Noto Sans KR"',
          '"Malgun Gothic"',
          'sans-serif',
        ],
        // Monospace fonts have no Hangul glyphs; list Pretendard so Korean text inside
        // `font-mono` elements (chips, job title) uses it instead of an ugly OS fallback.
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          '"Pretendard Variable"',
          'Pretendard',
          '"Apple SD Gothic Neo"',
          '"Noto Sans KR"',
          '"Malgun Gothic"',
          'monospace',
        ],
      },
    },
  },
  plugins: [typography],
};
