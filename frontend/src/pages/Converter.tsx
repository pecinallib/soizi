import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  LuArrowUpDown,
  LuLightbulb,
  LuChevronDown,
  LuTrendingUp,
  LuTrendingDown,
  LuSend,
  LuRefreshCw,
  LuWallet,
} from 'react-icons/lu';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '@/services/api';
import { ExplanationTrigger, Button, Input } from '@/components/ui';
import { Navbar, Footer } from '@/components/layout';
import type {
  ConversionResult,
  CurrencyHolding,
  ForexResult,
  P2PRemittanceResult,
} from '@/types';

const CURRENCIES = [
  { code: 'BRL', flag: '/lp/flags/brl.png' },
  { code: 'USD', flag: '/lp/flags/eua.png' },
  { code: 'EUR', flag: '/lp/flags/eur.png' },
  { code: 'GBP', flag: '/lp/flags/gbp.png' },
  { code: 'JPY', flag: '/lp/flags/jpy.png' },
  { code: 'CAD', flag: '/lp/flags/cad.png' },
];

const FAQ_ITEMS = [
  {
    key: 'spread',
    question: 'O que é o Spread bancário?',
    answer: 'Spread é a diferença entre a taxa de câmbio real do mercado e a taxa que a instituição te oferece. É assim que bancos e corretoras lucram com câmbio.',
  },
  {
    key: 'iof',
    question: 'Como o IOF é calculado?',
    answer: 'IOF (Imposto sobre Operações Financeiras) é cobrado em operações de câmbio. A alíquota padrão é 0,38% do valor enviado.',
  },
  {
    key: 'cambio',
    question: 'Por que o câmbio muda toda hora?',
    answer: 'O câmbio flutua por oferta e demanda, política econômica, inflação e eventos geopolíticos — como qualquer ativo negociado no mercado.',
  },
];

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateChartData(baseRate: number, from: string, to: string, period: string) {
  const pairSeed = (from + to + period).split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0);
  const now = new Date();
  let count: number;
  let volatility: number;
  const labels: string[] = [];

  if (period === '1D') {
    count = 12; volatility = 0.003;
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 2 * 60 * 60 * 1000);
      labels.push(i === 0 ? 'Agora' : `${String(d.getHours()).padStart(2, '0')}h`);
    }
  } else if (period === '1S') {
    count = 7; volatility = 0.008;
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      labels.push(i === 0 ? 'Hoje' : `${d.getDate()} ${MONTHS_PT[d.getMonth()]}`);
    }
  } else if (period === '1M') {
    count = 10; volatility = 0.015;
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3 * 24 * 60 * 60 * 1000);
      labels.push(i === 0 ? 'Hoje' : `${d.getDate()} ${MONTHS_PT[d.getMonth()]}`);
    }
  } else {
    count = 12; volatility = 0.05;
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(`${MONTHS_PT[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`);
    }
  }

  const rates: number[] = new Array(count).fill(0);
  rates[count - 1] = baseRate;
  for (let i = count - 2; i >= 0; i--) {
    rates[i] = rates[i + 1] * (1 + (seededRandom(pairSeed + i) - 0.5) * volatility * 2);
  }
  return labels.map((date, i) => ({ date, rate: Number(rates[i].toFixed(4)) }));
}

