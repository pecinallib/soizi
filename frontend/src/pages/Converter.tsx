import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { ExplanationTrigger } from '@/components/ui';
import { Navbar } from '@/components/layout';
import { Footer } from '@/components/layout';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ConversionResult } from '@/types';

const MOCK_CHART_DATA = [
  { date: '12 Mai', rate: 5.28 },
  { date: '13 Mai', rate: 5.31 },
  { date: '14 Mai', rate: 5.35 },
  { date: '15 Mai', rate: 5.3 },
  { date: '16 Mai', rate: 5.33 },
  { date: '17 Mai', rate: 5.38 },
  { date: '18 Mai', rate: 5.42 },
  { date: 'Hoje', rate: 5.42 },
];

const FAQ_ITEMS = [
  { question: 'O que é o Spread bancário?', key: 'spread' },
  { question: 'Como o IOF é calculado?', key: 'iof' },
  { question: 'Por que o câmbio muda toda hora?', key: 'taxa-cambio' },
];

export function Converter(): React.JSX.Element {
  const [fromAmount, setFromAmount] = useState('1000.00');
  const [toAmount, setToAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('BRL');
  const [toCurrency, setToCurrency] = useState('USD');
  const [conversion, setConversion] = useState<ConversionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState('1D');

  useEffect(() => {
    const convert = async (): Promise<void> => {
      const amount = parseFloat(fromAmount);
      if (isNaN(amount) || amount <= 0) return;

      setIsLoading(true);
      try {
        const response = await api.post<ConversionResult>('/exchange/convert', {
          from: fromCurrency,
          to: toCurrency,
          amount,
        });

        if (response.success && response.data) {
          setConversion(response.data);
          setToAmount(response.data.convertedAmount.toFixed(2));
        }
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(convert, 500);
    return () => clearTimeout(timer);
  }, [fromAmount, fromCurrency, toCurrency]);

  const handleSwap = (): void => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
  };

  const formatBRL = (value: number): string =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
              {/* From Input */}
              <div className="mb-2">
                <label className="text-sm text-text-muted mb-1.5 block">
                  Você envia
                </label>
                <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary-container transition-all">
                  <div className="flex items-center gap-2 bg-surface-container rounded-lg px-3 py-1.5">
                    <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-on-primary text-xs font-bold">
                      {fromCurrency.charAt(0)}
                    </span>
                    <select
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value)}
                      className="bg-transparent font-semibold text-on-surface text-sm cursor-pointer focus:outline-none"
                    >
                      <option value="BRL">BRL</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="flex-1 text-right text-xl font-semibold text-on-surface bg-transparent focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center my-3">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-on-primary hover:brightness-110 transition-all cursor-pointer"
                >
                  ⇅
                </button>
              </div>

              {/* To Input */}
              <div className="mb-6">
                <label className="text-sm text-text-muted mb-1.5 block">
                  Destinatário recebe
                </label>
                <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3 bg-surface-container-low">
                  <div className="flex items-center gap-2 bg-surface-container rounded-lg px-3 py-1.5">
                    <span className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-on-secondary text-xs font-bold">
                      {toCurrency.charAt(0)}
                    </span>
                    <select
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value)}
                      className="bg-transparent font-semibold text-on-surface text-sm cursor-pointer focus:outline-none"
                    >
                      <option value="USD">USD</option>
                      <option value="BRL">BRL</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={isLoading ? '...' : toAmount}
                    readOnly
                    className="flex-1 text-right text-xl font-semibold text-on-surface bg-transparent focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              {/* Fee Breakdown */}
              {conversion && (
                <div className="border-t border-dashed border-border pt-5 flex flex-col gap-3">
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
                      {formatBRL(parseFloat(fromAmount) * 0.0038)}
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
                    <span className="font-heading font-bold text-primary text-lg tabular-nums">
                      {formatBRL(conversion.totalCost)}
                    </span>
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                type="button"
                className="w-full mt-6 py-3.5 bg-primary-container text-on-primary-container font-bold text-base rounded-xl hover:brightness-110 active:brightness-95 transition-all cursor-pointer"
              >
                Simular Envio
              </button>
            </div>

            {/* Chart Card */}
            <div
              className="bg-surface border border-border rounded-2xl p-6 md:p-8"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-heading font-bold text-on-surface text-lg">
                    Variação {fromCurrency}/{toCurrency}
                  </h2>
                  <p className="text-sm text-text-muted">Últimos 7 dias</p>
                </div>
                <div className="flex gap-1">
                  {['1D', '1S', '1M', '1A'].map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setChartPeriod(period)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                        chartPeriod === period
                          ? 'bg-primary-container text-on-primary-container'
                          : 'text-text-muted hover:bg-surface-container'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={MOCK_CHART_DATA}>
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
                    tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                  />
                  <YAxis
                    domain={['dataMin - 0.05', 'dataMax + 0.05']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                    tickFormatter={(v: number) => v.toFixed(2)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#00D084"
                    strokeWidth={2}
                    fill="url(#rateGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Dica SoIzi */}
            <div className="bg-primary rounded-2xl p-6 text-on-primary">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💡</span>
                <h3 className="font-heading font-bold text-lg">Dica SoIzi</h3>
              </div>
              <p className="text-sm opacity-90 leading-relaxed">
                Sabia que enviar valores maiores pode reduzir o custo
                proporcional da sua remessa?
              </p>
              <button
                type="button"
                className="mt-3 text-sm font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer"
              >
                Ver simulação por volume
              </button>
            </div>

            {/* Image Card */}
            <div
              className="bg-surface border border-border rounded-2xl overflow-hidden"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="h-36 bg-linear-to-br from-secondary to-primary/80" />
              <div className="p-5">
                <h3 className="font-heading font-bold text-on-surface mb-3">
                  Por que as taxas variam?
                </h3>
                <div className="flex flex-col gap-2">
                  {FAQ_ITEMS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        setOpenFaq(openFaq === item.key ? null : item.key)
                      }
                      className="flex items-center justify-between text-sm text-text-muted hover:text-on-surface py-2 border-b border-border/50 last:border-none transition-colors cursor-pointer text-left w-full"
                    >
                      <span>{item.question}</span>
                      <span className="text-xs ml-2">
                        {openFaq === item.key ? '▲' : '▼'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-surface-container border border-border rounded-2xl p-6 text-center">
              <p className="text-sm text-on-surface font-semibold mb-3">
                Pronto para entender suas remessas globais?
              </p>
              <button
                type="button"
                className="px-6 py-2.5 border-2 border-primary text-primary font-semibold text-sm rounded-xl hover:bg-primary/5 transition-colors cursor-pointer"
              >
                Explorar Glossário
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
