import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';
import { Card, Button, ExplanationTrigger } from '@/components/ui';
import { Navbar } from '@/components/layout';
import { Footer } from '@/components/layout';
import type { Remittance, PaginatedResponse } from '@/types';

export function Dashboard(): React.JSX.Element {
  const { user } = useAuth();
  const [remittances, setRemittances] = useState<Remittance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRemittances = async (): Promise<void> => {
      try {
        const response = await api.get<PaginatedResponse<Remittance>>(
          '/remittance?limit=5',
        );
        if (response.success && response.data) {
          setRemittances(response.data.remittances);
        }
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    };

    loadRemittances();
  }, []);

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-emerald-100 text-emerald-800',
    FAILED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  };

  const statusLabels: Record<string, string> = {
    PENDING: 'Pendente',
    PROCESSING: 'Processando',
    COMPLETED: 'Concluída',
    FAILED: 'Falhou',
    CANCELLED: 'Cancelada',
  };

  const greeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-300 mx-auto w-full px-5 md:px-10 py-8">
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/converter">
            <Card className="hover:border-primary-container transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-container/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">💱</span>
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface">Conversor</h3>
                  <p className="text-sm text-text-muted">
                    Simule conversões em tempo real
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/simulator">
            <Card className="hover:border-primary-container transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-container/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🌍</span>
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface">
                    Simular Envio
                  </h3>
                  <p className="text-sm text-text-muted">
                    Aprenda como funciona uma remessa
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/glossary">
            <Card className="hover:border-primary-container transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-tertiary/10 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📚</span>
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface">Glossário</h3>
                  <p className="text-sm text-text-muted">
                    Aprenda termos financeiros
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Simulations */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-bold text-on-surface">
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
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-text-muted">
              Carregando...
            </div>
          ) : remittances.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-muted mb-4">
                Você ainda não fez nenhuma simulação.
              </p>
              <Link to="/simulator">
                <Button variant="outlined" size="sm">
                  Fazer primeira simulação
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 text-sm font-semibold text-text-muted">
                      De → Para
                    </th>
                    <th className="pb-3 text-sm font-semibold text-text-muted">
                      Valor Enviado
                    </th>
                    <th className="pb-3 text-sm font-semibold text-text-muted">
                      Valor Recebido
                    </th>
                    <th className="pb-3 text-sm font-semibold text-text-muted">
                      Status
                    </th>
                    <th className="pb-3 text-sm font-semibold text-text-muted">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {remittances.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-border/50 last:border-none"
                    >
                      <td className="py-4 text-sm text-on-surface font-medium">
                        <Link
                          to={`/simulation/${r.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {r.originCurrency} → {r.targetCurrency}
                        </Link>
                      </td>
                      <td className="py-4 text-sm tabular-nums text-on-surface">
                        {r.originCurrency}{' '}
                        {Number(r.originAmount).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-4 text-sm tabular-nums text-on-surface">
                        {r.targetCurrency}{' '}
                        {Number(r.targetAmount).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[r.status] || 'bg-gray-100 text-gray-800'}`}
                        >
                          {statusLabels[r.status] || r.status}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-text-muted">
                        {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
}
