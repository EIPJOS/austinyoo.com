import { useState } from 'react';
import Seo from '../components/Seo.jsx';

const initialForm = { name: '', email: '', message: '', company: '' };

export default function Contact() {
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

  return (
    <>
      <Seo
        title="Contact"
        description="Get in touch with Austin Yoo — send a message directly or connect on LinkedIn."
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
          automation and data pipelines? Send a message below.
        </p>

        {status === 'sent' ? (
          <div className="mt-10 rounded-lg border border-smart-blue/20 bg-smart-blue/5 px-6 py-8 text-navy">
            <p className="font-semibold">Message sent — thanks for reaching out!</p>
            <p className="mt-2 text-sm text-slate">I'll get back to you soon.</p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-4 text-sm font-medium text-smart-blue hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 text-left">
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-navy">
                  Name
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
                  Email
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
              <label htmlFor="message" className="block text-sm font-medium text-navy">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
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
              className="mt-6 w-full rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-smart-blue disabled:opacity-60 sm:w-auto"
            >
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}

        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex gap-6 text-sm font-medium text-slate">
            <a
              href="mailto:austinyooe@gmail.com"
              className="hover:text-smart-blue"
            >
              austinyooe@gmail.com
            </a>
            <a href="https://www.linkedin.com/in/austin-yoo-fbm1999/" target="_blank" rel="noreferrer" className="hover:text-smart-blue">
              LinkedIn
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
