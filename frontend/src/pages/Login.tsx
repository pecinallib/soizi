import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Globe } from '@/components/ui/Globe';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { api } from '@/services/api';
import { BULLETS, FEATURE_CARDS, TRUST_BADGES } from '@/data/login';

type EmailStatus = 'idle' | 'checking' | 'available' | 'taken';

function IconMail(): React.JSX.Element {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconLock(): React.JSX.Element {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconShield(): React.JSX.Element {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconLockSmall(): React.JSX.Element {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconCheck(): React.JSX.Element {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Sparkline(): React.JSX.Element {
  return (
    <svg viewBox="0 0 56 20" className="w-14 h-5" fill="none">
      <polyline
        points="0,17 8,14 16,15 24,9 32,11 40,5 48,7 56,2"
        stroke="#00d084"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Login(): React.JSX.Element {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle');
  const emailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLogin || !email) return;
    const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidFormat) return;

    if (emailTimerRef.current) clearTimeout(emailTimerRef.current);
    emailTimerRef.current = setTimeout(async () => {
      setEmailStatus('checking');
      try {
        const res = await api.post<{ available: boolean }>(
          '/auth/check-email',
          { email },
        );
        if (res.success && res.data) {
          setEmailStatus(res.data.available ? 'available' : 'taken');
        }
      } catch {
        setEmailStatus('idle');
      }
    }, 500);

    return () => {
      if (emailTimerRef.current) clearTimeout(emailTimerRef.current);
    };
  }, [email, isLogin]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
    setEmailStatus('idle');
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar');
    } finally {
      setIsLoading(false);
    }
  };

  const switchTab = (toLogin: boolean): void => {
    setIsLogin(toLogin);
    setError('');
    setEmailStatus('idle');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-32 -left-32 w-150 h-150 rounded-full opacity-25"
        style={{
          background: 'radial-gradient(circle, #00d084 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 right-0 w-175 h-175 rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 w-100 h-100 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-3 px-6 py-8 lg:px-10 lg:py-10 gap-8 max-w-screen-2xl mx-auto">
        {/* Coluna esquerda */}
        <div className="hidden lg:flex flex-col gap-6 justify-between">
          <Link to="/" className="inline-flex items-center gap-2 w-fit">
            <span className="font-heading text-xl font-bold text-primary">
              SoIzi
            </span>
          </Link>
          <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary-container/20 text-primary rounded-full mb-4">
              Simulador Educativo
            </span>
            <h1 className="font-heading text-4xl font-bold text-secondary leading-tight mb-3">
              Entenda o caminho do seu dinheiro.
            </h1>
            <p className="text-text-muted text-sm leading-relaxed">
              Aprenda de forma simples como funcionam as transferências
              internacionais, taxas e o câmbio na prática.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {BULLETS.map((b) => (
              <div key={b.title} className="flex items-start gap-3">
                <img
                  src={b.icon}
                  alt=""
                  className="w-5 h-5 mt-0.5 shrink-0 object-contain"
                />
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {b.title}
                  </p>
                  <p className="text-xs text-text-muted">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {FEATURE_CARDS.map((card) => (
              <div
                key={card.title}
                className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <img
                  src={card.icon}
                  alt=""
                  className="w-8 h-8 object-contain"
                />
                <h3 className="font-heading font-bold text-on-surface text-sm">
                  {card.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed flex-1">
                  {card.description}
                </p>
                <span className="text-xs text-primary font-semibold">
                  {card.linkText} →
                </span>
              </div>
            ))}
          </div>
          <div className="bg-secondary rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="text-primary-container shrink-0 mt-0.5">
                <IconShield />
              </span>
              <div>
                <p className="text-on-secondary font-semibold text-sm">
                  Ambiente seguro e educativo
                </p>
                <p className="text-on-secondary/60 text-xs mt-1 leading-relaxed">
                  Nada do que você faz aqui envolve dinheiro real. Tudo simulado
                  com segurança para você aprender.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-on-secondary/10 pt-3">
              <span className="text-on-secondary/50 shrink-0">
                <IconLockSmall />
              </span>
              <p className="text-on-secondary/50 text-xs">
                Dados protegidos, não armazenamos informações financeiras.
              </p>
            </div>
          </div>
        </div>

        {/* Coluna central: Globo */}
        <div className="hidden lg:flex items-center justify-center relative">
          <div className="relative w-full">
            <Globe />
            <div
              className="absolute top-12 -right-2 bg-surface/95 backdrop-blur-sm border border-border/60 rounded-xl p-3 min-w-36"
              style={{ boxShadow: 'var(--shadow-modal)' }}
            >
              <p className="text-xs text-text-muted mb-1">Você envia</p>
              <p className="font-heading font-bold text-on-surface">
                R$ 10.000,00
              </p>
              <span className="text-xs text-text-muted mt-1.5 flex items-center gap-1.5">
                <img
                  src="/lp/flags/brl.png"
                  alt="BRL"
                  className="w-4 h-4 object-cover rounded-full shrink-0"
                />
                BRL
              </span>
            </div>
            <div
              className="absolute bottom-24 -left-2 bg-surface/95 backdrop-blur-sm border border-border/60 rounded-xl p-3 min-w-36"
              style={{ boxShadow: 'var(--shadow-modal)' }}
            >
              <p className="text-xs text-text-muted mb-1">
                Beneficiário recebe
              </p>
              <p className="font-heading font-bold text-on-surface">
                $ 1.854,21
              </p>
              <span className="text-xs text-text-muted mt-1.5 flex items-center gap-1.5">
                <img
                  src="/lp/flags/eua.png"
                  alt="USD"
                  className="w-4 h-4 object-cover rounded-full shrink-0"
                />
                USD
              </span>
            </div>
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface/95 backdrop-blur-sm border border-border/60 rounded-xl p-3"
              style={{ boxShadow: 'var(--shadow-modal)' }}
            >
              <p className="text-xs text-text-muted">Cotação comercial</p>
              <p className="text-xs text-text-muted mb-1">USD/BRL</p>
              <div className="flex items-center gap-3">
                <p className="font-heading font-bold text-on-surface text-lg tabular-nums">
                  5,39
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary font-semibold">
                    +1,25%
                  </span>
                  <Sparkline />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna direita: Formulário */}
        <div className="flex items-center justify-center">
          <div
            className="w-full max-w-md bg-surface border border-border rounded-2xl p-8"
            style={{ boxShadow: 'var(--shadow-modal)' }}
          >
            <div className="flex gap-6 mb-8 border-b border-border">
              {(['Entrar', 'Cadastrar'] as const).map((label) => {
                const active = label === 'Entrar' ? isLogin : !isLogin;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => switchTab(label === 'Entrar')}
                    className={`pb-3 text-lg font-heading font-bold transition-colors cursor-pointer ${active ? 'text-on-surface border-b-2 border-primary-container' : 'text-text-muted'}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="p-3 bg-error-container rounded-lg">
                  <p className="text-sm text-on-error-container">{error}</p>
                </div>
              )}

              {!isLogin && (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="name"
                    className="text-sm font-semibold text-on-surface"
                  >
                    Nome
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                    </span>
                    <input
                      id="name"
                      type="text"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-on-surface"
                >
                  E-mail
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                    <IconMail />
                  </span>
                  <input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    className={`w-full pl-10 py-3 bg-surface border rounded-lg text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-container transition-all ${!isLogin && emailStatus !== 'idle' ? 'pr-10' : 'pr-4'} ${emailStatus === 'taken' ? 'border-[#ef4444]' : emailStatus === 'available' ? 'border-[#00d084]' : 'border-border'}`}
                  />
                  {!isLogin && emailStatus !== 'idle' && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold">
                      {emailStatus === 'checking' && (
                        <span className="text-text-muted animate-pulse">…</span>
                      )}
                      {emailStatus === 'available' && (
                        <span style={{ color: '#00d084' }}>✓</span>
                      )}
                      {emailStatus === 'taken' && (
                        <span style={{ color: '#ef4444' }}>✗</span>
                      )}
                    </span>
                  )}
                </div>
                {!isLogin && emailStatus === 'taken' && (
                  <p className="text-xs" style={{ color: '#ef4444' }}>
                    Este email já está cadastrado.
                  </p>
                )}
                {!isLogin && emailStatus === 'available' && (
                  <p className="text-xs" style={{ color: '#00d084' }}>
                    Email disponível.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-on-surface"
                  >
                    Senha
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline cursor-pointer"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                    <IconLock />
                  </span>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                  />
                </div>
                {!isLogin && <PasswordStrength password={password} />}
              </div>

              <div className="bg-surface-container rounded-lg p-4 border border-border">
                <div className="flex items-start gap-3">
                  <img
                    src="/lp/icons/aprender-login.png"
                    alt=""
                    className="w-5 h-5 mt-0.5 shrink-0 object-contain"
                  />
                  <div>
                    <p className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                      Simulador Educativo SoIzi
                      <button
                        type="button"
                        className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-tertiary bg-tertiary/10 rounded-full hover:bg-tertiary/20 transition-colors cursor-pointer"
                      >
                        ?
                      </button>
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Aprenda sobre câmbio, taxas e remessas sem gastar nada.
                      Simulação 100% educativa.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-primary-container text-on-primary-container font-bold text-base rounded-lg hover:brightness-110 active:brightness-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? 'Processando...'
                  : isLogin
                    ? 'Acessar simulador'
                    : 'Começar a aprender'}
              </button>
            </form>

            <div className="flex items-center justify-center gap-4 mt-6 pt-5 border-t border-border flex-wrap">
              {TRUST_BADGES.map((badge) => (
                <span
                  key={badge}
                  className="flex items-center gap-1 text-xs text-text-muted"
                >
                  <span className="text-primary">
                    <IconCheck />
                  </span>
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
