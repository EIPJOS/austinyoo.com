import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/resume', label: 'Resume' },
  { to: '/contact', label: 'Contact' },
];

function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate/10 bg-light-bg/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="font-mono text-lg font-semibold text-navy">
          Austin Yoo
        </NavLink>
        <ul className="flex gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `transition-colors hover:text-smart-blue ${
                    isActive ? 'text-smart-blue' : 'text-slate'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate/10 bg-navy text-light-bg">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-300">
          &copy; {new Date().getFullYear()} Austin Yoo. All rights reserved.
        </p>
        <div className="flex gap-5 text-sm">
          <a
            href="mailto:hello@austinyoo.com"
            className="hover:text-smart-blue"
          >
            Email
          </a>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-smart-blue"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/"
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
