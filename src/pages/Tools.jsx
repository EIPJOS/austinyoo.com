import { Suspense, lazy } from 'react';
import Seo from '../components/Seo.jsx';
import CommercialLoanCalculator from '../components/tools/CommercialLoanCalculator.jsx';

// Heavy tools (charting libs) are lazy-loaded so they don't slow down the rest of the page.
const CompoundGrowthCalculator = lazy(() => import('../components/tools/CompoundGrowthCalculator.jsx'));
const PortfolioAllocationDashboard = lazy(() => import('../components/tools/PortfolioAllocationDashboard.jsx'));
const LoanPaymentCalculator = lazy(() => import('../components/tools/LoanPaymentCalculator.jsx'));

// Add new calculators/simulators here — each renders as its own section.
const tools = [
  {
    id: 'commercial-loan-calculator',
    title: '상가 대출 계산기',
    description: '상가 가격, 대출 비율, 임대 수익률, 금리, 공실을 바꿔가며 매달 남는 돈을 계산해보세요.',
    Component: CommercialLoanCalculator,
  },
  {
    id: 'compound-growth-calculator',
    title: 'Investment Compound Growth Calculator',
    description: 'See how an initial deposit and regular contributions can grow over time with compound interest.',
    Component: CompoundGrowthCalculator,
  },
  {
    id: 'portfolio-allocation-dashboard',
    title: 'Portfolio Allocation Dashboard',
    description: 'Enter stock positions by shares or total value and see your allocation as a pie chart and table.',
    Component: PortfolioAllocationDashboard,
  },
  {
    id: 'loan-calculator',
    title: 'Loan Calculator',
    description: 'Estimate your monthly payment, total interest, payoff date, and a yearly amortization schedule.',
    Component: LoanPaymentCalculator,
  },
];

export default function Tools() {
  return (
    <>
      <Seo
        title="Tools"
        description="Interactive calculators and simulators by Austin Yoo, including a commercial property loan calculator, an investment compound growth calculator, a portfolio allocation dashboard, and a loan payment calculator."
        path="/tools"
      />

      <section className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="text-3xl font-bold text-navy">Tools</h1>
        <p className="mt-3 max-w-2xl text-slate">
          Calculators and simulators I've built — play with the inputs and see the numbers update live.
        </p>

        <div className="mt-10 space-y-12">
          {tools.map(({ id, title, description, Component }) => (
            <article key={id} id={id} className="scroll-mt-24">
              <h2 className="text-xl font-semibold text-navy">{title}</h2>
              <p className="mt-1 text-sm text-slate">{description}</p>
              <div className="mt-4 overflow-hidden rounded-xl border border-slate/10 bg-white shadow-sm">
                <Suspense fallback={<div className="p-10 text-center text-sm text-slate">Loading…</div>}>
                  <Component />
                </Suspense>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
