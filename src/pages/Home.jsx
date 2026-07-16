import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import projects from '../data/projects.json';

const techBadges = [
  'GitHub Actions',
  'Supabase',
  'React',
  'Vite',
  'Vercel',
  'Anthropic API',
];

export default function Home() {
  const featured = projects.slice(0, 3);

  return (
    <>
      <Seo
        title="Home"
        description="Austin Yoo is an automation-first builder shipping data pipelines, AI content systems, and full-stack platforms."
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Austin Yoo',
          url: 'https://austinyoo.com',
          jobTitle: 'Automation-First Builder',
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
        <p className="mt-3 font-mono text-smart-blue">Automation-First Builder</p>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate">
          I design and ship automated data pipelines, AI-driven content systems,
          and full-stack web platforms — from raw data source to a live,
          revenue-generating product.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/resume"
            className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-smart-blue"
          >
            View Full Resume
          </Link>
          <Link
            to="/projects"
            className="rounded-lg border border-navy px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-smart-blue hover:text-smart-blue"
          >
            Explore Projects
          </Link>
        </div>

        <div className="mt-14 flex flex-wrap justify-center gap-3">
          {techBadges.map((t) => (
            <span
              key={t}
              className="rounded-full border border-slate/20 bg-white px-4 py-1.5 font-mono text-xs text-slate"
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="mb-8 text-2xl font-semibold text-navy">Featured Projects</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>
    </>
  );
}
