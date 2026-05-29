import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Navbar } from '@/components/layout';
import { Footer } from '@/components/layout';
import type { Explanation } from '@/types';

export function Glossary(): React.JSX.Element {
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        const [expRes, catRes] = await Promise.all([
          api.get<Explanation[]>('/explanation'),
          api.get<string[]>('/explanation/categories'),
        ]);

        if (expRes.success && expRes.data) {
          setExplanations(expRes.data);
        }
        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const categoryLabels: Record<string, string> = {
    todos: 'Todos',
    cambio: 'Câmbio',
    taxas: 'Taxas',
    transferencia: 'Transferências',
    status: 'Status',
  };

  const categoryColors: Record<string, string> = {
    cambio: 'bg-primary-container/20 text-primary',
    taxas: 'bg-tertiary/10 text-tertiary',
    transferencia: 'bg-secondary/10 text-secondary',
    status: 'bg-accent/10 text-amber-700',
  };

  const filtered = explanations.filter((e) => {
    const matchesCategory =
      activeCategory === 'todos' || e.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const learnedCount = explanations.length;
  const totalCount = explanations.length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-300 mx-auto w-full px-5 md:px-10 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-secondary">
            Dicionário Financeiro
          </h1>
          <p className="text-text-muted mt-2">
            Finanças sem enrolação. Aprenda os termos que você precisa saber
            para cuidar do seu dinheiro com a simplicidade que você merece.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div
            className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3 max-w-xl focus-within:ring-2 focus-within:ring-primary-container transition-all"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <span className="text-text-muted text-lg">🔍</span>
            <input
              type="text"
              placeholder='Pesquise por termos como "IOF", "SWIFT"...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-on-surface placeholder:text-text-muted focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Categorias
            </h3>
            <div className="flex flex-row lg:flex-col gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory('todos')}
                className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors cursor-pointer text-left ${
                  activeCategory === 'todos'
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-text-muted hover:bg-surface-container'
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors cursor-pointer text-left ${
                    activeCategory === cat
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-text-muted hover:bg-surface-container'
                  }`}
                >
                  {categoryLabels[cat] || cat}
                </button>
              ))}

              {/* Learning Progress */}
              <div
                className="mt-4 p-4 bg-surface border border-border rounded-xl hidden lg:block"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <h4 className="text-sm font-semibold text-on-surface mb-2">
                  Sua jornada
                </h4>
                <div className="w-full bg-surface-container rounded-full h-2 mb-2">
                  <div
                    className="bg-primary-container h-2 rounded-full transition-all"
                    style={{
                      width: `${(learnedCount / Math.max(totalCount, 1)) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-text-muted">
                  {learnedCount} de {totalCount} termos explorados
                </p>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12 text-text-muted">
                Carregando...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-muted text-lg">
                  Nenhum termo encontrado.
                </p>
                <p className="text-text-muted text-sm mt-1">
                  Tente buscar por outro termo ou categoria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface border border-border rounded-2xl p-6 hover:border-primary-container/50 transition-all group"
                    style={{ boxShadow: 'var(--shadow-card)' }}
                  >
                    {/* Category Badge */}
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full mb-3 ${categoryColors[item.category] || 'bg-surface-container text-text-muted'}`}
                    >
                      {categoryLabels[item.category] || item.category}
                    </span>

                    {/* Title */}
                    <h3 className="font-heading font-bold text-on-surface text-lg mb-2">
                      {item.key.toUpperCase().replace(/-/g, ' ')}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-text-muted leading-relaxed mb-4 line-clamp-3">
                      {item.description}
                    </p>

                    {/* Example or Action */}
                    {item.example && (
                      <p className="text-sm text-primary font-semibold group-hover:underline cursor-pointer">
                        O que é isso na prática? →
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-surface-container border border-border rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-14 h-14 bg-primary-container/20 rounded-full flex items-center justify-center shrink-0">
            <span className="text-2xl">💬</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-heading font-bold text-on-surface text-lg">
              Ainda com dúvidas?
            </h3>
            <p className="text-sm text-text-muted mt-1">
              Nossa equipe de especialistas está pronta para explicar qualquer
              termo de forma simples e direta. Sem economês.
            </p>
          </div>

          <a
            href="https://github.com/pecinallib/soizi"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 bg-primary-container text-on-primary-container font-bold text-sm rounded-xl hover:brightness-110 transition-all cursor-pointer shrink-0"
          >
            Ver no GitHub 📎
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
