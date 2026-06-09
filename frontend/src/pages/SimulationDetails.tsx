import { useState, useEffect } from 'react';
import { IoArrowForwardCircleOutline } from 'react-icons/io5';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/services/api';
import { ExplanationTrigger } from '@/components/ui';
import { Navbar } from '@/components/layout';
import { Footer } from '@/components/layout';
import type { Remittance } from '@/types';

const STATUS_STEPS = [
  {
    key: 'PENDING',
    label: 'Pendente',
    description: 'Simulação criada, aguardando processamento.',
  },
  {
    key: 'PROCESSING',
    label: 'Processando',
    description: 'Conversão realizada, dinheiro em trânsito entre bancos.',
  },
  {
    key: 'COMPLETED',
    label: 'Concluída',
    description: 'Dinheiro chegou ao destino com sucesso.',
  },
];

const STATUS_ORDER: Record<string, number> = {
  PENDING: 0,
  PROCESSING: 1,
  COMPLETED: 2,
  FAILED: -1,
  CANCELLED: -1,
};

export function SimulationDetails(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [remittance, setRemittance] = useState<Remittance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const loadRemittance = async (): Promise<void> => {
      try {
        const response = await api.get<Remittance>(`/remittance/${id}`);
        if (response.success && response.data) {
          setRemittance(response.data);
        } else {
          setError(response.message || 'Simulação não encontrada');
        }
      } catch {
        setError('Erro ao carregar detalhes da simulação');
      } finally {
        setIsLoading(false);
      }
    };

    loadRemittance();
  }, [id]);

  const handleCancel = async (): Promise<void> => {
    if (!id) return;
    setIsCancelling(true);
    try {
      const response = await api.patch<Remittance>(`/remittance/${id}/cancel`);
      if (response.success && response.data) {
        setRemittance(response.data);
      }
    } catch {
      // silently fail
    } finally {
      setIsCancelling(false);
    }
  };

  const formatValue = (value: string, currency: string): string =>
    `${currency} ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const formatDate = (date: string): string =>
    new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-text-muted">Carregando...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !remittance) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-error text-lg font-semibold mb-4">{error}</p>
            <Link
              to="/dashboard"
              className="text-tertiary font-semibold hover:underline"
            >
              Voltar pro Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentStatusIndex = STATUS_ORDER[remittance.status] ?? -1;
  const isFailed = remittance.status === 'FAILED';
  const isCancelled = remittance.status === 'CANCELLED';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-300 mx-auto w-full px-5 md:px-10 py-8">
        {/* Breadcrumb */}
        <Link
          to="/dashboard"
          className="text-sm text-tertiary hover:underline mb-4 inline-block"
        >
          ← Voltar para Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-secondary">
              Detalhes da Simulação
            </h1>
            <p className="text-sm text-text-muted mt-1">
              ID da transação:{' '}
              <span className="font-mono text-on-surface">
                #{remittance.id.slice(0, 8).toUpperCase()}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            {remittance.status === 'PENDING' && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCancelling}
                className="px-5 py-2.5 border-2 border-error text-error font-semibold text-sm rounded-xl hover:bg-error/5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? 'Cancelando...' : 'Cancelar Simulação'}
              </button>
            )}
            <span className="inline-block px-3 py-1 bg-primary-container/10 text-primary text-xs font-semibold rounded-full border border-primary-container/30">
              🎓 Simulação Educativa
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Status Tracker */}
            <div
              className="bg-surface border border-border rounded-2xl p-6 md:p-8"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <h2 className="font-heading font-bold text-on-surface mb-6 flex items-center gap-2">
                📍 Status da Transferência
                <ExplanationTrigger
                  explanation={{
                    title: 'Como funciona o status?',
                    description:
                      'Uma remessa internacional passa por etapas: Pendente (criada), Processando (banco convertendo e enviando) e Concluída (dinheiro chegou). Em caso de problema, pode ficar como Falha ou ser Cancelada pelo usuário.',
                  }}
                />
              </h2>

              {isFailed || isCancelled ? (
                <div
                  className={`p-4 rounded-xl ${isFailed ? 'bg-error-container' : 'bg-surface-container'}`}
                >
                  <p
                    className={`text-sm font-semibold ${isFailed ? 'text-on-error-container' : 'text-text-muted'}`}
                  >
                    {isFailed
                      ? '❌ Esta simulação falhou durante o processamento.'
                      : '🚫 Esta simulação foi cancelada.'}
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-0">
                  {STATUS_STEPS.map((step, index) => (
                    <div
                      key={step.key}
                      className="flex items-start flex-1 last:flex-none"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                            index < currentStatusIndex
                              ? 'bg-primary-container text-on-primary-container'
                              : index === currentStatusIndex
                                ? 'bg-primary text-on-primary ring-4 ring-primary-container/30 animate-pulse'
                                : 'bg-surface-container text-text-muted border border-border'
                          }`}
                        >
                          {index <= currentStatusIndex ? '✓' : index + 1}
                        </div>
                        <span
                          className={`text-xs mt-2 font-semibold ${
                            index <= currentStatusIndex
                              ? 'text-on-surface'
                              : 'text-text-muted'
                          }`}
                        >
                          {step.label}
                        </span>
                        {index <= currentStatusIndex && (
                          <span className="text-xs text-text-muted mt-0.5">
                            {formatDate(
                              index === 0
                                ? remittance.createdAt
                                : remittance.updatedAt,
                            )}
                          </span>
                        )}
                      </div>
                      {index < STATUS_STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-3 mt-5 ${
                            index < currentStatusIndex
                              ? 'bg-primary-container'
                              : 'bg-border'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Current Status Info */}
              {!isFailed && !isCancelled && (
                <div className="mt-6 bg-surface-container rounded-xl p-4 flex items-start gap-3 border border-border">
                  <span className="text-primary text-lg">ℹ️</span>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Sua simulação está em:{' '}
                      {STATUS_STEPS[currentStatusIndex]?.label}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {STATUS_STEPS[currentStatusIndex]?.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Resumo Financeiro */}
            <div
              className="bg-surface border border-border rounded-2xl p-6 md:p-8"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <h2 className="font-heading font-bold text-on-surface mb-6">
                Resumo Financeiro
              </h2>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="text-center sm:text-left">
                  <p className="text-xs text-text-muted uppercase tracking-wider">
                    Você enviou
                  </p>
                  <p className="text-2xl font-bold text-on-surface tabular-nums mt-1 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-on-primary text-xs font-bold">
                      {remittance.originCurrency.charAt(0)}
                    </span>
                    {formatValue(
                      remittance.originAmount,
                      remittance.originCurrency,
                    )}
                  </p>
                </div>

                <IoArrowForwardCircleOutline size={32} className="text-primary-container shrink-0" />

                <div className="text-center sm:text-right">
                  <p className="text-xs text-text-muted uppercase tracking-wider">
                    Destinatário recebe
                  </p>
                  <p className="text-2xl font-bold text-primary tabular-nums mt-1 flex items-center gap-2">
                    {formatValue(
                      remittance.targetAmount,
                      remittance.targetCurrency,
                    )}
                    <span className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-on-secondary text-xs font-bold">
                      {remittance.targetCurrency.charAt(0)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted flex items-center gap-1">
                    Taxa de câmbio (Comercial)
                    <ExplanationTrigger
                      explanation={{
                        title: 'O que é câmbio comercial?',
                        description:
                          'O câmbio comercial é a taxa usada em operações entre empresas e instituições financeiras. É a referência mais próxima do "câmbio real" do mercado.',
                        example: `Nesta simulação: 1 ${remittance.originCurrency} = ${(1 / Number(remittance.exchangeRate)).toFixed(4)} ${remittance.targetCurrency}`,
                      }}
                    />
                  </span>
                  <span className="text-on-surface tabular-nums">
                    1 {remittance.originCurrency} ={' '}
                    {(1 / Number(remittance.exchangeRate)).toFixed(4)}{' '}
                    {remittance.targetCurrency}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted flex items-center gap-1">
                    Tarifa SoIzi
                    <ExplanationTrigger
                      explanation={{
                        title: 'O que é a tarifa de serviço?',
                        description:
                          'É uma taxa fixa cobrada por operação para cobrir custos de processamento, comunicação entre bancos e compliance.',
                        example: `Nesta simulação a tarifa foi de ${formatValue(remittance.fee, remittance.originCurrency)}.`,
                      }}
                    />
                  </span>
                  <span className="text-on-surface tabular-nums">
                    {formatValue(remittance.fee, remittance.originCurrency)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted flex items-center gap-1">
                    IOF (0,38%)
                    <ExplanationTrigger
                      explanation={{
                        title: 'O que é IOF?',
                        description:
                          'IOF (Imposto sobre Operações Financeiras) é um imposto federal brasileiro cobrado em operações de câmbio. A alíquota para remessas internacionais é de 0,38%.',
                        example: `Sobre ${formatValue(remittance.originAmount, remittance.originCurrency)}, o IOF seria ${formatValue(String(Number(remittance.originAmount) * 0.0038), remittance.originCurrency)}.`,
                      }}
                    />
                  </span>
                  <span className="text-on-surface tabular-nums">
                    {formatValue(
                      String(Number(remittance.originAmount) * 0.0038),
                      remittance.originCurrency,
                    )}
                  </span>
                </div>

                <div className="border-t border-border pt-3 mt-1 flex items-center justify-between">
                  <span className="font-heading font-bold text-on-surface text-lg">
                    Custo Total Efetivo (VET)
                  </span>
                  <span className="font-heading font-bold text-primary text-lg tabular-nums">
                    {formatValue(
                      remittance.totalCost,
                      remittance.originCurrency,
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Você Sabia? */}
            <div className="bg-tertiary/5 border border-tertiary/20 rounded-2xl p-6">
              <p className="text-sm font-semibold text-tertiary flex items-center gap-2 mb-2">
                💡 Você sabia?
              </p>
              <p className="text-sm text-text-muted leading-relaxed">
                O VET (Valor Efetivo Total) é o indicador mais importante ao
                comparar remessas. Ele inclui todos os custos: taxa de câmbio,
                spread, tarifa e impostos. Duas instituições podem ter o mesmo
                câmbio, mas VETs muito diferentes por causa das taxas ocultas.
                No SoIzi, mostramos tudo de forma transparente.
              </p>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Destinatário Card */}
            <div
              className="bg-surface border border-border rounded-2xl p-6"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
                Destinatário
              </h3>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-primary-container/20 rounded-full flex items-center justify-center">
                  <span className="font-heading font-bold text-primary text-lg">
                    {remittance.targetCurrency.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-on-surface">
                    Destinatário Simulado
                  </p>
                  <p className="text-xs text-text-muted">
                    Conta •••• (simulação)
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">País</span>
                  <span className="text-on-surface font-medium">
                    {remittance.targetCurrency === 'USD'
                      ? 'Estados Unidos'
                      : remittance.targetCurrency === 'EUR'
                        ? 'Zona Euro'
                        : remittance.targetCurrency === 'GBP'
                          ? 'Reino Unido'
                          : 'Internacional'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Moeda</span>
                  <span className="text-on-surface font-medium">
                    {remittance.targetCurrency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Método</span>
                  <span className="text-on-surface font-medium">
                    SWIFT Transfer
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline Card */}
            <div
              className="bg-surface border border-border rounded-2xl p-6"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
                Histórico
              </h3>

              <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-primary-container rounded-full" />
                    <div className="w-0.5 flex-1 bg-border mt-1" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Simulação criada
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatDate(remittance.createdAt)}
                    </p>
                  </div>
                </div>

                {remittance.status !== 'PENDING' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-primary-container rounded-full" />
                      <div className="w-0.5 flex-1 bg-border mt-1" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        {remittance.status === 'CANCELLED'
                          ? 'Simulação cancelada'
                          : remittance.status === 'FAILED'
                            ? 'Processamento falhou'
                            : 'Em processamento'}
                      </p>
                      <p className="text-xs text-text-muted">
                        {formatDate(remittance.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {remittance.status === 'COMPLETED' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-primary-container rounded-full" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        Transferência concluída
                      </p>
                      <p className="text-xs text-text-muted">
                        {formatDate(remittance.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Aprender Mais */}
            <div className="bg-primary rounded-2xl p-6 text-on-primary">
              <h3 className="font-heading font-bold text-lg mb-2">
                Quer aprender mais?
              </h3>
              <p className="text-sm opacity-90 mb-4">
                Explore nosso glossário para entender cada conceito por trás da
                sua simulação.
              </p>
              <Link
                to="/glossary"
                className="inline-block px-5 py-2.5 bg-on-primary text-primary font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity"
              >
                Abrir Glossário
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
