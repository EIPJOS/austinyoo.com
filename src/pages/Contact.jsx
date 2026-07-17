import Seo from '../components/Seo.jsx';

export default function Contact() {
  return (
    <>
      <Seo
        title="Contact"
        description="Get in touch with Austin Yoo — email and LinkedIn."
        path="/contact"
      />

      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <img
          src="/austin-yoo.png"
          alt="Austin Yoo"
          className="mx-auto mb-6 h-24 w-24 rounded-full border-4 border-white object-cover shadow-md"
        />
        <h1 className="text-3xl font-bold text-navy">Get in Touch</h1>
        <p className="mt-4 text-slate">
          Interested in collaborating, hiring, or just want to talk about
          automation and data pipelines? Reach out.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <a
            href="mailto:austinyooe@gmail.com"
            className="rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-smart-blue"
          >
            austinyooe@gmail.com
          </a>
          <div className="flex gap-6 text-sm font-medium text-slate">
            <a href="https://www.linkedin.com/in/austin-yoo-fbm1999/" target="_blank" rel="noreferrer" className="hover:text-smart-blue">
              LinkedIn
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
