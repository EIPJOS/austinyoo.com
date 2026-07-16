import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';

export default function NotFound() {
  return (
    <>
      <Seo title="Page Not Found" description="This page does not exist." path="/404" />
      <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
        <h1 className="text-4xl font-bold text-navy">404</h1>
        <p className="mt-3 text-slate">This page doesn't exist.</p>
        <Link to="/" className="mt-6 text-smart-blue hover:underline">
          Back to home
        </Link>
      </section>
    </>
  );
}
