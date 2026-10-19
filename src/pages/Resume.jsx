import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Seo from '../components/Seo.jsx';
import skillsEn from '../data/skills.json';
import skillsKo from '../data/skills.ko.json';
import resumeEn from '../data/resume.md?raw';
import resumeKo from '../data/resume.ko.md?raw';
import { useLang } from '../i18n/index.js';

const copy = {
  en: {
    seoTitle: 'Resume',
    seoDescription:
      "Austin Yoo's resume: experience in automation, data pipelines, and AI integration, plus core technical skills.",
    fallbackTitle: 'Resume',
    download: 'Download PDF',
  },
  ko: {
    seoTitle: '이력서',
    seoDescription:
      'Austin Yoo의 이력서: 자동화, 데이터 파이프라인, AI 연동 경험과 핵심 기술 역량.',
    fallbackTitle: '이력서',
    // The PDF is the English resume; say so rather than imply a Korean file.
    download: 'PDF 다운로드 (영문)',
  },
};

const content = {
  en: { raw: resumeEn, skills: skillsEn },
  ko: { raw: resumeKo, skills: skillsKo },
};

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };

  const [, fmBlock, body] = match;
  const data = {};
  fmBlock.split(/\r?\n/).forEach((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"(.*)"$/, '$1');
    data[key] = value;
  });
  return { data, body };
}

export default function Resume() {
  const lang = useLang();
  const t = copy[lang];
  const { raw, skills } = content[lang];
  const { data: frontmatter, body } = useMemo(() => parseFrontmatter(raw), [raw]);

  return (
    <>
      <Seo title={t.seoTitle} description={t.seoDescription} path="/resume" />

      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-navy">
              {frontmatter.title || t.fallbackTitle}
            </h1>
            {frontmatter.summary && (
              <p className="mt-2 max-w-xl text-slate">{frontmatter.summary}</p>
            )}
          </div>
          <a
            href="/resume.pdf"
            download
            className="whitespace-nowrap rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-smart-blue"
          >
            {t.download}
          </a>
        </div>

        <div className="mb-14 grid gap-4 sm:grid-cols-2">
          {Object.entries(skills).map(([category, items]) => (
            <div
              key={category}
              className="rounded-xl border border-slate/10 bg-white p-5"
            >
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <span
                    key={item}
                    className="rounded-md bg-smart-blue/10 px-2.5 py-1 font-mono text-xs text-smart-blue"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <article className="prose prose-slate max-w-none prose-headings:text-navy prose-a:text-smart-blue">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
        </article>
      </section>
    </>
  );
}
