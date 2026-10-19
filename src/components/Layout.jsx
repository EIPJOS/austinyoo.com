import { Link, NavLink, useLocation } from 'react-router-dom';
import { localePath, rememberLang, stripLang, useLang, useLocalePath } from '../i18n/index.js';

const copy = {
  en: {
    nav: { home: 'Home', projects: 'Projects', resume: 'Resume', tools: 'Tools', quote: 'Quote', contact: 'Contact' },
    rights: 'All rights reserved.',
    email: 'Email',
    switchLabel: 'Language',
  },
  ko: {
    nav: { home: '홈', projects: '프로젝트', resume: '이력서', tools: '도구', quote: '견적', contact: '문의' },
    rights: '모든 권리 보유.',
    email: '이메일',
    switchLabel: '언어',
  },
};

const navItems = [
  { to: '/', key: 'home' },
  { to: '/projects', key: 'projects' },
  { to: '/resume', key: 'resume' },
  { to: '/tools', key: 'tools' },
  { to: '/quote', key: 'quote' },
  { to: '/contact', key: 'contact' },
];

function LanguageSwitcher() {
  const lang = useLang();
  const { pathname, search, hash } = useLocation();
  const base = stripLang(pathname);

  const options = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'ko', label: '한국어', name: '한국어' },
  ];

  return (
    <div
      role="group"
      aria-label={copy[lang].switchLabel}
      className="flex items-center rounded-full border border-slate/20 bg-white p-0.5 text-xs font-semibold"
    >
      {options.map(({ code, label, name }) => (
        <Link
          key={code}
          to={`${localePath(code, base)}${search}${hash}`}
          onClick={() => rememberLang(code)}
          hrefLang={code}
          lang={code}
          title={name}
          aria-current={lang === code ? 'true' : undefined}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            lang === code ? 'bg-navy text-white' : 'text-slate hover:text-smart-blue'
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

function NavBar() {
  const lang = useLang();
  const lp = useLocalePath();
  const t = copy[lang];

  return (
    <header className="sticky top-0 z-50 border-b border-slate/10 bg-light-bg/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4">
        <NavLink to={lp('/')} className="font-mono text-lg font-semibold text-navy">
          Austin Yoo
        </NavLink>
        <ul className="order-last flex w-full flex-wrap gap-x-3 gap-y-1 text-[13px] font-medium sm:order-none sm:w-auto sm:gap-x-6 sm:text-sm">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={lp(item.to)}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `transition-colors hover:text-smart-blue ${
                    isActive ? 'text-smart-blue' : 'text-slate'
                  }`
                }
              >
                {t.nav[item.key]}
              </NavLink>
            </li>
          ))}
        </ul>
        <LanguageSwitcher />
      </nav>
    </header>
  );
}

function Footer() {
  const t = copy[useLang()];
  return (
    <footer className="border-t border-slate/10 bg-navy text-light-bg">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-300">
          &copy; {new Date().getFullYear()} Austin Yoo. {t.rights}
        </p>
        <div className="flex gap-5 text-sm">
          <a
            href="mailto:austinyooe@gmail.com"
            className="hover:text-smart-blue"
          >
            {t.email}
          </a>
          <a
            href="https://www.linkedin.com/in/austin-yoo-fbm1999/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-smart-blue"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
