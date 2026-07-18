import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Seo from '../components/Seo.jsx';

const tiers = [
  {
    name: 'Website Build',
    price: '$399',
    period: 'one-time',
    description: 'Turn visitors into customers with a professional custom website, supports multiple languages, and sends quote requests directly to your inbox.',
    features: [
      'Custom-designed, Email responsive site',
      'SEO-ready metadata & structured data',
      'Custom domain setup',
      'Source code delivered',
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
    description: 'Keep your website running with live open data from Gov or media, automated updates, and connected business tools. All hosted and maintained for you.',
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

const initialForm = { name: '', email: '', service: '', message: '', company: '' };

function QuoteForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMessage, setErrorMessage] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      setStatus('sent');
      setForm(initialForm);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-xl border border-smart-blue/20 bg-smart-blue/5 px-6 py-10 text-center text-navy">
        <p className="font-semibold">Quote request sent — thanks!</p>
        <p className="mt-2 text-sm text-slate">I'll review your details and follow up within 1 business day.</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm font-medium text-smart-blue hover:underline"
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate/10 bg-white p-8 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-navy">Request a Free Quote</h2>
      <p className="mt-1 text-sm text-slate">
        Share a few details and I'll follow up within 1 business day.
      </p>

      {/* Honeypot field — hidden from real users, filled by bots */}
      <input
        type="text"
        name="company"
        value={form.company}
        onChange={handleChange}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-navy">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate/20 px-3 py-2 text-sm focus:border-smart-blue focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-navy">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate/20 px-3 py-2 text-sm focus:border-smart-blue focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="service" className="block text-sm font-medium text-navy">
          Interested In
        </label>
        <select
          id="service"
          name="service"
          value={form.service}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border border-slate/20 bg-white px-3 py-2 text-sm focus:border-smart-blue focus:outline-none"
        >
          <option value="">Not sure yet</option>
          <option value="Website Build">Website Build ($399 one-time)</option>
          <option value="API-Connected Tool Websites">API-Connected Tool Websites ($10/mo)</option>
          <option value="Both">Both</option>
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="message" className="block text-sm font-medium text-navy">
          Project Details <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="e.g. what your business does, what you want the site to do, any deadlines"
          value={form.message}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border border-slate/20 px-3 py-2 text-sm focus:border-smart-blue focus:outline-none"
        />
      </div>

      {status === 'error' && (
        <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-6 w-full rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-smart-blue disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Request Free Quote →'}
      </button>
      <p className="mt-3 text-center text-xs text-slate">
        I'll follow up within 1 business day.
      </p>
    </form>
  );
}

export default function Quote() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const timer = setTimeout(() => {
        const el = document.querySelector(location.hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <>
      <Seo
        title="Quote"
        description="Pricing for website builds and API-connected database hosting by Austin Yoo. Request a free quote."
        path="/quote"
      />

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-navy">Get a Quote</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate">
            Simple, transparent pricing for websites and the automated data
            infrastructure behind them.
          </p>
          <div className="mx-auto mt-6 max-w-xl rounded-lg border border-smart-blue/20 bg-smart-blue/5 px-5 py-4">
            <p className="text-sm text-slate">
              A professional website is one of the highest-leverage investments
              a business can make — it builds trust with new customers, shows
              up when people search for you, and turns visitors into leads and
              sales around the clock, not just during business hours.
            </p>
          </div>
          <a
            href="#request-quote"
            className="mt-6 inline-block rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-smart-blue"
          >
            Request a Quote ↓
          </a>
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

        <div id="request-quote" className="mx-auto mt-14 max-w-xl scroll-mt-24">
          <QuoteForm />
        </div>
      </section>
    </>
  );
}
