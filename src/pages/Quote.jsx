import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { useLang } from '../i18n/index.js';

const copy = {
  en: {
    seoTitle: 'Quote',
    seoDescription:
      'Pricing for website builds and API-connected database hosting by Austin Yoo. Request a free quote.',
    title: 'Get a Quote',
    intro: 'Simple, transparent pricing for websites and the automated data infrastructure behind them.',
    pitch:
      'A professional website is one of the highest-leverage investments a business can make. It builds trust with new customers, shows up when people search for you, and turns visitors into leads and sales around the clock, not just during business hours.',
    cta: 'Request a Quote ↓',
    proofHeading: 'Proven in Production',
    proofPoints: [
      {
        stat: '3',
        label: 'Live platforms in production',
        detail: 'USGridExplorer, CustomsMate KR, and Grid Permit Alerts are all shipped and running today.',
      },
      {
        stat: '3×/day',
        label: 'Fully automated publishing',
        detail:
          'USGridExplorer generates and publishes AI-written briefings on a GitHub Actions schedule, with no manual work.',
      },
      {
        stat: 'Live',
        label: 'Real-time government data',
        detail:
          'CustomsMate KR pulls directly from the Korea Customs Service, MFDS, and Ministry of Government Legislation.',
      },
    ],
    tiers: [
      {
        name: 'Website Build',
        price: '$399',
        period: 'one-time',
        description:
          'Turn visitors into customers with a professional custom website, supports multiple languages, and sends quote requests directly to your inbox.',
        features: [
          'Custom-designed, Email responsive site',
          'SEO-ready metadata & structured data',
          'Custom domain setup',
          'Source code delivered',
        ],
        example: { label: 'See it in action: JNB Global', url: 'https://www.jnbglobal.kr/en' },
      },
      {
        name: 'API-Connected Tool Websites',
        price: '$10',
        period: '/ month',
        description:
          'Keep your website running with live open data from Gov or media, automated updates, and connected business tools. All hosted and maintained for you.',
        features: [
          'Supabase-backed database for dynamic content',
          'Automated data pipelines (scheduled jobs)',
          'API integration for real-time or AI-summarized data',
          'Ongoing hosting & maintenance',
        ],
        example: { label: 'See it in action: CustomsMate KR', url: 'https://customs-mate.vercel.app/en' },
      },
    ],
    form: {
      title: 'Request a Free Quote',
      subtitle: "Share a few details and I'll follow up within 1 business day.",
      name: 'Name',
      email: 'Email',
      interested: 'Interested In',
      notSure: 'Not sure yet',
      optWebsite: 'Website Build ($399 one-time)',
      optTool: 'API-Connected Tool Websites ($10/mo)',
      optBoth: 'Both',
      details: 'Project Details',
      placeholder: 'e.g. what your business does, what you want the site to do, any deadlines',
      sending: 'Sending…',
      submit: 'Request Free Quote →',
      sentTitle: 'Quote request sent. Thanks!',
      sentBody: "I'll review your details and follow up within 1 business day.",
      sendAnother: 'Send another request',
      errorGeneric: 'Something went wrong. Please try again.',
      useServerError: true,
    },
  },
  ko: {
    seoTitle: '견적',
    seoDescription:
      'Austin Yoo의 웹사이트 제작 및 API 연동 데이터베이스 호스팅 가격 안내. 무료 견적을 요청해 보세요.',
    title: '견적 요청',
    intro: '웹사이트와 그 뒤에서 돌아가는 자동화 데이터 인프라를 투명한 가격으로 제공합니다.',
    pitch:
      '전문적인 웹사이트는 사업이 할 수 있는 가장 효율 높은 투자 중 하나입니다. 신규 고객의 신뢰를 높이고, 검색할 때 노출되며, 영업시간과 관계없이 하루 종일 방문자를 문의와 매출로 바꿔 줍니다.',
    cta: '견적 요청 ↓',
    proofHeading: '실제 운영으로 검증',
    proofPoints: [
      {
        stat: '3',
        label: '운영 중인 라이브 플랫폼',
        detail: 'USGridExplorer, CustomsMate KR, Grid Permit Alerts 모두 출시되어 지금 운영되고 있습니다.',
      },
      {
        stat: '하루 3회',
        label: '완전 자동 발행',
        detail:
          'USGridExplorer는 GitHub Actions 일정에 따라 AI가 작성한 브리핑을 자동으로 생성·발행합니다. 수작업이 필요 없습니다.',
      },
      {
        stat: '실시간',
        label: '정부 데이터 실시간 연동',
        detail: 'CustomsMate KR은 관세청, 식약처, 법제처의 데이터를 직접 가져옵니다.',
      },
    ],
    tiers: [
      {
        name: 'Website Build',
        displayName: '웹사이트 제작',
        price: '$399',
        period: '1회 결제',
        description:
          '전문적인 맞춤 웹사이트로 방문자를 고객으로 바꿔 보세요. 다국어를 지원하고, 견적 문의가 곧바로 이메일로 전달됩니다.',
        features: [
          '맞춤 디자인의 반응형 사이트',
          'SEO에 최적화된 메타데이터 및 구조화 데이터',
          '커스텀 도메인 설정',
          '소스 코드 인도',
        ],
        example: { label: '실제 사례 보기: JNB Global', url: 'https://www.jnbglobal.kr/en' },
      },
      {
        name: 'API-Connected Tool Websites',
        displayName: 'API 연동 툴 웹사이트',
        price: '$10',
        period: '/ 월',
        description:
          '정부·언론 등의 실시간 공개 데이터, 자동 업데이트, 연동된 업무 도구로 웹사이트를 항상 살아 있게 유지하세요. 호스팅과 유지보수까지 모두 맡아 드립니다.',
        features: [
          'Supabase 기반 데이터베이스로 동적 콘텐츠 제공',
          '자동화된 데이터 파이프라인(예약 작업)',
          '실시간 또는 AI 요약 데이터를 위한 API 연동',
          '지속적인 호스팅 및 유지보수',
        ],
        example: { label: '실제 사례 보기: CustomsMate KR', url: 'https://customs-mate.vercel.app/en' },
      },
    ],
    form: {
      title: '무료 견적 요청',
      subtitle: '몇 가지 정보를 남겨 주시면 영업일 기준 1일 이내에 연락드릴게요.',
      name: '이름',
      email: '이메일',
      interested: '관심 서비스',
      notSure: '아직 잘 모르겠어요',
      optWebsite: '웹사이트 제작 ($399, 1회 결제)',
      optTool: 'API 연동 툴 웹사이트 ($10/월)',
      optBoth: '둘 다',
      details: '프로젝트 내용',
      placeholder: '예: 어떤 사업을 하시는지, 사이트로 무엇을 하고 싶은지, 희망 일정',
      sending: '전송 중…',
      submit: '무료 견적 요청하기 →',
      sentTitle: '견적 요청이 전송되었습니다. 감사합니다!',
      sentBody: '내용을 검토한 뒤 영업일 기준 1일 이내에 연락드리겠습니다.',
      sendAnother: '다른 요청 보내기',
      errorGeneric: '전송 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.',
      useServerError: false,
    },
  },
};

