import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui';
import { LuMenu, LuX, LuLayoutDashboard, LuArrowLeftRight, LuBookOpen, LuLogOut, LuSend } from 'react-icons/lu';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', Icon: LuLayoutDashboard },
  { to: '/converter', label: 'Conversor', Icon: LuArrowLeftRight },
  { to: '/glossary', label: 'Glossário', Icon: LuBookOpen },
];

export function Navbar(): React.JSX.Element {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string): boolean => location.pathname === path;

  return (
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-border">
      <nav className="max-w-300 mx-auto px-5 md:px-10 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" onClick={() => setMobileOpen(false)}>
          <img
            src="/logo.png"
            alt="SoIzi"
            className="h-auto w-24 hover:scale-105 transition-transform duration-200"
          />
        </Link>

        {/* Desktop links */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 group ${
                  isActive(to) ? 'text-primary' : 'text-text-muted hover:text-on-surface'
                }`}
              >
                {label}
                <span
                  className={`absolute bottom-1 left-4 right-4 h-0.5 bg-primary rounded-full origin-left transition-all duration-300 ${
                    isActive(to) ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-50'
                  }`}
                />
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Desktop actions */}
              <div className="hidden md:flex items-center gap-3">
                <Link to="/simulator">
                  <Button size="sm">Nova Simulação</Button>
                </Link>
                <div className="w-px h-5 bg-border" />
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-primary-container rounded-full flex items-center justify-center ring-2 ring-primary/20">
                    <span className="text-sm font-bold text-on-primary-container">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-sm text-text-muted hover:text-on-surface transition-colors cursor-pointer"
                  >
                    Sair
                  </button>
                </div>
              </div>

              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                className="md:hidden relative w-9 h-9 flex items-center justify-center rounded-xl bg-surface-container/60 hover:bg-surface-container transition-colors cursor-pointer"
                aria-label="Menu"
              >
                <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${mobileOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}>
                  <LuMenu size={18} className="text-on-surface" />
                </span>
                <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${mobileOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`}>
                  <LuX size={18} className="text-on-surface" />
                </span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Cadastrar</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile menu — painel expansível */}
      {isAuthenticated && (
        <div
          className="md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-border/50"
          style={{ maxHeight: mobileOpen ? '360px' : '0px' }}
        >
          <div className="bg-surface/95 backdrop-blur-md px-4 pt-4 pb-5 flex flex-col gap-1.5">
            {NAV_LINKS.map(({ to, label, Icon }, i) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-muted hover:bg-surface-container hover:text-on-surface'
                }`}
                style={{ transitionDelay: mobileOpen ? `${i * 40}ms` : '0ms' }}
              >
                <Icon size={16} className={isActive(to) ? 'text-primary' : 'text-text-muted'} />
                {label}
                {isActive(to) && <span className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" />}
              </Link>
            ))}

            {/* Divider + user card */}
            <div className="mt-2 pt-3 border-t border-border/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 shrink-0 bg-primary-container rounded-full flex items-center justify-center ring-2 ring-primary/20">
                  <span className="text-sm font-bold text-on-primary-container">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-on-surface truncate">{user?.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link to="/simulator" onClick={() => setMobileOpen(false)}>
                  <Button size="sm">
                    <LuSend size={13} className="mr-1.5" />
                    Simular
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                  aria-label="Sair"
                >
                  <LuLogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
