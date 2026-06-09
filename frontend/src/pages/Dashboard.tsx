import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LuArrowLeftRight,
  LuGlobe,
  LuWallet,
  LuTrendingUp,
  LuBookOpen,
} from 'react-icons/lu';
import { IoArrowForwardCircleOutline } from 'react-icons/io5';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';
import { Card, Button, ExplanationTrigger } from '@/components/ui';
import { Navbar, Footer } from '@/components/layout';
import type { Remittance, PaginatedResponse, Wallet, Portfolio } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PROCESSING: 'Processando',
  COMPLETED: 'Concluída',
  FAILED: 'Falhou',
  CANCELLED: 'Cancelada',
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function formatBRL(value: string | number): string {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  subPositive?: boolean;
  isLoading: boolean;
  explanation?: { title: string; description: string; example?: string };
}

function StatCard({ label, value, sub, subPositive, isLoading, explanation }: StatCardProps): React.JSX.Element {
  return (
    <div
      className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-1"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <span className="text-xs font-semibold text-text-muted flex items-center gap-1">
        {label}
        {explanation && <ExplanationTrigger explanation={explanation} />}
      </span>
      {isLoading ? (
        <div className="h-8 w-32 bg-border/40 rounded animate-pulse mt-1" />
      ) : (
        <span className="font-heading text-2xl font-bold text-on-surface tabular-nums">
          {value}
        </span>
      )}
      {sub && !isLoading && (
        <span
          className="text-xs font-semibold"
          style={{ color: subPositive ? '#00d084' : '#ef4444' }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

export function Dashboard(): React.JSX.Element {
  const { user } = useAuth();
  const [remittances, setRemittances] = useState<Remittance[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const [remRes, walletRes, portfolioRes] = await Promise.all([
          api.get<PaginatedResponse<Remittance>>('/remittance?limit=5'),
          api.get<Wallet>('/wallet'),
          api.get<Portfolio>('/portfolio'),
        ]);

        if (remRes.success && remRes.data) setRemittances(remRes.data.remittances);
        if (walletRes.success && walletRes.data) setWallet(walletRes.data);
        if (portfolioRes.success && portfolioRes.data) setPortfolio(portfolioRes.data);
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const portfolioCurrentValue = portfolio
    ? portfolio.positions.reduce((sum, p) => sum + Number(p.currentValueBRL), 0)
    : 0;

  const portfolioPnl = portfolio
    ? portfolioCurrentValue - Number(portfolio.totalInvestedBRL)
    : 0;

  const portfolioPnlPercent =
    portfolio && Number(portfolio.totalInvestedBRL) > 0
      ? (portfolioPnl / Number(portfolio.totalInvestedBRL)) * 100
      : 0;

  const hasPortfolio = portfolio && portfolio.positions.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-300 mx-auto w-full px-5 md:px-10 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-on-surface">
              {greeting()}, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-text-muted mt-1">
              Continue aprendendo sobre transferências internacionais.
            </p>
          </div>
          <Link to="/simulator">
            <Button>Nova Simulação</Button>
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Saldo da Carteira"
            value={wallet ? formatBRL(wallet.balance) : 'R$ 0,00'}
            isLoading={isLoading}
            explanation={{
              title: 'O que é o saldo fictício?',
              description:
                'Ao criar sua conta você recebe R$50.000 fictícios para simular investimentos e remessas. Nenhum dinheiro real é movimentado.',
              example: 'Use seu saldo para comprar ações ou simular envios internacionais.',
            }}
          />

          <StatCard
            label="Portfólio Atual"
            value={hasPortfolio ? formatBRL(portfolioCurrentValue) : '—'}
            sub={
              hasPortfolio
                ? `${portfolioPnl >= 0 ? '+' : ''}${formatBRL(portfolioPnl)} (${portfolioPnlPercent >= 0 ? '+' : ''}${portfolioPnlPercent.toFixed(2)}%)`
                : 'Nenhum investimento ainda'
            }
            subPositive={portfolioPnl >= 0}
            isLoading={isLoading}
            explanation={{
              title: 'O que é P&L?',
              description:
                'P&L (Profit and Loss) é o lucro ou prejuízo total das suas posições em ações. Mostra quanto você ganhou ou perdeu em relação ao preço médio de compra.',
              example: 'Se comprou 10 ações a R$100 e agora valem R$120, seu P&L é +R$200 (+20%).',
            }}
          />

          <StatCard
            label="Total Investido"
            value={hasPortfolio ? formatBRL(portfolio!.totalInvestedBRL) : '—'}
            sub={hasPortfolio ? `${portfolio!.positions.length} posição${portfolio!.positions.length !== 1 ? 'ões' : ''}` : undefined}
            subPositive
            isLoading={isLoading}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Link to="/converter">
            <Card className="hover:border-primary-container transition-colors cursor-pointer h-full">
              <div className="flex flex-col items-center text-center gap-2 py-1">
                <div className="w-10 h-10 bg-primary-container/20 rounded-lg flex items-center justify-center">
                  <LuArrowLeftRight size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface text-sm">Conversor</h3>
                  <p className="text-xs text-text-muted">Taxas em tempo real</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/simulator">
            <Card className="hover:border-primary-container transition-colors cursor-pointer h-full">
              <div className="flex flex-col items-center text-center gap-2 py-1">
                <div className="w-10 h-10 bg-primary-container/20 rounded-lg flex items-center justify-center">
                  <LuGlobe size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface text-sm">Simular Envio</h3>
                  <p className="text-xs text-text-muted">Como funciona uma remessa</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/wallet">
            <Card className="hover:border-primary-container transition-colors cursor-pointer h-full">
              <div className="flex flex-col items-center text-center gap-2 py-1">
                <div className="w-10 h-10 bg-primary-container/20 rounded-lg flex items-center justify-center">
                  <LuWallet size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface text-sm">Carteira</h3>
                  <p className="text-xs text-text-muted">Saldo e extrato</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/invest">
            <Card className="hover:border-primary-container transition-colors cursor-pointer h-full">
              <div className="flex flex-col items-center text-center gap-2 py-1">
                <div className="w-10 h-10 bg-tertiary/10 rounded-lg flex items-center justify-center">
                  <LuTrendingUp size={20} className="text-tertiary" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface text-sm">Investir</h3>
                  <p className="text-xs text-text-muted">Comprar e vender ações</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/glossary">
            <Card className="hover:border-primary-container transition-colors cursor-pointer h-full">
              <div className="flex flex-col items-center text-center gap-2 py-1">
                <div className="w-10 h-10 bg-tertiary/10 rounded-lg flex items-center justify-center">
                  <LuBookOpen size={20} className="text-tertiary" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface text-sm">Glossário</h3>
                  <p className="text-xs text-text-muted">Termos financeiros</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Bottom grid: posições + remessas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Posições do Portfólio */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-base font-bold text-on-surface flex items-center gap-1">
                Suas Posições
                <ExplanationTrigger
                  explanation={{
                    title: 'O que são posições?',
                    description:
                      'Uma posição é uma quantidade de ações que você possui. Cada vez que compra ações de uma empresa, abre uma posição nela.',
                    example: 'Comprou 5 ações da Apple (AAPL)? Você tem uma posição em AAPL.',
                  }}
                />
              </h2>
              <Link to="/invest" className="text-xs text-primary font-semibold hover:underline">
                Ver tudo <IoArrowForwardCircleOutline className="inline ml-1" size={14} />
              </Link>
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-border/30 rounded animate-pulse" />
                ))}
              </div>
            ) : !hasPortfolio ? (
              <div className="text-center py-6">
                <p className="text-text-muted text-sm mb-3">
                  Você ainda não investiu nada.
                </p>
                <Link to="/invest">
                  <Button variant="outlined" size="sm">Explorar ações</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {portfolio!.positions.slice(0, 4).map((pos) => {
                  const pnl = Number(pos.pnlPercent);
                  const positive = pnl >= 0;
                  return (
                    <div key={pos.symbol} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-surface-container rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-on-surface">
                            {pos.symbol.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{pos.symbol}</p>
                          <p className="text-xs text-text-muted">{Number(pos.quantity).toFixed(2)} ações</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-on-surface tabular-nums">
                          {formatBRL(pos.currentValueBRL)}
                        </p>
                        <p
                          className="text-xs font-semibold tabular-nums"
                          style={{ color: positive ? '#00d084' : '#ef4444' }}
                        >
                          {positive ? '+' : ''}{pnl.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Simulações Recentes */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-base font-bold text-on-surface flex items-center gap-1">
                  Simulações Recentes
                  <ExplanationTrigger
                    explanation={{
                      title: 'O que são simulações?',
                      description:
                        'Cada simulação representa como seria uma transferência internacional real. Você pode criar quantas quiser para aprender como funcionam taxas, câmbio e custos.',
                      example:
                        'Simule o envio de R$1.000 para os EUA e veja exatamente quanto chegaria em dólares.',
                    }}
                  />
                </h2>
                <Link to="/simulator" className="text-xs text-primary font-semibold hover:underline">
                  Nova simulação <IoArrowForwardCircleOutline className="inline ml-1" size={14} />
                </Link>
              </div>

              {isLoading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-border/30 rounded animate-pulse" />
                  ))}
                </div>
              ) : remittances.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-text-muted mb-4">Você ainda não fez nenhuma simulação.</p>
                  <Link to="/simulator">
                    <Button variant="outlined" size="sm">Fazer primeira simulação</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-3 text-xs font-semibold text-text-muted">De → Para</th>
                        <th className="pb-3 text-xs font-semibold text-text-muted">Enviado</th>
                        <th className="pb-3 text-xs font-semibold text-text-muted">Recebido</th>
                        <th className="pb-3 text-xs font-semibold text-text-muted">Status</th>
                        <th className="pb-3 text-xs font-semibold text-text-muted">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {remittances.map((r) => (
                        <tr key={r.id} className="border-b border-border/50 last:border-none">
                          <td className="py-3 text-sm text-on-surface font-medium">
                            <Link
                              to={`/simulation/${r.id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {r.originCurrency} → {r.targetCurrency}
                            </Link>
                          </td>
                          <td className="py-3 text-sm tabular-nums text-on-surface">
                            {r.originCurrency}{' '}
                            {Number(r.originAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 text-sm tabular-nums text-on-surface">
                            {r.targetCurrency}{' '}
                            {Number(r.targetAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-800'}`}
                            >
                              {STATUS_LABELS[r.status] ?? r.status}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-text-muted">
                            {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
