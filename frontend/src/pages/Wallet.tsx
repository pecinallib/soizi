import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LuWallet,
  LuArrowDownLeft,
  LuArrowUpRight,
  LuGlobe,
  LuTrendingUp,
  LuTrendingDown,
  LuGift,
  LuSend,
  LuChevronLeft,
  LuChevronRight,
  LuX,
  LuCopy,
  LuCheck,
} from 'react-icons/lu';
import { api } from '@/services/api';
import { Card, Button, Input, ExplanationTrigger } from '@/components/ui';
import { Navbar, Footer } from '@/components/layout';
import type {
  Wallet,
  WalletTransaction,
  WalletTransactionsResponse,
  Portfolio,
} from '@/types';

type TxType =
  | 'INITIAL_CREDIT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'STOCK_BUY'
  | 'STOCK_SELL'
  | 'REMITTANCE_DEBIT'
  | null;

const FILTER_TABS: { label: string; value: TxType }[] = [
  { label: 'Todos', value: null },
  { label: 'Entradas', value: 'TRANSFER_IN' },
  { label: 'Saídas', value: 'TRANSFER_OUT' },
  { label: 'Remessas', value: 'REMITTANCE_DEBIT' },
  { label: 'Compras', value: 'STOCK_BUY' },
  { label: 'Vendas', value: 'STOCK_SELL' },
];

const TX_META: Record<
  string,
  {
    label: string;
    positive: boolean;
    Icon: React.FC<{ size?: number; className?: string }>;
  }
> = {
  INITIAL_CREDIT: { label: 'Crédito inicial', positive: true, Icon: LuGift },
  TRANSFER_IN: { label: 'Recebido', positive: true, Icon: LuArrowDownLeft },
  TRANSFER_OUT: { label: 'Transferido', positive: false, Icon: LuArrowUpRight },
  REMITTANCE_DEBIT: { label: 'Remessa enviada', positive: false, Icon: LuGlobe },
  REMITTANCE_SENT: { label: 'Remessa enviada', positive: false, Icon: LuGlobe },
  REMITTANCE_RECEIVED: { label: 'Remessa recebida', positive: true, Icon: LuGlobe },
  STOCK_BUY: { label: 'Compra de ação', positive: false, Icon: LuTrendingUp },
  STOCK_SELL: { label: 'Venda de ação', positive: true, Icon: LuTrendingDown },
  FOREX_BUY: { label: 'Compra de moeda', positive: false, Icon: LuTrendingUp },
  FOREX_SELL: { label: 'Venda de moeda', positive: true, Icon: LuTrendingDown },
};

