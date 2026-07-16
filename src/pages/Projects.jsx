import Seo from '../components/Seo.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import projects from '../data/projects.json';

export default function Projects() {
  return (
    <>
      <Seo
        title="Projects"
        description="A collection of automation, data pipeline, and AI-driven products built by Austin Yoo, including USGridExplorer, Daily365, and ImportRadar KR."
        path="/projects"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: projects.map((p, i) => ({
            '@type': 'CreativeWork',
            position: i + 1,
            name: p.name,
            description: p.description,
            url: p.url || undefined,
          })),
        }}
      />

      <section className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="text-3xl font-bold text-navy">Projects</h1>
        <p className="mt-3 max-w-2xl text-slate">
          Automation, data pipelines, and AI-integrated platforms — shipped and
          in progress.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>

        <div className="mt-16 border-t border-slate/10 pt-10">
          <h2 className="text-xl font-semibold text-navy">Other Projects</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate">
            <li>Fable modding — game modification and tooling</li>
            <li>Family business Wix website build</li>
          </ul>
        </div>
      </section>
    </>
  );
}