function formatBRL(value: string | number): string {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function FeeRow({ label, value, explanation }: {
  label: string;
  value: string;
  explanation?: { title: string; description: string; example?: string };
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-muted flex items-center gap-1">
        {label}
        {explanation && <ExplanationTrigger explanation={explanation} />}
      </span>
      <span className="text-on-surface tabular-nums">{value}</span>
    </div>
  );
}

type Tab = 'forex' | 'remittance';

export function Converter(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>('forex');

  // ── Forex state ────────────────────────────────────────────────────────────
  const [toCurrency, setToCurrency] = useState('USD');
  const [forexAmount, setForexAmount] = useState('1000');
  const [forexMode, setForexMode] = useState<'buy' | 'sell'>('buy');
  const [conversion, setConversion] = useState<ConversionResult | null>(null);
  const [isLoadingConversion, setIsLoadingConversion] = useState(false);
  const [conversionError, setConversionError] = useState(false);
  const [holdings, setHoldings] = useState<CurrencyHolding[]>([]);
  const [holdingsRefresh, setHoldingsRefresh] = useState(0);
  const [isSubmittingForex, setIsSubmittingForex] = useState(false);
  const [forexMessage, setForexMessage] = useState<{ text: string; ok: boolean } | null>(null);

  // ── Remittance state ───────────────────────────────────────────────────────
  const [remitAmount, setRemitAmount] = useState('');
  const [remitAccount, setRemitAccount] = useState('');
  const [remitCurrency, setRemitCurrency] = useState('USD');
  const [remitConversion, setRemitConversion] = useState<ConversionResult | null>(null);
  const [isLoadingRemitPreview, setIsLoadingRemitPreview] = useState(false);
  const [isSendingRemit, setIsSendingRemit] = useState(false);
  const [remitMessage, setRemitMessage] = useState<{ text: string; ok: boolean } | null>(null);

  // ── Chart state ────────────────────────────────────────────────────────────
  const [chartPeriod, setChartPeriod] = useState('1S');
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  // ── Load holdings ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const res = await api.get<CurrencyHolding[]>('/forex/holdings');
        if (res.success && res.data) setHoldings(res.data);
      } catch { /* silently fail */ }
    };
    load();
  }, [holdingsRefresh]);

  // ── Live conversion preview (forex) ───────────────────────────────────────
  useEffect(() => {
    const from = forexMode === 'buy' ? 'BRL' : toCurrency;
    const to = forexMode === 'buy' ? toCurrency : 'BRL';

    const load = async (): Promise<void> => {
      const amount = parseFloat(forexAmount.replace(',', '.'));
      if (isNaN(amount) || amount <= 0) return;
      setIsLoadingConversion(true);
      setConversionError(false);
      try {
        const res = await api.post<ConversionResult>('/exchange/convert', { from, to, amount });
        if (res.success && res.data) setConversion(res.data);
        else setConversionError(true);
      } catch { setConversionError(true); }
      finally { setIsLoadingConversion(false); }
    };

    const timer = setTimeout(() => { load(); }, 600);
    return () => clearTimeout(timer);
  }, [forexAmount, toCurrency, forexMode]);

  // ── Live remittance preview ────────────────────────────────────────────────
  useEffect(() => {
    const load = async (): Promise<void> => {
      const amount = parseFloat(remitAmount.replace(',', '.'));
      if (isNaN(amount) || amount <= 0) { setRemitConversion(null); return; }
      setIsLoadingRemitPreview(true);
      try {
        const res = await api.post<ConversionResult>('/exchange/convert', {
          from: 'BRL', to: remitCurrency, amount,
        });
        if (res.success && res.data) setRemitConversion(res.data);
      } catch { /* silently fail */ }
      finally { setIsLoadingRemitPreview(false); }
    };
    const timer = setTimeout(() => { load(); }, 600);
    return () => clearTimeout(timer);
  }, [remitAmount, remitCurrency]);

  // ── Submit forex buy/sell ──────────────────────────────────────────────────
  const handleForexSubmit = async (): Promise<void> => {
    const amount = parseFloat(forexAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;
    setIsSubmittingForex(true);
    setForexMessage(null);
    try {
      if (forexMode === 'buy') {
        const res = await api.post<ForexResult>('/forex/buy', { currency: toCurrency, amountBRL: amount });
        if (res.success && res.data) {
          setForexMessage({ text: `Compra realizada! Você recebeu ${Number(res.data.amount).toFixed(4)} ${toCurrency}. Novo saldo: ${formatBRL(res.data.newBalance)}.`, ok: true });
          setHoldingsRefresh(r => r + 1);
        } else {
          setForexMessage({ text: (res as { message?: string }).message ?? 'Erro ao comprar.', ok: false });
        }
      } else {
        const res = await api.post<ForexResult>('/forex/sell', { currency: toCurrency, amount });
        if (res.success && res.data) {
          setForexMessage({ text: `Venda realizada! Você recebeu ${formatBRL(res.data.netBRL)}. Novo saldo: ${formatBRL(res.data.newBalance)}.`, ok: true });
          setHoldingsRefresh(r => r + 1);
        } else {
          setForexMessage({ text: (res as { message?: string }).message ?? 'Erro ao vender.', ok: false });
        }
      }
    } catch { setForexMessage({ text: 'Erro na operação. Tente novamente.', ok: false }); }
    finally { setIsSubmittingForex(false); }
  };

  // ── Submit P2P remittance ──────────────────────────────────────────────────
  const handleRemitSubmit = async (e: React.SyntheticEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const amount = parseFloat(remitAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0 || !remitAccount) return;
    setIsSendingRemit(true);
    setRemitMessage(null);
    try {
      const res = await api.post<P2PRemittanceResult>('/remittance/send', {
        toAccountNumber: remitAccount.toUpperCase(),
        originAmount: amount,
        targetCurrency: remitCurrency,
      });
      if (res.success && res.data) {
        setRemitMessage({
          text: `Remessa enviada! O destinatário receberá ${formatBRL(res.data.recipientAmount)}. Total debitado: ${formatBRL(res.data.totalCost)}.`,
          ok: true,
        });
        setRemitAmount('');
        setRemitAccount('');
        setRemitConversion(null);
      } else {
        setRemitMessage({ text: (res as { message?: string }).message ?? 'Erro ao enviar.', ok: false });
      }
    } catch { setRemitMessage({ text: 'Erro ao enviar remessa.', ok: false }); }
    finally { setIsSendingRemit(false); }
  };

  // ── Chart data ─────────────────────────────────────────────────────────────
  const chartFrom = forexMode === 'buy' ? 'BRL' : toCurrency;
  const chartTo = forexMode === 'buy' ? toCurrency : 'BRL';
  const rate = conversion?.exchangeRate;
  const chartData = useMemo(
    () => generateChartData(rate ?? 5.26, chartFrom, chartTo, chartPeriod),
    [rate, chartFrom, chartTo, chartPeriod],
  );
  const isPositive = chartData.length >= 2
    ? chartData[chartData.length - 1].rate >= chartData[0].rate
    : true;

  // ── Computed preview values ────────────────────────────────────────────────
  const forexAmountNum = parseFloat(forexAmount.replace(',', '.')) || 0;
  const iof = forexAmountNum * 0.0038;
  const spread = forexAmountNum * 0.015;
  const totalForexCost = forexAmountNum + iof + 5;

  const remitAmountNum = parseFloat(remitAmount.replace(',', '.')) || 0;
  const remitIof = remitAmountNum * 0.0038;
  const remitSpread = remitAmountNum * 0.015;
  const remitTotalCost = remitAmountNum + remitIof + 5;
  const remitRecipientGets = remitAmountNum - remitSpread;

  const fromFlag = CURRENCIES.find(c => c.code === (forexMode === 'buy' ? 'BRL' : toCurrency))?.flag ?? '';
  const toFlag = CURRENCIES.find(c => c.code === (forexMode === 'buy' ? toCurrency : 'BRL'))?.flag ?? '';
  const remitFlag = CURRENCIES.find(c => c.code === remitCurrency)?.flag ?? '';

  const chartLabel = chartPeriod === '1D' ? 'Últimas 24 horas'
    : chartPeriod === '1S' ? 'Últimos 7 dias'
    : chartPeriod === '1M' ? 'Últimos 30 dias'
    : 'Último ano';

  const myHolding = holdings.find(h => h.currency === toCurrency);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-300 mx-auto w-full px-5 md:px-10 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-secondary">
            Converta e Simule
          </h1>
          <p className="text-text-muted mt-2">Sem letras miúdas. Apenas transparência radical.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* Tab Card */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>

              {/* Tabs */}
              <div className="flex border-b border-border">
                <button
                  type="button"
                  onClick={() => setActiveTab('forex')}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors cursor-pointer ${
                    activeTab === 'forex'
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-text-muted hover:text-on-surface'
                  }`}
                >
                  <LuRefreshCw size={15} />
                  Trocar Moeda
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('remittance')}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors cursor-pointer ${
                    activeTab === 'remittance'
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-text-muted hover:text-on-surface'
                  }`}
                >
                  <LuSend size={15} />
                  Enviar Remessa
                </button>
              </div>

              <div className="p-6 md:p-8">

                {/* ── FOREX TAB ─────────────────────────────────────────── */}
                {activeTab === 'forex' && (
                  <div className="flex flex-col gap-5">

                    {/* Buy / Sell toggle */}
                    <div className="flex gap-2">
                      {(['buy', 'sell'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => { setForexMode(mode); setForexMessage(null); setConversion(null); }}
                          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
                            forexMode === mode
                              ? mode === 'buy'
                                ? 'bg-emerald-500/15 text-emerald-600'
                                : 'bg-red-500/10 text-red-500'
                              : 'text-text-muted hover:bg-surface-container'
                          }`}
                        >
                          {mode === 'buy' ? 'Comprar moeda' : 'Vender moeda'}
                        </button>
                      ))}
                    </div>

                    {/* Amount input */}
                    <div>
                      <p className="text-sm text-text-muted mb-1.5">
                        {forexMode === 'buy' ? 'Você paga (BRL)' : `Você vende (${toCurrency})`}
                      </p>
                      <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-primary transition-all">
                        <img key={forexMode === 'buy' ? 'BRL' : toCurrency} src={fromFlag} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 animate-flag-pop" />
                        <div className="w-px h-5 bg-border shrink-0" />
                        <input
                          type="text"
                          inputMode="decimal"
                          value={forexAmount}
                          onChange={(e) => { setForexAmount(e.target.value); setForexMessage(null); }}
                          className="flex-1 text-right text-xl font-semibold text-on-surface bg-transparent focus:outline-none tabular-nums"
                          placeholder="0,00"
                        />
                      </div>
                    </div>

                    {/* Swap button — centralizado entre os inputs */}
                    <div className="flex justify-center -my-1">
                      <button
                        type="button"
                        onClick={() => { setForexMode(m => m === 'buy' ? 'sell' : 'buy'); setForexMessage(null); setConversion(null); }}
                        className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-on-primary hover:brightness-110 transition-all cursor-pointer shrink-0 z-10"
                      >
                        <LuArrowUpDown size={16} />
                      </button>
                    </div>

                    {/* Currency selector + result */}
                    <div>
                      <p className="text-sm text-text-muted mb-1.5">
                        {forexMode === 'buy' ? 'Você recebe' : 'Você recebe (BRL)'}
                      </p>
                      <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3.5 bg-surface-container/50">
                        <img key={forexMode === 'buy' ? toCurrency : 'BRL'} src={toFlag} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 animate-flag-pop" />
                        {forexMode === 'sell' ? (
                          <span className="font-semibold text-on-surface text-sm">BRL</span>
                        ) : (
                          <select
                            value={toCurrency}
                            onChange={(e) => { setToCurrency(e.target.value); setConversion(null); setForexMessage(null); }}
                            className="bg-transparent font-semibold text-on-surface text-sm cursor-pointer focus:outline-none"
                          >
                            {CURRENCIES.filter(c => c.code !== 'BRL').map(c => (
                              <option key={c.code} value={c.code}>{c.code}</option>
                            ))}
                          </select>
                        )}
                        <div className="w-px h-5 bg-border shrink-0" />
                        {isLoadingConversion ? (
                          <div className="flex-1 flex justify-end">
                            <div className="h-6 w-28 bg-border/40 rounded animate-pulse" />
                          </div>
                        ) : (
                          <span className="flex-1 text-right text-xl font-semibold text-on-surface tabular-nums">
                            {conversion ? Number(conversion.convertedAmount).toFixed(2) : '—'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* My holding for this currency */}
                    {myHolding && (
                      <div className="flex items-center gap-2 bg-primary/8 rounded-xl px-4 py-2.5 text-sm">
                        <LuWallet size={14} className="text-primary shrink-0" />
                        <span className="text-text-muted">Você possui</span>
                        <span className="font-semibold text-on-surface">{Number(myHolding.amount).toFixed(4)} {toCurrency}</span>
                        {myHolding.pnlBRL && (
                          <span className="ml-auto text-xs font-semibold" style={{ color: Number(myHolding.pnlBRL) >= 0 ? '#00d084' : '#ef4444' }}>
                            {Number(myHolding.pnlBRL) >= 0 ? '+' : ''}{formatBRL(myHolding.pnlBRL)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Fee breakdown */}
                    {conversionError && (
                      <p className="text-sm text-red-500 text-center">Não foi possível obter a cotação.</p>
                    )}

                    {conversion && !conversionError && forexAmountNum > 0 && (
                      <div className="border-t border-dashed border-border pt-4 flex flex-col gap-2.5">
                        <FeeRow
                          label={`Câmbio (1 ${toCurrency})`}
                          value={`${formatBRL(conversion.exchangeRate)}`}
                          explanation={{ title: 'O que é câmbio comercial?', description: 'Taxa de referência do mercado para a moeda estrangeira.', example: `1 ${toCurrency} = ${formatBRL(conversion.exchangeRate)}` }}
                        />
                        <FeeRow label="Spread (1,5%)" value={formatBRL(spread)}
                          explanation={{ title: 'O que é spread?', description: 'Margem cobrada pela instituição financeira sobre a taxa de câmbio. Reduz o valor que você recebe.', example: `Sobre R$${forexAmountNum.toFixed(2)}, o spread é ${formatBRL(spread)}.` }}
                        />
                        <FeeRow label="IOF (0,38%)" value={formatBRL(iof)}
                          explanation={{ title: 'O que é IOF?', description: 'Imposto federal obrigatório em operações de câmbio.', example: `Sobre R$${forexAmountNum.toFixed(2)}, o IOF é ${formatBRL(iof)}.` }}
                        />
                        <FeeRow label="Taxa fixa" value={formatBRL(5)} />
                        <div className="border-t border-border pt-2.5 flex items-center justify-between">
                          <span className="font-heading font-bold text-on-surface">
                            {forexMode === 'buy' ? 'Total debitado' : 'Você receberá'}
                          </span>
                          <span className="font-heading font-bold text-primary text-xl tabular-nums">
                            {forexMode === 'buy' ? formatBRL(totalForexCost) : formatBRL(conversion.convertedAmount)}
                          </span>
                        </div>
                      </div>
                    )}

                    {forexMessage && (
                      <p className="text-sm font-semibold" style={{ color: forexMessage.ok ? '#00d084' : '#ef4444' }}>
                        {forexMessage.text}
                      </p>
                    )}

                    <Button
                      fullWidth
                      onClick={handleForexSubmit}
                      isLoading={isSubmittingForex}
                    >
                      {forexMode === 'buy' ? `Comprar ${toCurrency}` : `Vender ${toCurrency}`}
                    </Button>
                  </div>
                )}

                {/* ── REMITTANCE TAB ────────────────────────────────────── */}
                {activeTab === 'remittance' && (
                  <form onSubmit={handleRemitSubmit} className="flex flex-col gap-5">
                    <p className="text-sm text-text-muted">
                      Envie reais para outra conta SoIzi. As taxas reais de uma remessa internacional serão aplicadas.
                    </p>

                    <Input
                      label="Número da conta destino"
                      placeholder="SOIZI-XXXX-XXXX"
                      value={remitAccount}
                      onChange={(e) => setRemitAccount(e.target.value.toUpperCase())}
                      required
                    />

                    <div>
                      <p className="text-sm text-text-muted mb-1.5">Valor a enviar (BRL)</p>
                      <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-primary transition-all">
                        <img src="/lp/flags/brl.png" alt="BRL" className="w-6 h-6 rounded-full object-cover shrink-0" />
                        <div className="w-px h-5 bg-border shrink-0" />
                        <input
                          type="text"
                          inputMode="decimal"
                          value={remitAmount}
                          onChange={(e) => { setRemitAmount(e.target.value); setRemitMessage(null); }}
                          className="flex-1 text-right text-xl font-semibold text-on-surface bg-transparent focus:outline-none tabular-nums"
                          placeholder="0,00"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-text-muted mb-1.5">Moeda de referência (educacional)</p>
                      <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3.5 bg-surface-container/50">
                        <img key={remitCurrency} src={remitFlag} alt={remitCurrency} className="w-6 h-6 rounded-full object-cover shrink-0 animate-flag-pop" />
                        <select
                          value={remitCurrency}
                          onChange={(e) => setRemitCurrency(e.target.value)}
                          className="bg-transparent font-semibold text-on-surface text-sm cursor-pointer focus:outline-none"
                        >
                          {CURRENCIES.filter(c => c.code !== 'BRL').map(c => (
                            <option key={c.code} value={c.code}>{c.code}</option>
                          ))}
                        </select>
                        {isLoadingRemitPreview ? (
                          <div className="flex-1 flex justify-end">
                            <div className="h-6 w-28 bg-border/40 rounded animate-pulse" />
                          </div>
                        ) : remitConversion ? (
                          <span className="flex-1 text-right text-lg font-semibold text-text-muted tabular-nums">
                            ≈ {Number(remitConversion.convertedAmount).toFixed(2)} {remitCurrency}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Fee breakdown */}
                    {remitAmountNum > 0 && (
                      <div className="border-t border-dashed border-border pt-4 flex flex-col gap-2.5">
                        <FeeRow label="Valor enviado" value={formatBRL(remitAmountNum)} />
                        <FeeRow label="Spread (1,5%)" value={`- ${formatBRL(remitSpread)}`}
                          explanation={{ title: 'O que é spread?', description: 'Margem da instituição financeira. O destinatário recebe o valor menos o spread.', example: `O banco fica com ${formatBRL(remitSpread)} desta operação.` }}
                        />
                        <FeeRow label="IOF (0,38%)" value={`+ ${formatBRL(remitIof)}`}
                          explanation={{ title: 'O que é IOF?', description: 'Imposto federal cobrado do remetente sobre o valor enviado.', example: `Você paga ${formatBRL(remitIof)} de imposto.` }}
                        />
                        <FeeRow label="Taxa fixa" value="+ R$ 5,00" />

                        <div className="border-t border-border pt-2.5 grid grid-cols-2 gap-3">
                          <div className="bg-surface-container rounded-xl p-3">
                            <p className="text-xs text-text-muted mb-0.5">Você paga</p>
                            <p className="font-heading font-bold text-on-surface tabular-nums">{formatBRL(remitTotalCost)}</p>
                          </div>
                          <div className="bg-emerald-500/8 rounded-xl p-3">
                            <p className="text-xs text-text-muted mb-0.5">Destinatário recebe</p>
                            <p className="font-heading font-bold text-emerald-600 tabular-nums">{formatBRL(remitRecipientGets)}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {remitMessage && (
                      <p className="text-sm font-semibold" style={{ color: remitMessage.ok ? '#00d084' : '#ef4444' }}>
                        {remitMessage.text}
                      </p>
                    )}

                    <Button type="submit" fullWidth isLoading={isSendingRemit}>
                      <LuSend size={15} className="mr-1.5" />
                      Enviar Remessa
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {/* Holdings summary */}
            {holdings.length > 0 && (
              <div className="bg-surface border border-border rounded-2xl p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
                <h2 className="font-heading font-bold text-on-surface mb-4 flex items-center gap-2">
                  <LuWallet size={16} className="text-primary" />
                  Minhas posições em moeda
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-left">
                        {['Moeda', 'Qtd', 'Preço médio', 'Cotação atual', 'Valor (BRL)', 'P&L'].map(h => (
                          <th key={h} className="pb-3 text-xs font-semibold text-text-muted pr-4 last:pr-0">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map(h => {
                        const pnl = Number(h.pnlBRL ?? 0);
                        const positive = pnl >= 0;
                        const flag = CURRENCIES.find(c => c.code === h.currency)?.flag;
                        return (
                          <tr key={h.currency} className="border-b border-border/50 last:border-none">
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                {flag && <img src={flag} alt={h.currency} className="w-5 h-5 rounded-full object-cover" />}
                                <span className="font-bold text-sm text-on-surface">{h.currency}</span>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-sm tabular-nums text-on-surface">{Number(h.amount).toFixed(4)}</td>
                            <td className="py-3 pr-4 text-sm tabular-nums text-on-surface">{formatBRL(h.avgBuyRateBRL)}</td>
                            <td className="py-3 pr-4 text-sm tabular-nums text-on-surface">{h.currentRateBRL ? formatBRL(h.currentRateBRL) : '—'}</td>
                            <td className="py-3 pr-4 text-sm tabular-nums text-on-surface">{h.currentValueBRL ? formatBRL(h.currentValueBRL) : '—'}</td>
                            <td className="py-3">
                              {h.pnlBRL ? (
                                <div>
                                  <p className="text-sm font-semibold tabular-nums" style={{ color: positive ? '#00d084' : '#ef4444' }}>
                                    {positive ? '+' : ''}{formatBRL(h.pnlBRL)}
                                  </p>
                                  <p className="text-xs tabular-nums" style={{ color: positive ? '#00d084' : '#ef4444' }}>
                                    {positive ? '+' : ''}{Number(h.pnlPercent).toFixed(2)}%
                                  </p>
                                </div>
                              ) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Chart */}
            <div className="bg-surface border border-border rounded-2xl p-6 md:p-8" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-heading font-bold text-on-surface text-lg flex items-center gap-2">
                    {isPositive ? <LuTrendingUp size={18} className="text-emerald-500" /> : <LuTrendingDown size={18} className="text-red-500" />}
                    Variação {chartFrom}/{chartTo}
                  </h2>
                  <p className="text-sm text-text-muted">{chartLabel}</p>
                </div>
                <div className="flex gap-1">
                  {['1D', '1S', '1M', '1A'].map(p => (
                    <button key={p} type="button" onClick={() => setChartPeriod(p)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${chartPeriod === p ? 'bg-primary-container text-on-primary-container' : 'text-text-muted hover:bg-surface-container'}`}
                    >{p}</button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D084" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#00D084" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                  <YAxis domain={['dataMin - 0.02', 'dataMax + 0.02']} axisLine={false} tickLine={false} width={52}
                    tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickFormatter={(v: number) => v.toFixed(2)} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '13px' }}
                    formatter={(v) => [typeof v === 'number' ? v.toFixed(4) : v, `${chartFrom}/${chartTo}`]} />
                  <Area type="monotone" dataKey="rate" stroke="#00D084" strokeWidth={2} fill="url(#rateGradient)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Dica SoIzi */}
            <div className="rounded-2xl p-6 text-white relative overflow-hidden"
              style={{ backgroundImage: 'url(/dica-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="absolute inset-0 bg-black/40 rounded-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <LuLightbulb size={20} />
                  <h3 className="font-heading font-bold text-lg">Dica SoIzi</h3>
                </div>
                <p className="text-sm opacity-90 leading-relaxed">
                  Sabia que enviar valores maiores pode reduzir o custo proporcional da sua remessa?
                </p>
                <Link to="/simulator" className="mt-3 inline-block text-sm font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity">
                  Ver simulação por volume →
                </Link>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="p-5">
                <h3 className="font-heading font-bold text-on-surface mb-3">Por que as taxas variam?</h3>
                <div className="flex flex-col">
                  {FAQ_ITEMS.map(item => (
                    <div key={item.key} className="border-b border-border/50 last:border-none">
                      <button type="button" onClick={() => setOpenFaq(openFaq === item.key ? null : item.key)}
                        className="flex items-center justify-between w-full py-3 text-sm text-text-muted hover:text-on-surface transition-colors text-left cursor-pointer">
                        <span>{item.question}</span>
                        <LuChevronDown size={14} className="shrink-0 ml-2 transition-transform duration-300"
                          style={{ transform: openFaq === item.key ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                      </button>
                      <div className="grid transition-all duration-300 ease-in-out"
                        style={{ gridTemplateRows: openFaq === item.key ? '1fr' : '0fr' }}>
                        <div className="overflow-hidden">
                          <p className="text-xs text-text-muted pb-3 leading-relaxed pr-2">{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-surface border border-border rounded-2xl p-6 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3">
                <img src="/conversor/globo.jpeg" alt="Globo" className="w-full h-full object-cover" />
              </div>
              <p className="text-sm font-semibold text-on-surface mb-1">Pronto para entender suas remessas globais?</p>
              <p className="text-xs text-text-muted mb-4">Explore todos os termos financeiros no glossário.</p>
              <Link to="/glossary" className="inline-block px-6 py-2.5 border-2 border-primary text-primary font-semibold text-sm rounded-xl hover:bg-primary/5 transition-colors">
                Explorar Glossário →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