function formatBRL(value: string | number): string {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function TransferModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}): React.JSX.Element {
  const [toEmail, setToEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setError('');

    const amountNum = Number(amount);
    if (!toEmail || !amountNum || amountNum <= 0) {
      setError('Preencha email e valor corretamente.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post<unknown>('/wallet/transfer', {
        toEmail,
        amount: amountNum,
        description: description || undefined,
      });

      if (res.success) {
        onSuccess();
      } else {
        setError(res.message ?? 'Erro ao realizar transferência.');
      }
    } catch {
      setError('Erro ao realizar transferência.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative z-10 bg-surface border border-border rounded-2xl p-6 w-full max-w-md"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-bold text-on-surface flex items-center gap-2">
            <LuSend size={18} className="text-primary" />
            Transferir Saldo
            <ExplanationTrigger
              explanation={{
                title: 'Como funciona a transferência?',
                description:
                  'Você pode enviar saldo fictício para outros usuários do SoIzi. É uma simulação de como funcionam transferências bancárias no mundo real, usando o email como identificador, como o PIX usa chave.',
                example:
                  'Transfira R$1.000 para um amigo e ambos vejam o extrato atualizado.',
              }}
            />
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-on-surface transition-colors cursor-pointer"
          >
            <LuX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email do destinatário"
            type="email"
            placeholder="email@exemplo.com"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            required
          />

          <Input
            label="Valor (R$)"
            type="number"
            placeholder="0,00"
            min="0.01"
            max="50000"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <Input
            label="Descrição (opcional)"
            type="text"
            placeholder="Ex: Pagamento de aposta"
            maxLength={200}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {error && (
            <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="ghost" fullWidth onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" fullWidth isLoading={isLoading}>
              Transferir
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Wallet(): React.JSX.Element {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isLoadingTx, setIsLoadingTx] = useState(true);
  const [activeType, setActiveType] = useState<TxType>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [walletRefresh, setWalletRefresh] = useState(0);

  useEffect(() => {
    const load = async (): Promise<void> => {
      setIsLoadingWallet(true);
      try {
        const [walletRes, portfolioRes] = await Promise.all([
          api.get<Wallet>('/wallet'),
          api.get<Portfolio>('/portfolio'),
        ]);
        if (walletRes.success && walletRes.data) setWallet(walletRes.data);
        if (portfolioRes.success && portfolioRes.data) setPortfolio(portfolioRes.data);
      } catch {
        // silently fail
      } finally {
        setIsLoadingWallet(false);
      }
    };
    load();
  }, [walletRefresh]);

  const usdHoldings = portfolio
    ? portfolio.positions.reduce(
        (sum, p) => sum + Number(p.quantity) * Number(p.currentPriceUSD),
        0,
      )
    : 0;

  const usdHoldingsBRL = portfolio
    ? portfolio.positions.reduce((sum, p) => sum + Number(p.currentValueBRL), 0)
    : 0;

  useEffect(() => {
    const load = async (): Promise<void> => {
      setIsLoadingTx(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: '10' });
        if (activeType) params.set('type', activeType);
        const res = await api.get<WalletTransactionsResponse>(
          `/wallet/transactions?${params.toString()}`,
        );
        if (res.success && res.data) {
          setTransactions(res.data.transactions);
          setTotalPages(res.data.totalPages);
        }
      } catch {
        // silently fail
      } finally {
        setIsLoadingTx(false);
      }
    };

    load();
  }, [page, activeType]);

  const handleTypeChange = (type: TxType): void => {
    setActiveType(type);
    setPage(1);
  };

  const handleTransferSuccess = (): void => {
    setIsTransferOpen(false);
    setWalletRefresh((r) => r + 1);
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-300 mx-auto w-full px-5 md:px-10 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-on-surface flex items-center gap-2">
              <LuWallet size={28} className="text-primary" />
              Minha Carteira
              <ExplanationTrigger
                explanation={{
                  title: 'O que é a carteira virtual?',
                  description:
                    'Sua carteira é um saldo fictício de R$50.000 que você recebe ao criar sua conta. Use-o para simular remessas internacionais, comprar ações e fazer transferências, tudo sem dinheiro real.',
                  example:
                    'Gaste R$5.000 em ações, envie R$1.000 para um amigo e ainda simule uma remessa para os EUA.',
                }}
              />
            </h1>
            <p className="text-text-muted mt-1">
              Gerencie seu saldo fictício e acompanhe todas as movimentações.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="text-sm text-primary font-semibold hover:underline"
          >
            ← Voltar ao Dashboard
          </Link>
        </div>

        {/* Account Number */}
        {user?.accountNumber && (
          <div className="mb-6 flex items-center gap-4 bg-surface border border-border rounded-2xl px-5 py-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-muted mb-0.5">Seu número de conta SoIzi</p>
              <p className="font-heading font-bold text-on-surface tracking-widest text-lg tabular-nums">
                {user.accountNumber}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(user.accountNumber!);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-border text-text-muted hover:text-on-surface hover:border-primary hover:bg-primary/5 transition-all cursor-pointer shrink-0"
            >
              {copied ? <LuCheck size={14} className="text-emerald-500" /> : <LuCopy size={14} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        )}

        {/* Currency Holdings */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-base font-bold text-on-surface flex items-center gap-1">
              Patrimônio por moeda
              <ExplanationTrigger
                explanation={{
                  title: 'Por que ver por moeda?',
                  description:
                    'Quando você compra ações americanas, seu dinheiro sai em reais mas o ativo fica denominado em dólar. Isso significa que você está exposto à variação cambial — se o dólar subir, seu patrimônio em reais aumenta mesmo sem as ações se moverem.',
                  example:
                    'Você comprou US$2.000 em ações. Se o dólar subir de R$5 para R$6, seu patrimônio passa de R$10.000 para R$12.000 automaticamente.',
                }}
              />
            </h2>
            <Button size="sm" onClick={() => setIsTransferOpen(true)}>
              <LuSend size={14} className="mr-1.5" />
              Transferir
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* BRL Card */}
            <div
              className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-2"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">
                  R$ · BRL
                </span>
                <span className="text-xs text-text-muted">Saldo disponível</span>
              </div>
              {isLoadingWallet ? (
                <div className="h-9 w-40 bg-border/40 rounded animate-pulse" />
              ) : (
                <p className="font-heading text-3xl font-bold text-on-surface tabular-nums">
                  {wallet ? formatBRL(wallet.balance) : 'R$ 0,00'}
                </p>
              )}
              {wallet && !isLoadingWallet && (
                <p className="text-xs text-text-muted">
                  Atualizado{' '}
                  {new Date(wallet.updatedAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>

            {/* USD Card — only when user has positions */}
            {!isLoadingWallet && usdHoldings > 0 && (
              <div
                className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-2"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600">
                    $ · USD
                  </span>
                  <span className="text-xs text-text-muted">Em ações (EUA)</span>
                </div>
                <p className="font-heading text-3xl font-bold text-on-surface tabular-nums">
                  {usdHoldings.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </p>
                <p className="text-xs text-text-muted">
                  ≈{' '}
                  {usdHoldingsBRL.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}{' '}
                  ao câmbio atual
                </p>
              </div>
            )}

            {/* Skeleton placeholder quando carregando */}
            {isLoadingWallet && (
              <div
                className="bg-surface border border-border rounded-2xl p-5"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div className="h-5 w-20 bg-border/40 rounded animate-pulse mb-3" />
                <div className="h-9 w-36 bg-border/40 rounded animate-pulse mb-2" />
                <div className="h-3 w-28 bg-border/30 rounded animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-base font-bold text-on-surface">
              Extrato
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap mb-5">
            {FILTER_TABS.map((tab) => (
              <button
                key={String(tab.value)}
                type="button"
                onClick={() => handleTypeChange(tab.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  activeType === tab.value
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-border/30 text-text-muted hover:bg-border/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Transaction List */}
          {isLoadingTx ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-border/20 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-text-muted">
                Nenhuma movimentação encontrada.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col divide-y divide-border/50">
                {transactions.map((tx) => {
                  const meta = TX_META[tx.type] ?? {
                    label: tx.type,
                    positive: true,
                    Icon: LuWallet,
                  };
                  const { Icon } = meta;

                  return (
                    <div key={tx.id} className="flex items-center gap-4 py-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: meta.positive
                            ? 'rgba(0, 208, 132, 0.12)'
                            : 'rgba(239, 68, 68, 0.10)',
                        }}
                      >
                        <Icon
                          size={17}
                          className={
                            meta.positive ? 'text-emerald-500' : 'text-red-500'
                          }
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate">
                          {meta.label}
                        </p>
                        <p className="text-xs text-text-muted truncate">
                          {tx.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p
                          className="text-sm font-bold tabular-nums"
                          style={{
                            color: meta.positive ? '#00d084' : '#ef4444',
                          }}
                        >
                          {meta.positive ? '+' : '-'}
                          {formatBRL(tx.amount)}
                        </p>
                        <p className="text-xs text-text-muted tabular-nums">
                          {new Date(tx.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 text-xs font-semibold text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:underline cursor-pointer"
                  >
                    <LuChevronLeft size={14} />
                    Anterior
                  </button>
                  <span className="text-xs text-text-muted">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 text-xs font-semibold text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:underline cursor-pointer"
                  >
                    Próxima
                    <LuChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </Card>
      </main>

      <Footer />

      {isTransferOpen && (
        <TransferModal
          onClose={() => setIsTransferOpen(false)}
          onSuccess={handleTransferSuccess}
        />
      )}
    </div>
  );
}
