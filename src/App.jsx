import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Layout from './components/Layout.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const Projects = lazy(() => import('./pages/Projects.jsx'));
const Resume = lazy(() => import('./pages/Resume.jsx'));
const Tools = lazy(() => import('./pages/Tools.jsx'));
const Quote = lazy(() => import('./pages/Quote.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

// The same pages are mounted twice: at "/" (English) and under "/ko" (Korean).
// Each page reads the language from the URL (see src/i18n).
const pageRoutes = () => [
  <Route key="home" index element={<Home />} />,
  <Route key="projects" path="projects" element={<Projects />} />,
  <Route key="resume" path="resume" element={<Resume />} />,
  <Route key="tools" path="tools" element={<Tools />} />,
  <Route key="quote" path="quote" element={<Quote />} />,
  <Route key="contact" path="contact" element={<Contact />} />,
  <Route key="notfound" path="*" element={<NotFound />} />,
];

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<div className="py-24 text-center text-slate">Loading…</div>}>
        <Routes>
          <Route path="/">{pageRoutes()}</Route>
          <Route path="/ko">{pageRoutes()}</Route>
        </Routes>
      </Suspense>
      <Analytics />
    </Layout>
  );
}
