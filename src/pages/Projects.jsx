import Seo from '../components/Seo.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import projects from '../data/projects.json';
import { useLang } from '../i18n/index.js';

const copy = {
  en: {
    title: 'Projects',
    seoDescription:
      'A collection of automation, data pipeline, and AI-driven products built by Austin Yoo, including USGridExplorer, JNB Global Customs, and CustomsMate KR.',
    intro: 'Automation, data pipelines, and AI-integrated platforms, both shipped and in progress.',
    other: 'Other Projects',
    fable: 'Fable modding: game modification and tooling',
  },
  ko: {
    title: '프로젝트',
    seoDescription:
      'Austin Yoo가 만든 자동화, 데이터 파이프라인, AI 기반 서비스 모음: USGridExplorer, JNB Global Customs, CustomsMate KR 등.',
    intro: '자동화, 데이터 파이프라인, AI 연동 플랫폼. 운영 중인 프로젝트와 진행 중인 프로젝트를 소개합니다.',
    other: '기타 프로젝트',
    fable: 'Fable 모딩: 게임 모드 제작 및 툴링',
  },
};

export default function Projects() {
  const lang = useLang();
  const t = copy[lang];

  return (
    <>
      <Seo
        title={t.title}
        description={t.seoDescription}
        path="/projects"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: projects.map((p, i) => ({
            '@type': 'CreativeWork',
            position: i + 1,
            name: p.name,
            description: lang === 'ko' && p.ko ? p.ko.description : p.description,
            url: p.url || undefined,
          })),
        }}
      />

      <section className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="text-3xl font-bold text-navy">{t.title}</h1>
        <p className="mt-3 max-w-2xl text-slate">{t.intro}</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>

        <div className="mt-16 border-t border-slate/10 pt-10">
          <h2 className="text-xl font-semibold text-navy">{t.other}</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate">
            <li>{t.fable}</li>
          </ul>
        </div>
      </section>
    </>
  );
}
