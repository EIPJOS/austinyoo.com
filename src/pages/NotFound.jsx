import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { useLang, useLocalePath } from '../i18n/index.js';

const copy = {
  en: { title: 'Page Not Found', description: 'This page does not exist.', message: "This page doesn't exist.", back: 'Back to home' },
  ko: { title: '페이지를 찾을 수 없습니다', description: '존재하지 않는 페이지입니다.', message: '존재하지 않는 페이지예요.', back: '홈으로 돌아가기' },
};

export default function NotFound() {
  const t = copy[useLang()];
  const lp = useLocalePath();
  return (
    <>
      <Seo title={t.title} description={t.description} path="/404" />
      <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
        <h1 className="text-4xl font-bold text-navy">404</h1>
        <p className="mt-3 text-slate">{t.message}</p>
        <Link to={lp('/')} className="mt-6 text-smart-blue hover:underline">
          {t.back}
        </Link>
      </section>
    </>
  );
}
