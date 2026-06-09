import { LuGithub, LuLinkedin, LuGlobe } from 'react-icons/lu';

const SOCIAL = [
  { href: 'https://www.linkedin.com/in/dev-pecinalli/', Icon: LuLinkedin, label: 'LinkedIn' },
  { href: 'https://github.com/pecinallib', Icon: LuGithub, label: 'GitHub' },
  { href: 'https://pecinalli-dev.vercel.app/', Icon: LuGlobe, label: 'Portfólio' },
];

export function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="max-w-300 mx-auto px-5 md:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <img src="/logo.png" alt="SoIzi" className="h-auto w-20" />
          <p className="text-sm text-text-muted">
            Simulador educativo de transferências internacionais.
          </p>
        </div>

        {/* Creator */}
        <div className="flex flex-col items-center md:items-end gap-2">
          <p className="text-xs text-text-muted/60">Idealizado e desenvolvido por</p>
          <p className="text-sm font-semibold text-on-surface">Matheus Pecinalli</p>
          <div className="flex items-center gap-2 mt-1">
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

      {/* Bottom bar */}
      <div className="border-t border-border/50 px-5 md:px-10 py-3">
        <p className="text-xs text-text-muted/50 text-center">
          © {new Date().getFullYear()} SoIzi · Projeto educativo sem fins lucrativos
        </p>
      </div>
    </footer>
  );
}
