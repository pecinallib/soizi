import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui';

export function Navbar(): React.JSX.Element {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string): string =>
    location.pathname === path
      ? 'text-primary font-semibold border-b-2 border-primary-container'
      : 'text-text-muted hover:text-on-surface';

  return (
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-border">
      <nav className="max-w-300 mx-auto px-5 md:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-heading text-xl font-bold text-primary">
            SoIzi
          </Link>

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/dashboard"
                className={`text-sm pb-1 transition-colors ${isActive('/dashboard')}`}
              >
                Dashboard
              </Link>
              <Link
                to="/converter"
                className={`text-sm pb-1 transition-colors ${isActive('/converter')}`}
              >
                Conversor
              </Link>
              <Link
                to="/glossary"
                className={`text-sm pb-1 transition-colors ${isActive('/glossary')}`}
              >
                Glossário
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/simulator">
                <Button size="sm">Nova Simulação</Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-container rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-on-primary-container">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-text-muted hover:text-on-surface transition-colors cursor-pointer"
                >
                  Sair
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Cadastrar</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
