import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LuSearch,
  LuTrendingUp,
  LuTrendingDown,
  LuShoppingCart,
  LuMinus,
  LuX,
  LuChevronLeft,
  LuChevronRight,
} from 'react-icons/lu';
import { api } from '@/services/api';
import { Card, Button, Input, ExplanationTrigger } from '@/components/ui';
import { Navbar, Footer } from '@/components/layout';
import type {
  Portfolio,
  PortfolioPosition,
  StockQuote,
  StockSearchResult,
  StockTransaction,
  StockTransactionsResponse,
} from '@/types';

const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'DIS', name: 'Walt Disney Co.' },
];

function formatBRL(value: string | number): string {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatUSD(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function SellModal({
  position,
  onClose,
  onSuccess,
}: {
  position: PortfolioPosition;
  onClose: () => void;
  onSuccess: () => void;
}): React.JSX.Element {
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [isSelling, setIsSelling] = useState(false);

  const maxQty = Number(position.quantity);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {

    e.preventDefault();
    setError('');

    const qty = Number(quantity);
    if (!qty || qty <= 0) { setError('Informe a quantidade.'); return; }
    if (qty > maxQty) { setError(`Você possui apenas ${maxQty.toFixed(6)} ações.`); return; }

    setIsSelling(true);
    try {
      const res = await api.post<unknown>('/portfolio/sell', {
        symbol: position.symbol,
        quantity: qty,
      });
      if (res.success) {
        onSuccess();
      } else {
        setError((res as { message?: string }).message ?? 'Erro ao vender.');
      }
    } catch {
      setError('Erro ao vender.');
    } finally {
      setIsSelling(false);
    }
  };

  const estimatedBRL =
    quantity && Number(quantity) > 0
      ? Number(quantity) * Number(position.currentPriceBRL)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative z-10 bg-surface border border-border rounded-2xl p-6 w-full max-w-md"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-bold text-on-surface flex items-center gap-2">
            <LuMinus size={18} className="text-red-500" />
            Vender {position.symbol}
          </h2>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-on-surface cursor-pointer">
            <LuX size={20} />
          </button>
        </div>

        <div className="bg-surface-container rounded-xl p-4 mb-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-text-muted">Qtd disponível</p>
            <p className="font-semibold text-on-surface">{maxQty.toFixed(6)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Preço atual</p>
            <p className="font-semibold text-on-surface">{formatUSD(Number(position.currentPriceUSD))}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Preço médio</p>
            <p className="font-semibold text-on-surface">{formatBRL(position.avgPriceBRL)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">P&L atual</p>
            <p
              className="font-semibold"
              style={{ color: Number(position.pnlBRL) >= 0 ? '#00d084' : '#ef4444' }}
            >
              {Number(position.pnlBRL) >= 0 ? '+' : ''}{formatBRL(position.pnlBRL)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Quantidade a vender"
            type="number"
            placeholder="0"
            min="0.000001"
            max={String(maxQty)}
            step="0.000001"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />

          {estimatedBRL !== null && (
            <div className="bg-emerald-500/8 rounded-lg px-4 py-3">
              <p className="text-xs text-text-muted">Você receberá aproximadamente</p>
              <p className="font-heading text-xl font-bold text-emerald-600 tabular-nums">
                {formatBRL(estimatedBRL)}
              </p>
            </div>
          )}

          {error && <p className="text-xs font-semibold text-red-500">{error}</p>}

          <div className="flex gap-3">
            <Button type="button" variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
            <Button type="submit" fullWidth isLoading={isSelling}>Confirmar venda</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Invest(): React.JSX.Element {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);
  const [portfolioRefresh, setPortfolioRefresh] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  const [buyQuantity, setBuyQuantity] = useState('');
  const [isBuying, setIsBuying] = useState(false);
  const [buyMessage, setBuyMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [quoteError, setQuoteError] = useState(false);
  const [quoteRefresh, setQuoteRefresh] = useState(0);

  const [sellPosition, setSellPosition] = useState<PortfolioPosition | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const [history, setHistory] = useState<StockTransaction[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const searchRef = useRef<HTMLDivElement>(null);

  // Portfolio load
  useEffect(() => {
    const load = async (): Promise<void> => {
      setIsLoadingPortfolio(true);
      try {
        const res = await api.get<Portfolio>('/portfolio');
        if (res.success && res.data) setPortfolio(res.data);
      } catch {
        // silently fail
      } finally {
        setIsLoadingPortfolio(false);
      }
    };
    load();
  }, [portfolioRefresh]);

  // Trade history load
  useEffect(() => {
    const load = async (): Promise<void> => {
      setIsLoadingHistory(true);
      try {
        const params = new URLSearchParams({ page: String(historyPage), limit: '8' });
        const res = await api.get<StockTransactionsResponse>(`/portfolio/transactions?${params}`);
        if (res.success && res.data) {
          setHistory(res.data.transactions);
          setHistoryTotalPages(res.data.totalPages);
        }
      } catch {
        // silently fail
      } finally {
        setIsLoadingHistory(false);
      }
    };
    load();
  }, [historyPage, portfolioRefresh]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get<StockSearchResult[]>(
          `/stocks/search?q=${encodeURIComponent(searchQuery)}`,
        );
        if (res.success && res.data) setSearchResults(res.data);
      } catch {
        // silently fail
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Quote load when symbol is selected
  useEffect(() => {
    if (!selectedSymbol) return;

    const load = async (): Promise<void> => {
      setIsLoadingQuote(true);
      setQuoteError(false);
      try {
        const res = await api.get<StockQuote>(`/stocks/quote/${selectedSymbol}`);
        if (res.success && res.data) {
          setQuote(res.data);
        } else {
          setQuoteError(true);
        }
      } catch {
        setQuoteError(true);
      } finally {
        setIsLoadingQuote(false);
      }
    };
    load();
  }, [selectedSymbol, quoteRefresh]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length < 2) setSearchResults([]);
    setSelectedSymbol(null);
    setQuote(null);
    setBuyMessage(null);
  };

  const handleSelectStock = (symbol: string): void => {
    setSelectedSymbol(symbol);
    setSearchResults([]);
    setSearchQuery('');
    setIsInputFocused(false);
    setBuyQuantity('');
    setBuyMessage(null);
    setQuote(null);
    setQuoteError(false);
  };

  const handleBuy = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setBuyMessage(null);
    const qty = Number(buyQuantity);
    if (!qty || qty <= 0) { setBuyMessage({ text: 'Informe a quantidade.', ok: false }); return; }

    setIsBuying(true);
    try {
      const res = await api.post<{ totalBRL: string; newBalance: string }>('/portfolio/buy', {
        symbol: selectedSymbol,
        quantity: qty,
      });
      if (res.success && res.data) {
        setBuyMessage({
          text: `Compra realizada! Custo: ${formatBRL(res.data.totalBRL)}. Novo saldo: ${formatBRL(res.data.newBalance)}.`,
          ok: true,
        });
        setBuyQuantity('');
        setPortfolioRefresh((r) => r + 1);
      } else {
        setBuyMessage({ text: (res as { message?: string }).message ?? 'Erro na compra.', ok: false });
      }
    } catch {
      setBuyMessage({ text: 'Erro na compra.', ok: false });
    } finally {
      setIsBuying(false);
    }
  };

  const handleSellSuccess = (): void => {
    setSellPosition(null);
    setPortfolioRefresh((r) => r + 1);
  };

  const portfolioCurrentValue = portfolio
    ? portfolio.positions.reduce((s, p) => s + Number(p.currentValueBRL), 0)
    : 0;
  const portfolioPnl = portfolioCurrentValue - Number(portfolio?.totalInvestedBRL ?? 0);
  const portfolioPnlPct =
    Number(portfolio?.totalInvestedBRL ?? 0) > 0
      ? (portfolioPnl / Number(portfolio!.totalInvestedBRL)) * 100
      : 0;

  const estimatedBuyBRL =
    quote && buyQuantity && Number(buyQuantity) > 0
      ? Number(buyQuantity) * Number(portfolio?.positions.find((p) => p.symbol === selectedSymbol)?.currentPriceBRL ?? 0)
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-300 mx-auto w-full px-5 md:px-10 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-on-surface flex items-center gap-2">
              <LuTrendingUp size={28} className="text-primary" />
              Investir em Ações
              <ExplanationTrigger
                explanation={{
                  title: 'Como funcionam os investimentos aqui?',
                  description:
                    'Você compra ações americanas usando seu saldo fictício em reais. O sistema converte automaticamente usando a taxa de câmbio atual. É uma simulação fiel de como funciona um broker internacional.',
                  example:
                    'Quer comprar 1 ação da Apple (AAPL) a US$180? O sistema desconta do seu saldo o equivalente em reais ao câmbio do momento.',
                }}
              />
            </h1>
            <p className="text-text-muted mt-1">Compre e venda ações americanas com saldo fictício.</p>
          </div>
          <Link to="/dashboard" className="text-sm text-primary font-semibold hover:underline">
            ← Voltar ao Dashboard
          </Link>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: 'Total investido',
              value: isLoadingPortfolio ? null : formatBRL(portfolio?.totalInvestedBRL ?? 0),
            },
            {
              label: 'Valor atual',
              value: isLoadingPortfolio ? null : formatBRL(portfolioCurrentValue),
            },
            {
              label: 'Resultado (P&L)',
              value: isLoadingPortfolio
                ? null
                : `${portfolioPnl >= 0 ? '+' : ''}${formatBRL(portfolioPnl)}`,
              sub: isLoadingPortfolio
                ? undefined
                : `${portfolioPnlPct >= 0 ? '+' : ''}${portfolioPnlPct.toFixed(2)}%`,
              positive: portfolioPnl >= 0,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-surface border border-border rounded-2xl p-5"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <p className="text-xs font-semibold text-text-muted mb-1">{card.label}</p>
              {card.value === null ? (
                <div className="h-8 w-32 bg-border/40 rounded animate-pulse" />
              ) : (
                <p
                  className="font-heading text-2xl font-bold tabular-nums"
                  style={
                    'positive' in card
                      ? { color: card.positive ? '#00d084' : '#ef4444' }
                      : { color: 'var(--color-on-surface)' }
                  }
                >
                  {card.value}
                </p>
              )}
              {card.sub && (
                <p
                  className="text-xs font-semibold mt-0.5 tabular-nums"
                  style={{ color: card.positive ? '#00d084' : '#ef4444' }}
                >
                  {card.sub}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">

          {/* Search + Buy */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card>
              <h2 className="font-heading text-base font-bold text-on-surface mb-4 flex items-center gap-1">
                <LuSearch size={16} className="text-primary" />
                Buscar ação
              </h2>

              <div className="relative" ref={searchRef}>
                <Input
                  label="Símbolo ou nome"
                  placeholder="Ex: AAPL, Tesla, Amazon..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  autoComplete="off"
                />

                {isInputFocused && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-surface border border-border rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                    {searchQuery.length < 2 ? (
                      <>
                        <div className="px-4 py-2 text-xs font-semibold text-text-muted border-b border-border/50 sticky top-0 bg-surface">
                          Ações populares
                        </div>
                        {POPULAR_STOCKS.map((s) => (
                          <button
                            key={s.symbol}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); handleSelectStock(s.symbol); }}
                            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-border/20 transition-colors text-left cursor-pointer"
                          >
                            <span className="text-sm font-semibold text-on-surface">{s.symbol}</span>
                            <span className="text-xs text-text-muted truncate ml-3">{s.name}</span>
                          </button>
                        ))}
                      </>
                    ) : isSearching ? (
                      <div className="px-4 py-3 text-sm text-text-muted">Buscando...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((r) => (
                        <button
                          key={r.symbol}
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); handleSelectStock(r.symbol); }}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-border/20 transition-colors text-left cursor-pointer"
                        >
                          <span className="text-sm font-semibold text-on-surface">{r.symbol}</span>
                          <span className="text-xs text-text-muted truncate ml-3">{r.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-text-muted">Nenhum resultado encontrado.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Quote Card */}
              {selectedSymbol && (
                <div className="mt-4 border-t border-border/50 pt-4">
                  {/* Selected symbol badge — aparece imediatamente */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-container/15 rounded-lg">
                      <span className="font-heading font-bold text-primary text-sm">{selectedSymbol}</span>
                      <span className="text-xs text-text-muted">selecionado</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => { setSelectedSymbol(null); setQuote(null); setQuoteError(false); }}
                      className="text-xs text-text-muted hover:text-on-surface cursor-pointer"
                    >
                      <LuX size={14} />
                    </button>
                  </div>

                  {isLoadingQuote ? (
                    <div className="bg-surface-container rounded-xl p-4 flex flex-col gap-3">
                      <div className="flex justify-between">
                        <div className="h-8 w-28 bg-border/40 rounded animate-pulse" />
                        <div className="h-6 w-16 bg-border/30 rounded-full animate-pulse" />
                      </div>
                      <div className="h-5 w-20 bg-border/30 rounded animate-pulse" />
                      <div className="grid grid-cols-3 gap-2">
                        {[1,2,3].map((i) => <div key={i} className="h-8 bg-border/20 rounded animate-pulse" />)}
                      </div>
                    </div>
                  ) : quoteError ? (
                    <div className="bg-surface-container rounded-xl p-4 text-center">
                      <p className="text-sm text-text-muted mb-2">
                        Não foi possível carregar a cotação de <strong>{selectedSymbol}</strong>.
                      </p>
                      <button
                        type="button"
                        onClick={() => setQuoteRefresh((r) => r + 1)}
                        className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  ) : quote ? (
                    <>
                      <div className="bg-surface-container rounded-xl p-4 mb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-heading text-3xl font-bold text-on-surface tabular-nums">
                              {formatUSD(quote.price)}
                            </p>
                            <p
                              className="text-sm font-semibold tabular-nums"
                              style={{ color: quote.change >= 0 ? '#00d084' : '#ef4444' }}
                            >
                              {quote.change >= 0 ? '+' : ''}{formatUSD(quote.change)} hoje
                            </p>
                          </div>
                          <span
                            className="flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-full"
                            style={{
                              background: quote.changePercent >= 0 ? 'rgba(0,208,132,0.12)' : 'rgba(239,68,68,0.10)',
                              color: quote.changePercent >= 0 ? '#00d084' : '#ef4444',
                            }}
                          >
                            {quote.changePercent >= 0 ? <LuTrendingUp size={14} /> : <LuTrendingDown size={14} />}
                            {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-text-muted">
                          <div><span className="block">Abertura</span><span className="font-semibold text-on-surface">{formatUSD(quote.open)}</span></div>
                          <div><span className="block">Máxima</span><span className="font-semibold text-on-surface">{formatUSD(quote.high)}</span></div>
                          <div><span className="block">Mínima</span><span className="font-semibold text-on-surface">{formatUSD(quote.low)}</span></div>
                        </div>
                      </div>

                      <form onSubmit={handleBuy} className="flex flex-col gap-3">
                        <Input
                          label="Quantidade de ações"
                          type="number"
                          placeholder="0"
                          min="0.000001"
                          max="10000"
                          step="0.000001"
                          value={buyQuantity}
                          onChange={(e) => setBuyQuantity(e.target.value)}
                          required
                        />

                        {estimatedBuyBRL !== null && estimatedBuyBRL > 0 && (
                          <div className="bg-primary-container/10 rounded-lg px-4 py-2.5">
                            <p className="text-xs text-text-muted">Custo estimado</p>
                            <p className="font-heading text-lg font-bold text-primary tabular-nums">
                              {formatBRL(estimatedBuyBRL)}
                            </p>
                          </div>
                        )}

                        {buyMessage && (
                          <p
                            className="text-xs font-semibold"
                            style={{ color: buyMessage.ok ? '#00d084' : '#ef4444' }}
                          >
                            {buyMessage.text}
                          </p>
                        )}

                        <Button type="submit" fullWidth isLoading={isBuying}>
                          <LuShoppingCart size={15} className="mr-1.5" />
                          Comprar {selectedSymbol}
                        </Button>
                      </form>
                    </>
                  ) : null}
                </div>
              )}
            </Card>
          </div>

          {/* Positions */}
          <div className="lg:col-span-3">
            <Card>
              <h2 className="font-heading text-base font-bold text-on-surface mb-4 flex items-center gap-1">
                <LuTrendingUp size={16} className="text-primary" />
                Posições abertas
                <ExplanationTrigger
                  explanation={{
                    title: 'O que é preço médio?',
                    description:
                      'O preço médio é a média ponderada de todas as suas compras de uma ação. Se você comprou 1 ação a R$100 e depois mais 1 a R$120, seu preço médio é R$110.',
                    example:
                      'Com preço médio de R$110 e preço atual de R$130, você tem um lucro de R$20 por ação.',
                  }}
                />
              </h2>

              {isLoadingPortfolio ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-border/20 rounded-lg animate-pulse" />)}
                </div>
              ) : !portfolio || portfolio.positions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-text-muted text-sm mb-1">Você não tem posições abertas.</p>
                  <p className="text-xs text-text-muted">Busque uma ação ao lado e faça sua primeira compra.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-left">
                        {['Ação', 'Qtd', 'Preço médio', 'Atual (USD)', 'Valor (BRL)', 'P&L', ''].map((h) => (
                          <th key={h} className="pb-3 text-xs font-semibold text-text-muted pr-3 last:pr-0">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.positions.map((pos) => {
                        const pnl = Number(pos.pnlBRL);
                        const positive = pnl >= 0;
                        return (
                          <tr key={pos.symbol} className="border-b border-border/50 last:border-none">
                            <td className="py-3 pr-3">
                              <p className="text-sm font-bold text-on-surface">{pos.symbol}</p>
                            </td>
                            <td className="py-3 pr-3 text-sm tabular-nums text-on-surface">
                              {Number(pos.quantity).toFixed(4)}
                            </td>
                            <td className="py-3 pr-3 text-sm tabular-nums text-on-surface">
                              {formatBRL(pos.avgPriceBRL)}
                            </td>
                            <td className="py-3 pr-3 text-sm tabular-nums text-on-surface">
                              {formatUSD(Number(pos.currentPriceUSD))}
                            </td>
                            <td className="py-3 pr-3 text-sm tabular-nums text-on-surface">
                              {formatBRL(pos.currentValueBRL)}
                            </td>
                            <td className="py-3 pr-3">
                              <p
                                className="text-sm font-semibold tabular-nums"
                                style={{ color: positive ? '#00d084' : '#ef4444' }}
                              >
                                {positive ? '+' : ''}{formatBRL(pnl)}
                              </p>
                              <p
                                className="text-xs tabular-nums"
                                style={{ color: positive ? '#00d084' : '#ef4444' }}
                              >
                                {positive ? '+' : ''}{Number(pos.pnlPercent).toFixed(2)}%
                              </p>
                            </td>
                            <td className="py-3">
                              <button
                                type="button"
                                onClick={() => setSellPosition(pos)}
                                className="text-xs font-semibold text-red-500 hover:underline cursor-pointer"
                              >
                                Vender
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Trade History */}
        <Card>
          <h2 className="font-heading text-base font-bold text-on-surface mb-4">
            Histórico de operações
          </h2>

          {isLoadingHistory ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-border/20 rounded animate-pulse" />)}
            </div>
          ) : history.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-6">Nenhuma operação realizada ainda.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left">
                      {['Tipo', 'Ação', 'Qtd', 'Preço (USD)', 'Câmbio', 'Total (BRL)', 'Data'].map((h) => (
                        <th key={h} className="pb-3 text-xs font-semibold text-text-muted pr-3 last:pr-0">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((tx) => (
                      <tr key={tx.id} className="border-b border-border/50 last:border-none">
                        <td className="py-3 pr-3">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: tx.type === 'BUY' ? 'rgba(0,208,132,0.12)' : 'rgba(239,68,68,0.10)',
                              color: tx.type === 'BUY' ? '#00d084' : '#ef4444',
                            }}
                          >
                            {tx.type === 'BUY' ? 'Compra' : 'Venda'}
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-sm font-bold text-on-surface">{tx.symbol}</td>
                        <td className="py-3 pr-3 text-sm tabular-nums text-on-surface">{Number(tx.quantity).toFixed(4)}</td>
                        <td className="py-3 pr-3 text-sm tabular-nums text-on-surface">{formatUSD(Number(tx.priceUSD))}</td>
                        <td className="py-3 pr-3 text-sm tabular-nums text-text-muted">
                          R${Number(tx.exchangeRate).toFixed(2)}
                        </td>
                        <td className="py-3 pr-3 text-sm tabular-nums text-on-surface">{formatBRL(tx.totalBRL)}</td>
                        <td className="py-3 text-sm text-text-muted">
                          {new Date(tx.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {historyTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    disabled={historyPage === 1}
                    className="flex items-center gap-1 text-xs font-semibold text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:underline cursor-pointer"
                  >
                    <LuChevronLeft size={14} /> Anterior
                  </button>
                  <span className="text-xs text-text-muted">Página {historyPage} de {historyTotalPages}</span>
                  <button
                    type="button"
                    onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
                    disabled={historyPage === historyTotalPages}
                    className="flex items-center gap-1 text-xs font-semibold text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:underline cursor-pointer"
                  >
                    Próxima <LuChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </Card>
      </main>

      <Footer />

      {sellPosition && (
        <SellModal
          position={sellPosition}
          onClose={() => setSellPosition(null)}
          onSuccess={handleSellSuccess}
        />
      )}
    </div>
  );
}
