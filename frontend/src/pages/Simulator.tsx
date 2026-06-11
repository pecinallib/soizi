import { useState, useEffect, useRef } from 'react';
import {
  IoArrowForwardCircleOutline,
  IoCheckmarkOutline,
  IoInformationCircleOutline,
  IoSchoolOutline,
  IoBulbOutline,
  IoTrophyOutline,
  IoSwapVerticalOutline,
  IoChevronBackOutline,
  IoWalletOutline,
  IoPaperPlaneOutline,
  IoTimeOutline,
  IoChevronDownOutline,
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { ExplanationTrigger } from '@/components/ui';
import { Navbar } from '@/components/layout';
import { Footer } from '@/components/layout';
import type { ConversionResult, Remittance } from '@/types';

const STEPS = ['Valor', 'Destinatário', 'Revisão', 'Resultado'];

const CURRENCY_FLAGS: Record<string, string> = {
  BRL: '/lp/flags/brl.png',
  USD: '/lp/flags/eua.png',
  EUR: '/lp/flags/eur.png',
  GBP: '/lp/flags/gbp.png',
};

const COUNTRIES = [
  { label: 'Estados Unidos', flag: '/lp/flags/eua.png' },
  { label: 'Portugal',       flag: '/lp/flags/eur.png' },
  { label: 'Reino Unido',    flag: '/lp/flags/gbp.png' },
  { label: 'Alemanha',       flag: '/lp/flags/eur.png' },
  { label: 'Japão',          flag: '/lp/flags/jpy.png' },
];

interface RecipientData {
  name: string;
  country: string;
  bank: string;
  account: string;
}

export function Simulator(): React.JSX.Element {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 - Valor
  const [fromCurrency, setFromCurrency] = useState('BRL');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('1000');
  const [conversion, setConversion] = useState<ConversionResult | null>(null);
  const [convertLoading, setConvertLoading] = useState(false);

  // Step 2 - Destinatário
  const [recipient, setRecipient] = useState<RecipientData>({
    name: '',
    country: 'Estados Unidos',
    bank: '',
    account: '',
  });

  // Step 4 - Resultado
  const [remittance, setRemittance] = useState<Remittance | null>(null);

  // Step 2 - País de destino dropdown
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setIsCountryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) return;
    const timer = setTimeout(async () => {
      setConvertLoading(true);
      try {
        const response = await api.post<ConversionResult>('/exchange/convert', {
          from: fromCurrency,
          to: toCurrency,
          amount: value,
        });
        if (response.success && response.data) setConversion(response.data);
      } catch {
        // silently fail
      } finally {
        setConvertLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [amount, fromCurrency, toCurrency]);

  const handleConvert = async (): Promise<void> => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) return;

    setConvertLoading(true);
    try {
      const response = await api.post<ConversionResult>('/exchange/convert', {
        from: fromCurrency,
        to: toCurrency,
        amount: value,
      });

      if (response.success && response.data) {
        setConversion(response.data);
      }
    } catch {
      // silently fail
    } finally {
      setConvertLoading(false);
    }
  };

  const handleNextFromStep1 = async (): Promise<void> => {
    if (!conversion) await handleConvert();
    setCurrentStep(1);
  };

  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await api.post<Remittance>('/remittance', {
        originCurrency: fromCurrency,
        targetCurrency: toCurrency,
        originAmount: parseFloat(amount),
      });

      if (response.success && response.data) {
        setRemittance(response.data);
        setCurrentStep(3);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number | string, currency: string): string =>
    Number(value).toLocaleString('pt-BR', { style: 'currency', currency });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-300 mx-auto w-full px-5 md:px-10 py-8">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-0 mb-10 max-w-2xl mx-auto">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    index < currentStep
                      ? 'bg-primary-container text-on-primary-container'
                      : index === currentStep
                        ? 'bg-primary text-on-primary ring-4 ring-primary-container/30'
                        : 'bg-surface-container text-text-muted border border-border'
                  }`}
                >
                  {index < currentStep ? <IoCheckmarkOutline size={16} /> : index + 1}
                </div>
                <span
                  className={`text-xs mt-2 font-semibold ${
                    index <= currentStep ? 'text-on-surface' : 'text-text-muted'
                  }`}
                >
                  {step}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 -mt-5 ${
                    index < currentStep ? 'bg-primary-container' : 'bg-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Form */}
          <div className="lg:col-span-2">
            <div
              className="bg-surface border border-border rounded-2xl p-6 md:p-8"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              {/* Step 1 - Valor */}
              {currentStep === 0 && (
                <div>
                  <h2 className="font-heading text-2xl font-bold text-secondary mb-2">
                    Quanto você quer enviar?
                  </h2>
                  <p className="text-text-muted text-sm mb-8">
                    Defina o valor e as moedas da sua simulação.
                  </p>

                  <div className="flex flex-col gap-4">
                    {/* From */}
                    <div>
                      <label className="text-sm text-text-muted mb-1.5 flex items-center gap-1.5">
                        <IoWalletOutline size={14} />
                        Você envia
                      </label>
                      <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary-container transition-all">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="flex-1 text-xl font-semibold text-on-surface bg-transparent focus:outline-none tabular-nums"
                        />
                        <div className="flex items-center gap-2 bg-surface-container rounded-lg px-3 py-1.5">
                          <img
                            src={CURRENCY_FLAGS[fromCurrency]}
                            alt={fromCurrency}
                            className="w-7 h-5 rounded object-cover shrink-0"
                          />
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
                      </div>
                    </div>

                    {/* Swap */}
                    <div className="flex justify-center -my-1">
                      <button
                        type="button"
                        onClick={() => {
                          const temp = fromCurrency;
                          setFromCurrency(toCurrency);
                          setToCurrency(temp);
                        }}
                        className="w-9 h-9 rounded-full bg-surface-container border border-border flex items-center justify-center hover:bg-surface-container-high transition-colors cursor-pointer"
                        title="Inverter moedas"
                      >
                        <IoSwapVerticalOutline size={18} className="text-text-muted" />
                      </button>
                    </div>

                    {/* To */}
                    <div>
                      <label className="text-sm text-text-muted mb-1.5 flex items-center gap-1.5">
                        <IoPaperPlaneOutline size={14} />
                        O destinatário recebe
                      </label>
                      <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3 bg-surface-container-low">
                        <input
                          type="text"
                          value={
                            convertLoading
                              ? '...'
                              : conversion
                                ? conversion.convertedAmount.toFixed(2)
                                : '—'
                          }
                          readOnly
                          className="flex-1 text-xl font-semibold text-on-surface bg-transparent focus:outline-none tabular-nums"
                        />
                        <div className="flex items-center gap-2 bg-surface-container rounded-lg px-3 py-1.5">
                          <img
                            src={CURRENCY_FLAGS[toCurrency]}
                            alt={toCurrency}
                            className="w-7 h-5 rounded object-cover shrink-0"
                          />
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
                      </div>
                    </div>

                    {/* Info */}
                    <div className="bg-surface-container rounded-xl p-4 flex items-start gap-3 border border-border">
                      <IoInformationCircleOutline size={20} className="text-tertiary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-on-surface">
                          Câmbio simulado em tempo real
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          Estamos usando a taxa comercial em tempo real. Sem
                          taxas escondidas.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextFromStep1}
                      className="w-full py-3.5 bg-primary-container text-on-primary-container font-bold text-base rounded-xl hover:brightness-110 active:brightness-95 transition-all cursor-pointer"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 - Destinatário */}
              {currentStep === 1 && (
                <div>
                  <h2 className="font-heading text-2xl font-bold text-secondary mb-2">
                    Para quem você vai enviar?
                  </h2>
                  <p className="text-text-muted text-sm mb-8">
                    Preencha os dados do destinatário (simulação — nenhum dado
                    real é enviado).
                  </p>

                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-on-surface">
                        Nome do destinatário
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: John Rockefeller Jr."
                        value={recipient.name}
                        onChange={(e) =>
                          setRecipient({ ...recipient, name: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-on-surface">
                        País de destino
                      </label>
                      <div ref={countryRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setIsCountryOpen((v) => !v)}
                          className={`w-full px-4 py-3 bg-surface border rounded-lg text-on-surface flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isCountryOpen
                              ? 'border-primary-container ring-2 ring-primary-container'
                              : 'border-border hover:border-primary-container/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={COUNTRIES.find((c) => c.label === recipient.country)?.flag}
                              alt={recipient.country}
                              className="w-7 h-5 rounded object-cover shrink-0"
                            />
                            <span className="text-sm font-medium text-on-surface">
                              {recipient.country}
                            </span>
                          </div>
                          <IoChevronDownOutline
                            size={16}
                            className={`text-text-muted transition-transform duration-200 ${
                              isCountryOpen ? 'rotate-180' : 'rotate-0'
                            }`}
                          />
                        </button>

                        <div
                          className={`absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg z-50 overflow-hidden transition-all duration-200 origin-top ${
                            isCountryOpen
                              ? 'opacity-100 scale-y-100 translate-y-0'
                              : 'opacity-0 scale-y-95 -translate-y-1 pointer-events-none'
                          }`}
                          style={{ boxShadow: 'var(--shadow-card)' }}
                        >
                          {COUNTRIES.map((country) => (
                            <button
                              key={country.label}
                              type="button"
                              onClick={() => {
                                setRecipient({ ...recipient, country: country.label });
                                setIsCountryOpen(false);
                              }}
                              className={`w-full px-4 py-3 flex items-center gap-2.5 transition-colors text-left ${
                                recipient.country === country.label
                                  ? 'bg-primary-container/10 text-primary'
                                  : 'text-on-surface hover:bg-surface-container'
                              }`}
                            >
                              <img
                                src={country.flag}
                                alt={country.label}
                                className="w-7 h-5 rounded object-cover shrink-0"
                              />
                              <span className="text-sm font-medium flex-1">
                                {country.label}
                              </span>
                              {recipient.country === country.label && (
                                <IoCheckmarkOutline size={14} className="text-primary shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-on-surface">
                        Banco
                        <ExplanationTrigger
                          explanation={{
                            title: 'Por que preciso do banco?',
                            description:
                              'Em uma transferência internacional real, o banco do destinatário é necessário para identificar onde o dinheiro será depositado. Cada banco tem um código SWIFT único que funciona como um "endereço" no sistema financeiro global.',
                            example:
                              'Chase Bank (EUA) tem o código SWIFT CHASUS33.',
                          }}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Chase Bank"
                        value={recipient.bank}
                        onChange={(e) =>
                          setRecipient({ ...recipient, bank: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-on-surface">
                        Conta (últimos 4 dígitos)
                        <ExplanationTrigger
                          explanation={{
                            title: 'Por que só os últimos 4 dígitos?',
                            description:
                              'Como isso é uma simulação educativa, não precisamos do número completo da conta. Em uma remessa real, você precisaria do número completo da conta ou IBAN do destinatário.',
                            example:
                              'IBAN europeu: DE89 3704 0044 0532 0130 00. Conta americana: geralmente 10-12 dígitos.',
                          }}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 8829"
                        maxLength={4}
                        value={recipient.account}
                        onChange={(e) =>
                          setRecipient({
                            ...recipient,
                            account: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                      />
                    </div>

                    {/* Simulation Notice */}
                    <div className="bg-primary-container/10 rounded-xl p-4 border border-primary-container/30">
                      <p className="text-sm text-primary font-semibold flex items-center gap-2">
                        <IoSchoolOutline size={16} />
                        Simulação Educativa
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        Nenhum dado real é processado. Preencha com dados
                        fictícios para entender o fluxo de uma remessa
                        internacional.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(0)}
                        className="flex-1 py-3.5 border-2 border-border text-on-surface font-bold text-base rounded-xl hover:bg-surface-container transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <IoChevronBackOutline size={18} />
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        disabled={
                          !recipient.name ||
                          !recipient.bank ||
                          !recipient.account
                        }
                        className="flex-1 py-3.5 bg-primary-container text-on-primary-container font-bold text-base rounded-xl hover:brightness-110 active:brightness-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próximo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 - Revisão */}
              {currentStep === 2 && conversion && (
                <div>
                  <h2 className="font-heading text-2xl font-bold text-secondary mb-2">
                    Revise sua simulação
                  </h2>
                  <p className="text-text-muted text-sm mb-8">
                    Confira todos os detalhes antes de confirmar.
                  </p>

                  <div className="flex flex-col gap-6">
                    {/* Destinatário */}
                    <div className="bg-surface-container rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                        Destinatário
                      </h3>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-muted">Nome</span>
                          <span className="text-on-surface font-medium">
                            {recipient.name}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-text-muted">País</span>
                          <span className="text-on-surface font-medium">
                            {recipient.country}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-text-muted">Banco</span>
                          <span className="text-on-surface font-medium">
                            {recipient.bank}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-text-muted">Conta</span>
                          <span className="text-on-surface font-medium">
                            •••• {recipient.account}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Valores */}
                    <div className="bg-surface-container rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                        Resumo Financeiro
                      </h3>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-center">
                          <p className="text-xs text-text-muted">Você envia</p>
                          <p className="text-xl font-bold text-on-surface tabular-nums mt-1">
                            {formatCurrency(amount, fromCurrency)}
                          </p>
                        </div>
                        <IoArrowForwardCircleOutline size={28} className="text-primary-container shrink-0" />
                        <div className="text-center">
                          <p className="text-xs text-text-muted">
                            Destinatário recebe
                          </p>
                          <p className="text-xl font-bold text-primary tabular-nums mt-1">
                            {formatCurrency(
                              conversion.convertedAmount,
                              toCurrency,
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-border pt-4 flex flex-col gap-2.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-muted">
                            Taxa de câmbio
                          </span>
                          <span className="text-on-surface tabular-nums">
                            1 {toCurrency} ={' '}
                            {conversion.exchangeRate.toFixed(2)} {fromCurrency}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-text-muted">
                            Spread ({(conversion.spread * 100).toFixed(1)}%)
                          </span>
                          <span className="text-on-surface tabular-nums">
                            {formatCurrency(
                              conversion.spreadAmount,
                              fromCurrency,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-text-muted">
                            Taxa de serviço
                          </span>
                          <span className="text-on-surface tabular-nums">
                            {formatCurrency(conversion.fee, fromCurrency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-text-muted">IOF (0,38%)</span>
                          <span className="text-on-surface tabular-nums">
                            {formatCurrency(
                              parseFloat(amount) * 0.0038,
                              fromCurrency,
                            )}
                          </span>
                        </div>
                        <div className="border-t border-border pt-3 mt-1 flex justify-between">
                          <span className="font-heading font-bold text-on-surface">
                            Custo Total
                          </span>
                          <span className="font-heading font-bold text-primary tabular-nums">
                            {formatCurrency(conversion.totalCost, fromCurrency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 py-3.5 border-2 border-border text-on-surface font-bold text-base rounded-xl hover:bg-surface-container transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <IoChevronBackOutline size={18} />
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-1 py-3.5 bg-primary-container text-on-primary-container font-bold text-base rounded-xl hover:brightness-110 active:brightness-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Processando...' : 'Confirmar Simulação'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4 - Resultado */}
              {currentStep === 3 && remittance && (
                <div>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IoTrophyOutline size={36} className="text-primary-container" />
                    </div>
                    <h2 className="font-heading text-2xl font-bold text-secondary">
                      Simulação concluída!
                    </h2>
                    <p className="text-text-muted text-sm mt-2">
                      Veja como seria sua transferência internacional na
                      prática.
                    </p>
                  </div>

                  {/* Status Tracker */}
                  <div className="bg-surface-container rounded-xl p-6 mb-6">
                    <h3 className="font-heading font-bold text-on-surface mb-4 flex items-center gap-2">
                      <IoTimeOutline size={18} className="text-primary-container" />
                      Status da Transferência
                      <ExplanationTrigger
                        explanation={{
                          title: 'O que acontece em cada etapa?',
                          description:
                            'Uma remessa internacional passa por várias etapas: primeiro é criada (Pendente), depois o banco processa a conversão e envia o dinheiro (Processando), e finalmente chega ao destino (Concluída). Se houver algum problema, pode falhar ou ser cancelada.',
                        }}
                      />
                    </h3>
                    <div className="flex items-center gap-2">
                      {['Pendente', 'Processando', 'Enviado', 'Concluída'].map(
                        (status, index) => (
                          <div
                            key={status}
                            className="flex items-center flex-1 last:flex-none"
                          >
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                  index === 0
                                    ? 'bg-primary-container text-on-primary-container'
                                    : 'bg-surface border border-border text-text-muted'
                                }`}
                              >
                                {index === 0 ? <IoCheckmarkOutline size={14} /> : index + 1}
                              </div>
                              <span className="text-xs mt-1 text-text-muted">
                                {status}
                              </span>
                            </div>
                            {index < 3 && (
                              <div
                                className={`flex-1 h-0.5 mx-2 -mt-4 ${
                                  index < 0
                                    ? 'bg-primary-container'
                                    : 'bg-border'
                                }`}
                              />
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Resumo */}
                  <div className="bg-surface-container rounded-xl p-6 mb-6">
                    <h3 className="font-heading font-bold text-on-surface mb-4">
                      Resumo Financeiro
                    </h3>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-xs text-text-muted">Você enviou</p>
                        <p className="text-lg font-bold text-on-surface tabular-nums">
                          {remittance.originCurrency}{' '}
                          {Number(remittance.originAmount).toLocaleString(
                            'pt-BR',
                            { minimumFractionDigits: 2 },
                          )}
                        </p>
                      </div>
                      <IoArrowForwardCircleOutline size={22} className="text-primary-container shrink-0" />
                      <div className="text-right">
                        <p className="text-xs text-text-muted">
                          Destinatário recebe
                        </p>
                        <p className="text-lg font-bold text-primary tabular-nums">
                          {remittance.targetCurrency}{' '}
                          {Number(remittance.targetAmount).toLocaleString(
                            'pt-BR',
                            { minimumFractionDigits: 2 },
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-dashed border-border pt-4 flex flex-col gap-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Taxa de câmbio</span>
                        <span className="text-on-surface tabular-nums">
                          1 {remittance.targetCurrency} ={' '}
                          {Number(remittance.exchangeRate).toFixed(2)}{' '}
                          {remittance.originCurrency}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Spread</span>
                        <span className="text-on-surface tabular-nums">
                          {(Number(remittance.spread) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Taxa de serviço</span>
                        <span className="text-on-surface tabular-nums">
                          {remittance.originCurrency}{' '}
                          {Number(remittance.fee).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="border-t border-border pt-3 mt-1 flex justify-between">
                        <span className="font-heading font-bold text-on-surface">
                          Custo Total
                        </span>
                        <span className="font-heading font-bold text-primary tabular-nums">
                          {remittance.originCurrency}{' '}
                          {Number(remittance.totalCost).toLocaleString(
                            'pt-BR',
                            { minimumFractionDigits: 2 },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Você sabia? */}
                  <div className="bg-tertiary/5 border border-tertiary/20 rounded-xl p-5 mb-6">
                    <p className="text-sm font-semibold text-tertiary flex items-center gap-2 mb-2">
                      <IoBulbOutline size={16} />
                      Você sabia?
                    </p>
                    <p className="text-sm text-text-muted leading-relaxed">
                      Uma transferência internacional real leva em média 1-3
                      dias úteis para ser concluída. O dinheiro passa por redes
                      como SWIFT, que conectam mais de 11.000 bancos em 200
                      países.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(0);
                        setConversion(null);
                        setRemittance(null);
                        setAmount('1000');
                        setRecipient({
                          name: '',
                          country: 'Estados Unidos',
                          bank: '',
                          account: '',
                        });
                      }}
                      className="flex-1 py-3.5 border-2 border-border text-on-surface font-bold text-base rounded-xl hover:bg-surface-container transition-all cursor-pointer"
                    >
                      Nova Simulação
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="flex-1 py-3.5 bg-primary-container text-on-primary-container font-bold text-base rounded-xl hover:brightness-110 active:brightness-95 transition-all cursor-pointer"
                    >
                      Ir pro Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Resumo */}
          {currentStep < 3 && (
            <div className="lg:col-span-1">
              <div
                className="bg-surface border border-border rounded-2xl p-6 sticky top-24"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <h3 className="font-heading font-bold text-on-surface mb-4">
                  Resumo da Simulação
                </h3>

                {conversion ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Taxa de serviço</span>
                      <span className="text-on-surface tabular-nums">
                        {formatCurrency(conversion.fee, fromCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">IOF (0,38%)</span>
                      <span className="text-on-surface tabular-nums">
                        {formatCurrency(
                          parseFloat(amount) * 0.0038,
                          fromCurrency,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Câmbio comercial</span>
                      <span className="text-on-surface tabular-nums text-xs">
                        1 {toCurrency} = {conversion.exchangeRate.toFixed(2)}{' '}
                        {fromCurrency}
                      </span>
                    </div>
                    <div className="border-t border-dashed border-border pt-3 mt-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-bold text-primary">
                          Custo total
                        </span>
                        <span className="font-bold text-primary tabular-nums">
                          {formatCurrency(conversion.totalCost, fromCurrency)}
                        </span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-text-muted">
                          Chegada estimada
                        </span>
                        <span className="text-xs text-on-surface font-medium">
                          Hoje (simulação)
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">
                    Defina o valor e as moedas para ver o resumo da simulação.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
