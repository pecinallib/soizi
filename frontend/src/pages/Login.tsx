import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function Login(): React.JSX.Element {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent): Promise<void> => {
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 max-w-300 mx-auto w-full px-5 md:px-10 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left - Hero */}
          <div className="flex flex-col gap-8">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary-container/20 text-primary rounded-full mb-6">
                Simulador Educativo
              </span>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-secondary leading-tight">
                Aprenda como funciona enviar dinheiro para o exterior.
              </h1>
              <p className="text-text-muted text-lg mt-4">
                Temos o nosso próprio jeitinho de descomplicar transferências
                internacionais.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className="bg-surface border border-border rounded-xl p-5 hover:border-primary-container transition-colors"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div className="w-10 h-10 bg-primary-container/20 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-primary text-lg font-bold">💱</span>
                </div>
                <h3 className="font-heading font-bold text-on-surface mb-1">
                  Câmbio Simulado
                </h3>
                <p className="text-sm text-text-muted">
                  Entenda taxas de câmbio reais sem gastar um centavo.
                </p>
              </div>

              <div className="bg-primary rounded-xl p-5 text-on-primary">
                <div className="w-10 h-10 bg-on-primary/20 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-lg">📚</span>
                </div>
                <h3 className="font-heading font-bold mb-1">SoIzi Method</h3>
                <p className="text-sm opacity-90">
                  Cada conceito explicado de forma simples com o botão "O que é
                  isso?"
                </p>
              </div>
            </div>

            {/* Testimonial */}
            <div className="relative rounded-xl overflow-hidden">
              <div className="bg-secondary p-6 rounded-xl">
                <p className="text-on-secondary text-sm italic leading-relaxed">
                  "Finalmente entendi o que é spread, IOF e como funcionam
                  remessas internacionais. O SoIzi explica tudo de um jeito que
                  qualquer pessoa entende."
                </p>
                <p className="text-on-secondary/70 text-sm mt-3 font-semibold">
                  — Maria S., Usuária SoIzi
                </p>
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div
            className="bg-surface border border-border rounded-2xl p-8"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            {/* Tabs */}
            <div className="flex gap-6 mb-8 border-b border-border">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className={`pb-3 text-lg font-heading font-bold transition-colors cursor-pointer ${isLogin ? 'text-on-surface border-b-2 border-primary-container' : 'text-text-muted'}`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className={`pb-3 text-lg font-heading font-bold transition-colors cursor-pointer ${!isLogin ? 'text-on-surface border-b-2 border-primary-container' : 'text-text-muted'}`}
              >
                Cadastrar
              </button>
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
                  <input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-on-surface"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                />
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
                      className="text-xs text-tertiary hover:underline cursor-pointer"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                />
              </div>

              {/* Info Box - SoIzi Method */}
              <div className="bg-surface-container rounded-lg p-4 border border-border">
                <div className="flex items-start gap-3">
                  <span className="text-primary-container text-lg">🎓</span>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Simulador Educativo SoIzi
                      <button
                        type="button"
                        className="inline-flex items-center justify-center w-5 h-5 ml-1.5 text-xs font-bold text-tertiary bg-tertiary/10 rounded-full hover:bg-tertiary/20 transition-colors cursor-pointer"
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
          </div>
        </div>
      </main>
    </div>
  );
}
