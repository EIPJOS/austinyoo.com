import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import projects from '../data/projects.json';
import { rememberLang, storedLang, useLang, useLocalePath } from '../i18n/index.js';

const copy = {
  en: {
    seoTitle: 'Home',
    seoDescription:
      'Austin Yoo is a BI Analyst, Automation Developer, and Full-Stack Developer turning business data into automated pipelines and production-grade web platforms.',
    jobTitle: 'BI Analyst, Automation Developer, Full-Stack Developer',
    intro:
      'I turn business data into clear, actionable insight, automate the workflows that keep it flowing, and build the full-stack platforms that put it in front of the people who need it, end to end, from data source to production.',
    resume: 'View Full Resume',
    projects: 'Explore Projects',
    quote: 'Request a Quote',
    featured: 'Featured Projects',
  },
  ko: {
    seoTitle: '홈',
    seoDescription:
      'Austin Yoo는 BI 애널리스트, 자동화 개발자, 풀스택 개발자로서 비즈니스 데이터를 자동화된 파이프라인과 실서비스 수준의 웹 플랫폼으로 만들어 갑니다.',
    jobTitle: 'BI 애널리스트, 자동화 개발자, 풀스택 개발자',
    intro:
      '비즈니스 데이터를 명확하고 실행 가능한 인사이트로 바꾸고, 그 데이터가 끊김 없이 흐르도록 업무를 자동화하며, 필요한 사람에게 전달되는 풀스택 플랫폼을 데이터 소스부터 운영 단계까지 처음부터 끝까지 만듭니다.',
    resume: '이력서 보기',
    projects: '프로젝트 보기',
    quote: '견적 요청',
    featured: '주요 프로젝트',
  },
};

export default function Home() {
  const lang = useLang();
  const lp = useLocalePath();
  const navigate = useNavigate();
  const t = copy[lang];
  const featured = projects.slice(0, 3);

  // First visit to the English home page from a Korean-language browser -> Korean site.
  // Never overrides a language the visitor already picked with the switcher.
  useEffect(() => {
    if (lang === 'en' && !storedLang() && navigator.language?.toLowerCase().startsWith('ko')) {
      rememberLang('ko');
      navigate('/ko', { replace: true });
    }
  }, [lang, navigate]);

  return (
    <>
      <Seo
        title={t.seoTitle}
        description={t.seoDescription}
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Austin Yoo',
          url: 'https://austinyoo.com',
          jobTitle: t.jobTitle,
          knowsAbout: ['React', 'Supabase', 'GitHub Actions', 'Anthropic API', 'Python'],
        }}
      />

      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <img
          src="/austin-yoo.png"
          alt="Austin Yoo"
          className="mx-auto mb-6 h-32 w-32 rounded-full border-4 border-white object-cover shadow-md"
        />
        <h1 className="text-4xl font-bold tracking-tight text-navy sm:text-5xl">
          Austin Yoo
        </h1>
        <p className="mt-3 font-mono text-smart-blue">{t.jobTitle}</p>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate">{t.intro}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to={lp('/resume')}
            className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-smart-blue"
          >
            {t.resume}
          </Link>
          <Link
            to={lp('/projects')}
            className="rounded-lg border border-navy px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-smart-blue hover:text-smart-blue"
          >
            {t.projects}
          </Link>
          <Link
            to={lp('/quote#request-quote')}
            className="rounded-lg border border-navy px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-smart-blue hover:text-smart-blue"
          >
            {t.quote}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="mb-8 text-2xl font-semibold text-navy">{t.featured}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>
    </>
  );
}
