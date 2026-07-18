import Seo from '../components/Seo.jsx';

const tiers = [
  {
    name: 'Website Build',
    price: '$399',
    period: 'one-time',
    description: 'A custom-designed, responsive website built and deployed for you.',
    features: [
      'Custom-designed, responsive site (React/Vite)',
      'SEO-ready metadata & structured data',
      'Deployed on Vercel with custom domain setup',
      'Source code delivered — no lock-in',
    ],
    example: {
      label: 'See it in action: JNB Global',
      url: 'https://www.jnbglobal.kr/en',
    },
  },
  {
    name: 'API-Connected Tool Websites',
    price: '$10',
    period: '/ month',
    description: 'Ongoing hosting for a site backed by a live, automatically updating database — like CustomsMate KR.',
    features: [
      'Supabase-backed database for dynamic content',
      'Automated data pipelines (scheduled jobs)',
      'API integration for real-time or AI-summarized data',
      'Ongoing hosting & maintenance',
    ],
    example: {
      label: 'See it in action: CustomsMate KR',
      url: 'https://customs-mate.vercel.app/en',
    },
  },
];

export default function Quote() {
  return (
    <>
      <Seo
        title="Quote"
        description="Pricing for website builds and API-connected database hosting by Austin Yoo."
        path="/quote"
      />

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-navy">Get a Quote</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate">
            Simple, transparent pricing for websites and the automated data
            infrastructure behind them.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-slate">
            A professional website is one of the highest-leverage investments
            a business can make — it builds trust with new customers, shows
            up when people search for you, and turns visitors into leads and
            sales around the clock, not just during business hours.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="flex flex-col rounded-xl border border-slate/10 bg-white p-8 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-navy">{tier.name}</h2>
              <p className="mt-4">
                <span className="text-4xl font-bold text-navy">{tier.price}</span>
                <span className="ml-1 text-sm text-slate">{tier.period}</span>
              </p>
              <p className="mt-3 text-sm text-slate">{tier.description}</p>

              <ul className="mt-6 flex-1 space-y-3 text-sm text-slate">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-smart-blue">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {tier.example && (
                <a
                  href={tier.example.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 text-sm font-medium text-smart-blue hover:underline"
                >
                  {tier.example.label} →
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <a
            href="mailto:austinyooe@gmail.com?subject=Website%20Quote%20Request"
            className="inline-block rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-smart-blue"
          >
            Get a Quote
          </a>
          <p className="mt-3 text-sm text-slate">
            Tell me a bit about your project and I'll follow up.
          </p>
        </div>
      </section>
    </>
  );
}
