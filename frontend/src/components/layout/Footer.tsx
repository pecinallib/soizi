import { Link } from 'react-router-dom';

export function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-300 mx-auto px-5 md:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <img src="/logo.png" alt="SoIzi" className="h-7 w-auto" />
          <p className="text-sm text-text-muted mt-1">
            Simulador educativo de transferências internacionais.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-text-muted">
          <Link
            to="/glossary"
            className="hover:text-on-surface transition-colors"
          >
            Glossário
          </Link>
          <a
            href="https://github.com/pecinallib/soizi"
            target="_blank"
            rel="noreferrer"
            className="hover:text-on-surface transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
