import { useState, useEffect } from 'react';
import { Footer, Navbar } from '@/components/layout';
import { Link } from 'react-router-dom';
import {
  FEATURES,
  STEPS,
  CURRENCIES,
  SIMULATOR_STEPS,
  SOIZI_METHOD_TERMS,
  GAMIFICATION_CARDS,
  MARQUEE_IMAGES,
  API_HIGHLIGHTS,
  FAQ,
  TESTIMONIALS,
} from '@/data/landing';

export function Landing(): React.JSX.Element {
  const [liveRates, setLiveRates] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/exchange/preview')
      .then((res) => res.json())
      .then((data: { success: boolean; data: Record<string, string> }) => {
        if (data.success) setLiveRates(data.data);
      })
      .catch(() => {});
  }, []);

  const getRate = (code: string, fallback: string): string =>
    liveRates[code] ?? fallback;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ── Hero ── */}
      <section className="max-w-300 mx-auto w-full px-5 md:px-10 py-16 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-primary-container/20 text-primary rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-pulse" />
              Simulador Educativo Gratuito
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-secondary leading-tight">
              Aprenda como funciona{' '}
              <span className="text-primary">enviar dinheiro</span> para o
              exterior.
            </h1>
            <p className="text-text-muted text-lg mt-6 leading-relaxed">
              Sabemos que o Brasileiro tem o seu jeitinho de fazer as coisas.
              Nós da <span className="text-primary font-semibold">SoIzi</span>{' '}
              temos o nosso jeitinho de descomplicar transferências
              internacionais, com taxas reais, simulações passo a passo e zero
              burocracia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link
                to="/register"
                className="px-8 py-4 bg-primary-container text-on-primary-container font-bold text-base rounded-xl hover:brightness-110 active:brightness-95 transition-all text-center"
              >
                Criar conta grátis
              </Link>
              <a
                href="#como-funciona"
                className="px-8 py-4 border-2 border-border text-on-surface font-bold text-base rounded-xl hover:bg-surface-container transition-all text-center"
              >
                Ver como funciona
              </a>
            </div>

            <div className="flex items-center gap-4 mt-10">
              <div className="flex -space-x-3">
                {['M', 'C', 'A', 'R'].map((letter, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-surface flex items-center justify-center text-xs font-bold text-on-primary"
                    style={{
                      backgroundColor: [
                        '#00D084',
                        '#1E293B',
                        '#3B82F6',
                        '#f59e0b',
                      ][i],
                      zIndex: 4 - i,
                    }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <p className="text-sm text-text-muted">
                <span className="text-on-surface font-semibold">
                  +500 pessoas
                </span>{' '}
                já aprenderam com o SoIzi
              </p>
            </div>
          </div>

          {/* Hero Card */}
          <div
            className="bg-surface border border-border rounded-2xl p-6 md:p-8"
            style={{ boxShadow: 'var(--shadow-modal)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <img
                  src="/lp/icons/cash-flow.png"
                  alt=""
                  className="w-5 h-5 object-contain"
                />
                <h3 className="font-heading font-bold text-on-surface">
                  Simulação rápida
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 bg-primary-container/20 text-primary rounded-full font-semibold">
                Taxa ao vivo
              </span>
            </div>

            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="text-xs text-text-muted mb-1 block">
                  Você envia
                </label>
                <div className="flex items-center justify-between border border-border rounded-xl px-4 py-3">
                  <span className="text-xl font-bold text-on-surface tabular-nums">
                    1.000,00
                  </span>
                  <span className="flex items-center gap-2 bg-surface-container rounded-lg px-3 py-1.5 text-sm font-semibold text-on-surface">
                    <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-on-primary text-xs font-bold">
                      B
                    </span>
                    BRL
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-8 h-8 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container text-sm">
                  ⇅
                </div>
              </div>

              <div>
                <label className="text-xs text-text-muted mb-1 block">
                  Destinatário recebe
                </label>
                <div className="flex items-center justify-between border border-border rounded-xl px-4 py-3 bg-surface-container-low">
                  <span className="text-xl font-bold text-on-surface tabular-nums">
                    184,52
                  </span>
                  <span className="flex items-center gap-2 bg-surface-container rounded-lg px-3 py-1.5 text-sm font-semibold text-on-surface">
                    <span className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center text-on-secondary text-xs font-bold">
                      U
                    </span>
                    USD
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-border pt-4 flex flex-col gap-2 mb-4">
              {[
                { label: 'Taxa bancária', value: 'R$ 5,00' },
                { label: 'Spread', value: '1,5%' },
                { label: 'IOF', value: '0,38%' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-text-muted flex items-center gap-1">
                    {row.label}
                    <span className="w-4 h-4 rounded-full bg-tertiary/20 text-tertiary text-xs flex items-center justify-center font-bold cursor-help">
                      ?
                    </span>
                  </span>
                  <span className="text-on-surface tabular-nums">
                    {row.value}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold border-t border-border pt-2 mt-1">
                <span className="text-on-surface">Custo total</span>
                <span className="text-primary tabular-nums">R$ 1.020,00</span>
              </div>
            </div>

            <div className="bg-tertiary/10 rounded-xl p-3 mb-4 flex items-start gap-2">
              <img
                src="/lp/icons/ideia.png"
                alt=""
                className="w-4 h-4 object-contain mt-0.5 shrink-0"
              />
              <p className="text-xs text-on-surface-variant leading-relaxed">
                <strong className="text-tertiary">SoIzi Method:</strong> Cada
                custo tem um botão "?" que explica o que é e por que você está
                pagando.
              </p>
            </div>

            <Link
              to="/register"
              className="block w-full py-3.5 bg-primary-container text-on-primary-container font-bold text-base rounded-xl hover:brightness-110 active:brightness-95 transition-all text-center"
            >
              Criar conta e simular grátis
            </Link>
            <p className="text-center text-xs text-text-muted mt-3">
              🎓 Simulação educativa, nenhum dinheiro real é movimentado
            </p>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <section className="border-y border-border relative overflow-hidden h-44">
        {/* Fade esquerda */}
        <div className="absolute inset-y-0 left-0 w-32 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
        {/* Fade direita */}
        <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Track — duplicado para loop imperceptível */}
        <div className="flex h-full animate-marquee">
          {[...MARQUEE_IMAGES, ...MARQUEE_IMAGES].map((img, idx) => (
            <div key={idx} className="relative h-full w-72 shrink-0">
              <img
                src={img.src}
                alt={img.alt}
                className="h-full w-full object-cover"
              />
              {/* Sombra esquerda da imagem */}
              <div className="absolute inset-y-0 left-0 w-10 bg-linear-to-r from-black/60 to-transparent pointer-events-none" />
              {/* Sombra direita da imagem */}
              <div className="absolute inset-y-0 right-0 w-10 bg-linear-to-l from-black/60 to-transparent pointer-events-none" />
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-surface-container-low border-b border-border">
        <div className="max-w-300 mx-auto w-full px-5 md:px-10 py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-secondary">
              Tudo que você precisa pra entender remessas
            </h2>
            <p className="text-text-muted mt-3 max-w-xl mx-auto">
              Ferramentas educativas que transformam conceitos financeiros
              complexos em conhecimento prático.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary-container/50 transition-all group"
                style={{
                  boxShadow:
                    '0 4px 20px rgba(11,28,48,0.10), 0 1px 4px rgba(11,28,48,0.06)',
                }}
              >
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-surface to-transparent" />
                  <span className="absolute top-3 right-3 text-xs px-2.5 py-1 bg-surface/90 text-text-muted rounded-full font-medium backdrop-blur-sm">
                    {feature.badge}
                  </span>
                </div>
                <div
                  className="p-6"
                  style={{
                    boxShadow: 'inset 0 4px 12px rgba(11,28,48,0.05)',
                  }}
                >
                  <h3 className="font-heading font-bold text-on-surface mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Simulador — preview das etapas ── */}
      <section className="max-w-300 mx-auto w-full px-5 md:px-10 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-secondary mb-4">
              Uma transferência completa, passo a passo
            </h2>
            <p className="text-text-muted leading-relaxed mb-4">
              O simulador do SoIzi foi pensado para replicar o fluxo real de uma
              remessa internacional. Em 4 etapas você entende exatamente o que
              acontece quando alguém envia dinheiro para outro país, e quanto
              isso custa de verdade.
            </p>
            <p className="text-text-muted leading-relaxed mb-8">
              Nenhuma informação bancária é necessária. Você usa seus{' '}
              <span className="text-primary font-semibold">
                R$50.000 em créditos educativos
              </span>{' '}
              pra simular quantas vezes quiser.
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-primary-container text-on-primary-container font-bold text-base rounded-xl hover:brightness-110 transition-all"
            >
              Começar a simular
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {SIMULATOR_STEPS.map((item, idx) => (
              <div
                key={item.step}
                className="flex items-center gap-4 bg-surface border border-border rounded-2xl p-5"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 p-2.5 ${idx === 0 ? 'bg-primary-container/30' : 'bg-surface-container'}`}
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-primary-container">
                      Etapa {item.step}
                    </span>
                    <span className="font-heading font-bold text-on-surface text-sm">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">{item.description}</p>
                </div>
                {idx === 0 && (
                  <span className="text-xs px-2 py-0.5 bg-primary-container/20 text-primary rounded-full font-semibold shrink-0">
                    Início
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── API de câmbio real ── */}
      <section
        className="relative overflow-hidden"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.35), 0 -8px 40px rgba(0,0,0,0.2)' }}
      >
        <img
          src="/lp/banner/cambio.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-secondary/75" />
        <div className="max-w-300 mx-auto w-full px-5 md:px-10 py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-3">
              {CURRENCIES.map((currency) => (
                <div
                  key={currency.code}
                  className="bg-black/30 border border-white/10 rounded-xl p-4 flex items-center gap-3 backdrop-blur-sm relative overflow-hidden group cursor-default"
                >
                  {/* Painel de hover — desliza da esquerda para direita */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out bg-primary-container flex flex-col items-center justify-center gap-0.5 rounded-xl">
                    <span className="text-xs text-on-primary-container/70 font-medium">
                      1 {currency.code} =
                    </span>
                    <span className="font-heading font-bold text-on-primary-container text-2xl tabular-nums">
                      R$ {getRate(currency.code, currency.rate)}
                    </span>
                    <span className="text-xs text-on-primary-container/70 font-medium">
                      Real Brasileiro
                    </span>
                  </div>

                  <img
                    src={currency.flag}
                    alt={currency.code}
                    className="w-8 h-8 object-cover rounded-md shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-white text-sm">
                        {currency.code}
                      </span>
                      <span className="text-xs text-white/70 tabular-nums">
                        R$ {getRate(currency.code, currency.rate)}
                      </span>
                    </div>
                    <p className="text-xs text-white/85 truncate">
                      {currency.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-black/25 backdrop-blur-sm rounded-2xl p-6 md:p-8">
              <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary-container/40 text-primary-container rounded-full mb-4">
                Taxas em tempo real
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
                Dados reais de câmbio integrados via API
              </h2>
              <p className="text-white/90 leading-relaxed mb-4">
                As taxas de câmbio exibidas no SoIzi vêm de uma API externa em
                tempo real. Isso significa que as simulações refletem o mercado
                atual, a mesma base que bancos e fintechs usam.
              </p>
              <p className="text-white/90 leading-relaxed mb-8">
                O sistema usa cache inteligente de 5 minutos via Redis,
                garantindo respostas rápidas sem sobrecarregar a fonte dos
                dados. Você aprende com valores verdadeiros.
              </p>
              <div className="flex flex-col gap-3">
                {API_HIGHLIGHTS.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-xs shrink-0">
                      ✓
                    </span>
                    <span className="text-white text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SoIzi Method ── */}
      <section className="max-w-300 mx-auto w-full px-5 md:px-10 py-16 md:py-24">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-tertiary/10 text-tertiary rounded-full mb-4">
            Nosso diferencial
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-secondary">
            O SoIzi Method
          </h2>
          <p className="text-text-muted mt-3 max-w-2xl mx-auto">
            Cada conceito financeiro tem um botão{' '}
            <strong>"O que é isso?"</strong>. Clicou, aparece uma explicação
            simples, sem economês, com exemplo do dia a dia. É o nosso jeito de
            garantir que você entenda, não só veja.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SOIZI_METHOD_TERMS.map((item) => (
            <div
              key={item.term}
              className={`border-2 rounded-2xl p-6 ${item.color}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-bold text-on-surface text-lg">
                  {item.term}
                </h3>
                <button className="w-7 h-7 rounded-full bg-tertiary/20 text-tertiary text-sm font-bold flex items-center justify-center hover:bg-tertiary/30 transition-colors">
                  ?
                </button>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
                {item.short}
              </p>
              <div className="bg-surface rounded-xl p-3 border border-border">
                <p className="text-xs text-text-muted leading-relaxed">
                  {item.example}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Gamificação (em breve) ── */}
      <section className="bg-surface-container-low border-y border-border">
        <div className="max-w-300 mx-auto w-full px-5 md:px-10 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-semibold bg-accent/20 text-accent rounded-full mb-4">
                Em breve
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-secondary mb-4">
                Aprenda jogando
              </h2>
              <p className="text-text-muted leading-relaxed mb-4">
                Estamos construindo um sistema completo de gamificação para
                tornar o aprendizado ainda mais envolvente. Créditos educativos,
                badges de conquista, streaks diários e muito mais.
              </p>
              <p className="text-text-muted leading-relaxed">
                Quanto mais você explora o SoIzi, mais você aprende, e mais
                recompensas você conquista.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {GAMIFICATION_CARDS.map((item) => (
                <div
                  key={item.title}
                  className={`border rounded-2xl p-5 ${item.color}`}
                  style={{ boxShadow: 'var(--shadow-card)' }}
                >
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="w-8 h-8 object-contain mb-3"
                  />
                  <h3 className="font-heading font-bold text-on-surface text-sm mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section
        id="como-funciona"
        className="max-w-300 mx-auto w-full px-5 md:px-10 py-16 md:py-24"
      >
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary-container/20 text-primary rounded-full mb-4">
            Primeiros passos
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-secondary">
            Como funciona?
          </h2>
          <p className="text-text-muted mt-3">
            4 passos simples pra começar a aprender agora.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-0">
          {STEPS.map((step, idx) => (
            <div key={step.number} className="contents">
              <div className="flex-1 min-w-0">
                <div className="relative mb-4 w-fit">
                  <div
                    className="w-14 h-14 bg-surface border-2 border-primary-container/40 rounded-2xl flex items-center justify-center p-3"
                    style={{ boxShadow: 'var(--shadow-card)' }}
                  >
                    <img
                      src={step.icon}
                      alt={step.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="absolute -top-2 -right-6 text-4xl font-heading font-bold text-primary-container/25 leading-none pointer-events-none select-none">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-on-surface mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="hidden lg:flex items-start shrink-0 px-4 pt-7">
                  <div className="w-8 border-t-2 border-dashed border-border" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section
        className="relative overflow-hidden"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.35), 0 -8px 40px rgba(0,0,0,0.2)' }}
      >
        <img
          src="/lp/banner/aprendeusoizi.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-secondary/75" />
        <div className="max-w-300 mx-auto w-full px-5 md:px-10 py-16 md:py-24 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-on-secondary">
              Quem já aprendeu com o SoIzi
            </h2>
            <p className="text-on-secondary/60 mt-3">
              Histórias reais de quem deixou o medo de remessas internacionais
              pra trás.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-on-secondary/10 backdrop-blur-sm rounded-2xl p-6 border border-on-secondary/10 flex flex-col"
              >
                <div className="flex mb-3 gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-accent text-sm">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-on-secondary/90 text-sm leading-relaxed italic mb-6 flex-1">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container text-sm font-bold shrink-0">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-on-secondary/90 text-sm font-semibold">
                      {testimonial.name}
                    </p>
                    <p className="text-on-secondary/50 text-xs">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-300 mx-auto w-full px-5 md:px-10 py-16 md:py-24">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-surface-container text-text-muted rounded-full mb-4">
            Dúvidas frequentes
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-secondary">
            Perguntas & Respostas
          </h2>
        </div>

        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {FAQ.map((item) => (
            <div
              key={item.q}
              className="bg-surface border border-border rounded-2xl p-6"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <h3 className="font-heading font-bold text-on-surface mb-2 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-container/20 text-primary text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                  ?
                </span>
                {item.q}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed pl-9">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-300 mx-auto w-full px-5 md:px-10 pb-16 md:pb-24">
        <div
          className="rounded-3xl text-center text-on-primary relative overflow-hidden"
          style={{ boxShadow: '0 12px 48px rgba(0,0,0,0.35)' }}
        >
          <img
            src="/lp/banner/descomplica.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/70" />
          <div className="relative z-10 p-8 md:p-16">
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
              Pronto pra descomplicar?
            </h2>
            <p className="text-lg opacity-90 max-w-xl mx-auto mb-8 leading-relaxed">
              Crie sua conta gratuita, receba{' '}
              <strong>R$50.000 em créditos educativos</strong> e comece a
              simular transferências internacionais com taxas reais agora.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-10 py-4 bg-on-primary text-primary font-bold text-lg rounded-xl hover:opacity-90 transition-opacity"
              >
                Criar conta grátis
              </Link>
              <Link
                to="/login"
                className="px-10 py-4 bg-transparent border-2 border-on-primary/40 text-on-primary font-bold text-lg rounded-xl hover:bg-on-primary/10 transition-all"
              >
                Já tenho conta
              </Link>
            </div>
            <p className="text-sm opacity-60 mt-6">
              Sem cartão de crédito · Sem dados bancários · 100% educativo
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
