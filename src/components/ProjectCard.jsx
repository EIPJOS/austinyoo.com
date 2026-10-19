import { useLang } from '../i18n/index.js';

const statusStyles = {
  Live: 'bg-green-100 text-green-700',
  'In Development': 'bg-amber-100 text-amber-700',
  'Launching Soon': 'bg-blue-100 text-blue-700',
};

const copy = {
  en: {
    status: { Live: 'Live', 'In Development': 'In Development', 'Launching Soon': 'Launching Soon' },
    visit: 'Visit site →',
    screenshot: 'screenshot',
  },
  ko: {
    status: { Live: '운영 중', 'In Development': '개발 중', 'Launching Soon': '출시 예정' },
    visit: '사이트 방문 →',
    screenshot: '스크린샷',
  },
};

export default function ProjectCard({ project }) {
  const lang = useLang();
  const t = copy[lang];
  // Korean overrides (description, highlight) live under project.ko in projects.json.
  const localized = lang === 'ko' && project.ko ? { ...project, ...project.ko } : project;
  const { name, url, image, description, tech, status, highlight } = localized;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate/10 bg-white shadow-sm transition-shadow hover:shadow-md">
      {image && (
        <img
          src={image}
          alt={`${name} ${t.screenshot}`}
          className="h-40 w-full border-b border-slate/10 object-cover object-top"
          loading="lazy"
        />
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-navy">{name}</h3>
          <span
            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
              statusStyles[status] || 'bg-slate-100 text-slate'
            }`}
          >
            {t.status[status] || status}
          </span>
        </div>
        <p className="mb-4 text-sm text-slate">{description}</p>
        {highlight && (
          <p className="mb-4 text-sm font-medium text-smart-blue">{highlight}</p>
        )}
        <div className="mb-5 mt-auto flex flex-wrap gap-2">
          {tech.map((item) => (
            <span
              key={item}
              className="rounded-md bg-navy/5 px-2 py-1 font-mono text-xs text-navy"
            >
              {item}
            </span>
          ))}
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-smart-blue hover:underline"
          >
            {t.visit}
          </a>
        )}
      </div>
    </div>
  );
}
