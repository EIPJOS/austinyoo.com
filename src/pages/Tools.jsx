import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import Seo from '../components/Seo.jsx';
import CommercialLoanCalculator from '../components/tools/CommercialLoanCalculator.jsx';

// Heavy tools (charting libs) are lazy-loaded so they don't slow down the rest of the page.
const CompoundGrowthCalculator = lazy(() => import('../components/tools/CompoundGrowthCalculator.jsx'));
const PortfolioAllocationDashboard = lazy(() => import('../components/tools/PortfolioAllocationDashboard.jsx'));
const LoanPaymentCalculator = lazy(() => import('../components/tools/LoanPaymentCalculator.jsx'));

// Add new calculators/simulators here — each renders as its own section
// and automatically shows up in the table of contents.
// `nav` is the short label used in the compact (mobile) contents bar.
const tools = [
  {
    id: 'commercial-loan-calculator',
    nav: '상가 대출',
    title: '상가 대출 계산기',
    description: '상가 가격, 대출 비율, 임대 수익률, 금리, 공실을 바꿔가며 매달 남는 돈을 계산해보세요.',
    Component: CommercialLoanCalculator,
  },
  {
    id: 'compound-growth-calculator',
    nav: 'Compound Growth',
    title: 'Investment Compound Growth Calculator',
    description: 'See how an initial deposit and regular contributions can grow over time with compound interest.',
    Component: CompoundGrowthCalculator,
  },
  {
    id: 'portfolio-allocation-dashboard',
    nav: 'Portfolio',
    title: 'Portfolio Allocation Dashboard',
    description: 'Enter stock positions by shares or total value and see your allocation as a pie chart and table.',
    Component: PortfolioAllocationDashboard,
  },
  {
    id: 'loan-calculator',
    nav: 'Loan Payment',
    title: 'Loan Calculator',
    description: 'Estimate your monthly payment, total interest, payoff date, and a yearly amortization schedule.',
    Component: LoanPaymentCalculator,
  },
];

export default function Tools() {
  const [activeId, setActiveId] = useState(tools[0].id);
  const [headerH, setHeaderH] = useState(65);
  const barRef = useRef(null);
  const chipsRef = useRef({});

  // Keep track of the sticky site header height so our own sticky UI sits right below it.
  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return undefined;
    const update = () => setHeaderH(header.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  // Distance from the viewport top that content must clear (header + mobile contents bar).
  const getOffset = useCallback(() => {
    const bar = barRef.current;
    const barH = bar && bar.offsetParent !== null ? bar.offsetHeight : 0;
    return headerH + barH + 16;
  }, [headerH]);

  // Scroll-spy: highlight the section currently in view.
  useEffect(() => {
    const onScroll = () => {
      const offset = getOffset();
      let current = tools[0].id;
      tools.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= offset + 8) current = id;
      });
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) current = tools[tools.length - 1].id;
      setActiveId(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [getOffset]);

  // Keep the active chip visible in the horizontally scrollable mobile bar.
  useEffect(() => {
    const bar = barRef.current;
    const chip = chipsRef.current[activeId];
    if (!bar || !chip || bar.offsetParent === null) return;
    bar.scrollTo({ left: chip.offsetLeft - bar.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' });
  }, [activeId]);

  const goTo = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - getOffset();
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    window.history.replaceState(null, '', `#${id}`);
  };

  return (
    <>
      <Seo
        title="Tools"
        description="Interactive calculators and simulators by Austin Yoo, including a commercial property loan calculator, an investment compound growth calculator, a portfolio allocation dashboard, and a loan payment calculator."
        path="/tools"
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="text-3xl font-bold text-navy">Tools</h1>
        <p className="mt-3 max-w-2xl text-slate">
          Calculators and simulators I've built — play with the inputs and see the numbers update live.
        </p>

        {/* Compact contents bar (below xl): sticks under the site header while scrolling */}
        <nav
          ref={barRef}
          aria-label="Tools contents"
          style={{ top: headerH }}
          className="sticky z-40 -mx-6 mt-6 flex gap-2 overflow-x-auto border-b border-slate/10 bg-light-bg/95 px-6 py-3 backdrop-blur xl:hidden"
        >
          {tools.map(({ id, nav }) => (
            <a
              key={id}
              href={`#${id}`}
              ref={(el) => {
                chipsRef.current[id] = el;
              }}
              onClick={(e) => goTo(e, id)}
              aria-current={activeId === id ? 'true' : undefined}
              className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                activeId === id
                  ? 'border-navy bg-navy text-white'
                  : 'border-slate/20 bg-white text-slate hover:border-smart-blue hover:text-smart-blue'
              }`}
            >
              {nav}
            </a>
          ))}
        </nav>

        <div className="mt-8 xl:grid xl:grid-cols-[210px_minmax(0,1fr)] xl:gap-10">
          {/* Table of contents panel (xl and up): follows the scroll */}
          <aside className="hidden xl:block">
            <nav
              aria-label="Tools contents"
              style={{ top: headerH + 24 }}
              className="sticky rounded-xl border border-slate/10 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Contents</p>
              <ol className="mt-3 space-y-1">
                {tools.map(({ id, title }, i) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      onClick={(e) => goTo(e, id)}
                      aria-current={activeId === id ? 'true' : undefined}
                      className={`flex gap-2 rounded-md border-l-2 px-3 py-2 text-sm leading-snug transition-colors ${
                        activeId === id
                          ? 'border-smart-blue bg-smart-blue/5 font-semibold text-navy'
                          : 'border-transparent text-slate hover:bg-navy/5 hover:text-navy'
                      }`}
                    >
                      <span className="font-mono text-xs leading-snug text-smart-blue">{i + 1}</span>
                      <span>{title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="min-w-0 divide-y-2 divide-slate/15">
            {tools.map(({ id, title, description, Component }, i) => (
              <article key={id} id={id} className="py-12 first:pt-0 last:pb-0">
                <h2 className="flex items-baseline gap-3 text-xl font-semibold text-navy">
                  <span className="font-mono text-base text-smart-blue">{String(i + 1).padStart(2, '0')}</span>
                  {title}
                </h2>
                <p className="mt-1 text-sm text-slate">{description}</p>
                <div className="mt-4 overflow-hidden rounded-xl border border-slate/10 bg-white shadow-sm">
                  <Suspense fallback={<div className="p-10 text-center text-sm text-slate">Loading…</div>}>
                    <Component />
                  </Suspense>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
