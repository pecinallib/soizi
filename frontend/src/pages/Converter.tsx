import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LuArrowUpDown,
  LuLightbulb,
  LuChevronDown,
  LuTrendingUp,
  LuTrendingDown,
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
import { ExplanationTrigger } from '@/components/ui';
import { Navbar, Footer } from '@/components/layout';
import type { ConversionResult } from '@/types';

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
    answer:
      'Spread é a diferença entre a taxa de câmbio real do mercado e a taxa que a instituição te oferece. É assim que bancos e corretoras lucram com câmbio.',
  },
  {
    key: 'iof',
    question: 'Como o IOF é calculado?',
    answer:
      'IOF (Imposto sobre Operações Financeiras) é cobrado em operações de câmbio. A alíquota padrão é 0,38% do valor enviado.',
  },
  {
    key: 'cambio',
    question: 'Por que o câmbio muda toda hora?',
    answer:
      'O câmbio flutua por oferta e demanda, política econômica, inflação e eventos geopolíticos, como qualquer ativo negociado no mercado.',
  },
];

const MONTHS_PT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];
const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateChartData(
  baseRate: number,
  from: string,
  to: string,
  period: string,
): { date: string; rate: number }[] {
  const pairSeed = (from + to + period)
    .split('')
    .reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0);

  const now = new Date();
  let count: number;
  let volatility: number;
  const labels: string[] = [];

  if (period === '1D') {
    count = 12;
    volatility = 0.003;
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 2 * 60 * 60 * 1000);
      labels.push(
        i === 0 ? 'Agora' : `${String(d.getHours()).padStart(2, '0')}h`,
      );
    }
  } else if (period === '1S') {
    count = 7;
    volatility = 0.008;
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      labels.push(
        i === 0 ? 'Hoje' : `${d.getDate()} ${MONTHS_PT[d.getMonth()]}`,
      );
    }
  } else if (period === '1M') {
    count = 10;
    volatility = 0.015;
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3 * 24 * 60 * 60 * 1000);
      labels.push(
        i === 0 ? 'Hoje' : `${d.getDate()} ${MONTHS_PT[d.getMonth()]}`,
      );
    }
  } else {
    count = 12;
    volatility = 0.05;
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(
        `${DAYS_PT[0]} ${MONTHS_PT[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`,
      );
      labels[labels.length - 1] =
        `${MONTHS_PT[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
    }
  }

  // Build rates backwards from current rate (so last point = baseRate)
  const rates: number[] = new Array(count).fill(0);
  rates[count - 1] = baseRate;
  for (let i = count - 2; i >= 0; i--) {
    const rand = seededRandom(pairSeed + i) - 0.5;
    rates[i] = rates[i + 1] * (1 + rand * volatility * 2);
  }

  return labels.map((date, i) => ({ date, rate: Number(rates[i].toFixed(4)) }));
}

export function Converter(): React.JSX.Element {
  const navigate = useNavigate();

  const [fromAmount, setFromAmount] = useState('2000');
  const [fromCurrency, setFromCurrency] = useState('BRL');
  const [toCurrency, setToCurrency] = useState('USD');
  const [conversion, setConversion] = useState<ConversionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conversionError, setConversionError] = useState(false);

  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState('1S');

  useEffect(() => {
    const load = async (): Promise<void> => {
      const amount = parseFloat(fromAmount.replace(',', '.'));
      if (isNaN(amount) || amount <= 0) return;

      setIsLoading(true);
      setConversionError(false);
      try {
        const response = await api.post<ConversionResult>('/exchange/convert', {
          from: fromCurrency,
          to: toCurrency,
          amount,
        });
        if (response.success && response.data) {
          setConversion(response.data);
        } else {
          setConversionError(true);
        }
      } catch {
        setConversionError(true);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      load();
    }, 600);
    return () => clearTimeout(timer);
  }, [fromAmount, fromCurrency, toCurrency]);

  const handleSwap = (): void => {
    const prev = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(prev);
    setConversion(null);
  };

  const rate = conversion?.exchangeRate;
  const chartData = useMemo(
    () =>
      generateChartData(rate ?? 5.26, fromCurrency, toCurrency, chartPeriod),
    [rate, fromCurrency, toCurrency, chartPeriod],
  );

  const isPositive =
    chartData.length >= 2
      ? chartData[chartData.length - 1].rate >= chartData[0].rate
      : true;

  const iofAmount = parseFloat(fromAmount.replace(',', '.') || '0') * 0.0038;

  const toAmount = conversion
    ? conversion.convertedAmount.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '';

  const fromFlag = CURRENCIES.find((c) => c.code === fromCurrency)?.flag ?? '';
  const toFlag = CURRENCIES.find((c) => c.code === toCurrency)?.flag ?? '';

  const formatBRL = (value: number): string =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const chartLabel =
    chartPeriod === '1D'
      ? 'Últimas 24 horas'
      : chartPeriod === '1S'
        ? 'Últimos 7 dias'
        : chartPeriod === '1M'
          ? 'Últimos 30 dias'
          : 'Último ano';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-300 mx-auto w-full px-5 md:px-10 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-secondary">
            Converta e Simule
          </h1>
          <p className="text-text-muted mt-2">
            Sem letras miúdas. Apenas transparência radical.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Converter Card */}
            <div
              className="bg-surface border border-border rounded-2xl p-6 md:p-8"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              {/* From */}
              <div className="mb-2">
                <p className="text-sm text-text-muted mb-1.5">Você envia</p>
                <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-primary transition-all">
                  <div className="flex items-center gap-2 shrink-0">
                    <img
                      key={fromCurrency}
                      src={fromFlag}
                      alt={fromCurrency}
                      className="w-6 h-6 rounded-full object-cover animate-flag-pop"
                    />
                    <select
                      value={fromCurrency}
                      onChange={(e) => {
                        setFromCurrency(e.target.value);
                        setConversion(null);
                      }}
                      className="bg-transparent font-semibold text-on-surface text-sm cursor-pointer focus:outline-none"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-px h-5 bg-border shrink-0" />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="flex-1 text-right text-xl font-semibold text-on-surface bg-transparent focus:outline-none tabular-nums"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Swap */}
              <div className="flex justify-center my-3">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-on-primary hover:brightness-110 transition-all cursor-pointer shadow-sm"
                >
                  <LuArrowUpDown size={18} />
                </button>
              </div>

              {/* To */}
              <div className="mb-6">
                <p className="text-sm text-text-muted mb-1.5">
                  Destinatário recebe
                </p>
                <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3.5 bg-surface-container/50">
                  <div className="flex items-center gap-2 shrink-0">
                    <img
                      key={toCurrency}
                      src={toFlag}
                      alt={toCurrency}
                      className="w-6 h-6 rounded-full object-cover animate-flag-pop"
                    />
                    <select
                      value={toCurrency}
                      onChange={(e) => {
                        setToCurrency(e.target.value);
                        setConversion(null);
                      }}
                      className="bg-transparent font-semibold text-on-surface text-sm cursor-pointer focus:outline-none"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-px h-5 bg-border shrink-0" />
                  {isLoading ? (
                    <div className="flex-1 flex justify-end">
                      <div className="h-7 w-32 bg-border/40 rounded-lg animate-pulse" />
                    </div>
                  ) : (
                    <span className="flex-1 text-right text-xl font-semibold text-on-surface tabular-nums">
                      {toAmount || '—'}
                    </span>
                  )}
                </div>
              </div>

              {/* Error */}
              {conversionError && (
                <p className="text-sm text-red-500 text-center mb-5">
                  Não foi possível obter a cotação. Verifique sua conexão e
                  tente novamente.
                </p>
              )}

              {/* Fee Breakdown */}
              {conversion && !conversionError && (
                <div className="border-t border-dashed border-border pt-5 flex flex-col gap-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted flex items-center gap-1">
                      Taxa de serviço SoIzi
                      <ExplanationTrigger
                        explanation={{
                          title: 'O que é a taxa de serviço?',
                          description:
                            'A taxa de serviço é um valor fixo cobrado por operação para cobrir custos de processamento e comunicação entre bancos.',
                          example:
                            'Nesta simulação, a taxa fixa é de R$5,00 independente do valor enviado.',
                        }}
                      />
                    </span>
                    <span className="text-on-surface tabular-nums">
                      {formatBRL(conversion.fee)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted flex items-center gap-1">
                      IOF (0,38%)
                      <ExplanationTrigger
                        explanation={{
                          title: 'O que é IOF?',
                          description:
                            'IOF (Imposto sobre Operações Financeiras) é um imposto federal brasileiro cobrado em operações de câmbio. A alíquota varia de 0,38% a 1,1% dependendo do tipo de operação.',
                          example:
                            'Enviando R$1.000 com IOF de 0,38%: o imposto seria R$3,80.',
                        }}
                      />
                    </span>
                    <span className="text-on-surface tabular-nums">
                      {formatBRL(iofAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted flex items-center gap-1">
                      Câmbio Comercial
                      <ExplanationTrigger
                        explanation={{
                          title: 'O que é câmbio comercial?',
                          description:
                            'O câmbio comercial é a taxa usada em operações entre empresas e instituições financeiras. É a referência mais próxima do "câmbio real" do mercado.',
                          example: `Nesta simulação: 1 ${toCurrency} = ${conversion.exchangeRate.toFixed(2)} ${fromCurrency}`,
                        }}
                      />
                    </span>
                    <span className="text-on-surface tabular-nums">
                      1 {toCurrency} = {conversion.exchangeRate.toFixed(2)}{' '}
                      {fromCurrency}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted flex items-center gap-1">
                      Spread
                      <ExplanationTrigger
                        explanation={{
                          title: 'O que é spread?',
                          description:
                            'Spread é a diferença entre a taxa de câmbio real do mercado e a taxa que a instituição te oferece. É assim que bancos e corretoras lucram com câmbio.',
                          example: `Nesta simulação o spread é de ${(conversion.spread * 100).toFixed(1)}%, ou seja, ${formatBRL(conversion.spreadAmount)} sobre o valor enviado.`,
                        }}
                      />
                    </span>
                    <span className="text-on-surface tabular-nums">
                      {(conversion.spread * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="border-t border-border pt-3 mt-1 flex items-center justify-between">
                    <span className="font-heading font-bold text-on-surface text-lg">
                      Custo Total
                    </span>
                    <span className="font-heading font-bold text-primary text-xl tabular-nums">
                      {formatBRL(conversion.totalCost)}
                    </span>
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                type="button"
                onClick={() => navigate('/simulator')}
                className="w-full mt-2 py-4 bg-primary-container text-on-primary-container font-bold text-base rounded-xl hover:brightness-105 active:brightness-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Simular Troca →
              </button>
            </div>

            {/* Chart Card */}
            <div
              className="bg-surface border border-border rounded-2xl p-6 md:p-8"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-heading font-bold text-on-surface text-lg flex items-center gap-2">
                    {isPositive ? (
                      <LuTrendingUp size={18} className="text-emerald-500" />
                    ) : (
                      <LuTrendingDown size={18} className="text-red-500" />
                    )}
                    Variação {fromCurrency}/{toCurrency}
                  </h2>
                  <p className="text-sm text-text-muted">{chartLabel}</p>
                </div>
                <div className="flex gap-1">
                  {['1D', '1S', '1M', '1A'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setChartPeriod(p)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                        chartPeriod === p
                          ? 'bg-primary-container text-on-primary-container'
                          : 'text-text-muted hover:bg-surface-container'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="rateGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#00D084" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#00D084" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                  />
                  <YAxis
                    domain={['dataMin - 0.02', 'dataMax + 0.02']}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                    tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                    tickFormatter={(v: number) => v.toFixed(2)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                    formatter={(v) => [
                      typeof v === 'number' ? v.toFixed(4) : v,
                      `${fromCurrency}/${toCurrency}`,
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#00D084"
                    strokeWidth={2}
                    fill="url(#rateGradient)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Dica SoIzi */}
            <div
              className="rounded-2xl p-6 text-white relative overflow-hidden"
              style={{
                backgroundImage: 'url(/dica-bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-black/40 rounded-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <LuLightbulb size={20} />
                  <h3 className="font-heading font-bold text-lg">Dica SoIzi</h3>
                </div>
                <p className="text-sm opacity-90 leading-relaxed">
                  Sabia que enviar valores maiores pode reduzir o custo
                  proporcional da sua remessa?
                </p>
                <Link
                  to="/simulator"
                  className="mt-3 inline-block text-sm font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
                >
                  Ver simulação por volume →
                </Link>
              </div>
            </div>

            {/* FAQ */}
            <div
              className="bg-surface border border-border rounded-2xl overflow-hidden"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="p-5">
                <h3 className="font-heading font-bold text-on-surface mb-3">
                  Por que as taxas variam?
                </h3>
                <div className="flex flex-col">
                  {FAQ_ITEMS.map((item) => (
                    <div
                      key={item.key}
                      className="border-b border-border/50 last:border-none"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenFaq(openFaq === item.key ? null : item.key)
                        }
                        className="flex items-center justify-between w-full py-3 text-sm text-text-muted hover:text-on-surface transition-colors text-left cursor-pointer"
                      >
                        <span>{item.question}</span>
                        <LuChevronDown
                          size={14}
                          className="shrink-0 ml-2 transition-transform duration-300"
                          style={{
                            transform: openFaq === item.key ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        />
                      </button>
                      <div
                        className="grid transition-all duration-300 ease-in-out"
                        style={{ gridTemplateRows: openFaq === item.key ? '1fr' : '0fr' }}
                      >
                        <div className="overflow-hidden">
                          <p className="text-xs text-text-muted pb-3 leading-relaxed pr-2">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Glossário */}
            <div
              className="bg-surface border border-border rounded-2xl p-6 text-center"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3">
                <img
                  src="/conversor/globo.jpeg"
                  alt="Globo"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-semibold text-on-surface mb-1">
                Pronto para entender suas remessas globais?
              </p>
              <p className="text-xs text-text-muted mb-4">
                Explore todos os termos financeiros no glossário.
              </p>
              <Link
                to="/glossary"
                className="inline-block px-6 py-2.5 border-2 border-primary text-primary font-semibold text-sm rounded-xl hover:bg-primary/5 transition-colors"
              >
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
