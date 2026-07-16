const statusStyles = {
  Live: 'bg-green-100 text-green-700',
  'In Development': 'bg-amber-100 text-amber-700',
  'Launching Soon': 'bg-blue-100 text-blue-700',
};

export default function ProjectCard({ project }) {
  const { name, url, description, tech, status, highlight } = project;

  return (
    <div className="flex flex-col rounded-xl border border-slate/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-navy">{name}</h3>
        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
            statusStyles[status] || 'bg-slate-100 text-slate'
          }`}
        >
          {status}
        </span>
      </div>
      <p className="mb-4 text-sm text-slate">{description}</p>
      {highlight && (
        <p className="mb-4 text-sm font-medium text-smart-blue">{highlight}</p>
      )}
      <div className="mb-5 mt-auto flex flex-wrap gap-2">
        {tech.map((t) => (
          <span
            key={t}
            className="rounded-md bg-navy/5 px-2 py-1 font-mono text-xs text-navy"
          >
            {t}
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
          Visit site →
        </a>
      )}
    </div>
  );
}
