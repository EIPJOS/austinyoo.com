import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Layout from './components/Layout.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const Projects = lazy(() => import('./pages/Projects.jsx'));
const Resume = lazy(() => import('./pages/Resume.jsx'));
const Quote = lazy(() => import('./pages/Quote.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<div className="py-24 text-center text-slate">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Analytics />
    </Layout>
  );
}
