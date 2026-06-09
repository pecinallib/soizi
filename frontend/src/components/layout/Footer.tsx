import { Link } from 'react-router-dom';
import { LuGithub, LuLinkedin, LuGlobe, LuLayoutDashboard, LuArrowLeftRight, LuBookOpen, LuSend } from 'react-icons/lu';

const SOCIAL = [
  { href: 'https://www.linkedin.com/in/dev-pecinalli/', Icon: LuLinkedin, label: 'LinkedIn' },
  { href: 'https://github.com/pecinallib', Icon: LuGithub, label: 'GitHub' },
  { href: 'https://pecinalli-dev.vercel.app/', Icon: LuGlobe, label: 'Portfólio' },
];

const NAV = [
  { to: '/dashboard', label: 'Dashboard', Icon: LuLayoutDashboard },
  { to: '/converter', label: 'Conversor', Icon: LuArrowLeftRight },
  { to: '/glossary', label: 'Glossário', Icon: LuBookOpen },
  { to: '/simulator', label: 'Simulador', Icon: LuSend },
];

export function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="max-w-300 mx-auto px-5 md:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand + creator */}
          <div className="flex flex-col gap-5">
            <img src="/logo.png" alt="SoIzi" className="h-auto w-24" />
            <p className="text-sm text-text-muted leading-relaxed max-w-xs">
              Simulador educativo de transferências internacionais. Aprenda como o dinheiro se move pelo mundo, sem letras miúdas.
            </p>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-text-muted/60 uppercase tracking-widest">Idealizado e desenvolvido por</p>
              <p className="text-sm font-semibold text-on-surface">Matheus Pecinalli</p>
              <div className="flex items-center gap-3 mt-1">
                {SOCIAL.map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-muted hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-200"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-5">Navegação</h3>
            <ul className="flex flex-col gap-3">
              {NAV.map(({ to, label, Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="flex items-center gap-2.5 text-sm text-text-muted hover:text-primary transition-colors duration-200 group"
                  >
                    <Icon size={14} className="group-hover:scale-110 transition-transform duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Creator links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-5">Criador</h3>
            <ul className="flex flex-col gap-3">
              {SOCIAL.map(({ href, Icon, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 text-sm text-text-muted hover:text-primary transition-colors duration-200 group"
                  >
                    <Icon size={14} className="group-hover:scale-110 transition-transform duration-200" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted/60">
            © {new Date().getFullYear()} SoIzi · Projeto educativo sem fins lucrativos
          </p>
          <p className="text-xs text-text-muted/50">
            Feito com ♥ por{' '}
            <a
              href="https://pecinalli-dev.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors"
            >
              Matheus Pecinalli
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