const initialForm = { name: '', email: '', service: '', message: '', company: '' };

function smoothScrollTo(el, duration = 1600) {
  const startY = window.scrollY;
  const rect = el.getBoundingClientRect();
  const elCenter = rect.top + rect.height / 2;
  const targetY = startY + elCenter - window.innerHeight / 2;
  const distance = targetY - startY;
  const startTime = performance.now();

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo({ top: startY + distance * easeInOutQuad(progress), behavior: 'auto' });
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function QuoteForm({ t }) {
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
        throw new Error(data.error || t.errorGeneric);
      }

      setStatus('sent');
      setForm(initialForm);
    } catch (err) {
      setStatus('error');
      // The API returns English error text; show the localized generic message in Korean.
      setErrorMessage(t.useServerError && err.message ? err.message : t.errorGeneric);
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-xl border border-smart-blue/20 bg-smart-blue/5 px-6 py-10 text-center text-navy">
        <p className="font-semibold">{t.sentTitle}</p>
        <p className="mt-2 text-sm text-slate">{t.sentBody}</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm font-medium text-smart-blue hover:underline"
        >
          {t.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate/10 bg-white p-8 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-navy">{t.title}</h2>
      <p className="mt-1 text-sm text-slate">{t.subtitle}</p>

      {/* Honeypot field: hidden from real users, filled by bots */}
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
            {t.name} <span className="text-red-500">*</span>
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
            {t.email} <span className="text-red-500">*</span>
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
          {t.interested}
        </label>
        {/* option values stay in English: they are what shows up in the email sent to the site owner */}
        <select
          id="service"
          name="service"
          value={form.service}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border border-slate/20 bg-white px-3 py-2 text-sm focus:border-smart-blue focus:outline-none"
        >
          <option value="">{t.notSure}</option>
          <option value="Website Build">{t.optWebsite}</option>
          <option value="API-Connected Tool Websites">{t.optTool}</option>
          <option value="Both">{t.optBoth}</option>
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="message" className="block text-sm font-medium text-navy">
          {t.details} <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder={t.placeholder}
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
        {status === 'sending' ? t.sending : t.submit}
      </button>
    </form>
  );
}

export default function Quote() {
  const location = useLocation();
  const t = copy[useLang()];

  useEffect(() => {
    if (location.hash) {
      const timer = setTimeout(() => {
        const el = document.querySelector(location.hash);
        if (el) smoothScrollTo(el);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <>
      <Seo title={t.seoTitle} description={t.seoDescription} path="/quote" />

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-navy">{t.title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate">{t.intro}</p>
          <div className="mx-auto mt-6 max-w-xl rounded-lg border border-smart-blue/20 bg-smart-blue/5 px-5 py-4">
            <p className="text-sm text-slate">{t.pitch}</p>
          </div>
          <a
            href="#request-quote"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('request-quote');
              if (el) smoothScrollTo(el);
            }}
            className="mt-6 inline-block rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-smart-blue"
          >
            {t.cta}
          </a>
        </div>

        <div className="mt-12">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-slate">
            {t.proofHeading}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {t.proofPoints.map((p) => (
              <div
                key={p.label}
                className="rounded-xl border border-slate/10 bg-white p-6 text-center"
              >
                <p className="text-3xl font-bold text-navy">{p.stat}</p>
                <p className="mt-2 text-sm font-semibold text-navy">{p.label}</p>
                <p className="mt-2 text-sm text-slate">{p.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {t.tiers.map((tier) => (
            <div
              key={tier.name}
              className="flex flex-col rounded-xl border border-slate/10 bg-white p-8 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-navy">{tier.displayName || tier.name}</h2>
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
          <QuoteForm t={t.form} />
        </div>
      </section>
    </>
  );
}
