export const FEATURES = [
  {
    title: 'Câmbio em Tempo Real',
    description:
      'Taxas reais integradas via API. Simule conversões com spread, IOF e tarifas bancárias exatos do momento.',
    badge: 'API ao vivo',
    image: '/lp/cambio-card.png',
  },
  {
    title: 'SoIzi Method',
    description:
      'Botão "O que é isso?" em cada conceito. Explicações simples, sem economês, com exemplos práticos do dia a dia.',
    badge: 'Exclusivo',
    image: '/lp/metodo-card.png',
  },
  {
    title: 'Simulador Completo',
    description:
      'Simule uma transferência internacional passo a passo: escolha a moeda, o destinatário, revise os custos e confirme.',
    badge: '4 etapas',
    image: '/lp/simulador-card.png',
  },
  {
    title: 'Aprendizado Gamificado',
    description:
      'Créditos educativos, badges de conquista, streaks diários e progresso visual. Aprender nunca foi tão divertido.',
    badge: 'Em breve',
    image: '/lp/games-card.png',
  },
  {
    title: 'Gráficos de Variação',
    description:
      'Acompanhe a variação histórica das moedas com gráficos interativos. Entenda como o câmbio flutua e impacta o envio.',
    badge: 'Interativo',
    image: '/lp/graficos-card.png',
  },
  {
    title: 'Glossário Financeiro',
    description:
      'Mais de 10 termos explicados com linguagem simples e exemplos reais. Spread, IOF, SWIFT, câmbio comercial e muito mais.',
    badge: '+10 termos',
    image: '/lp/glossario-card.png',
  },
] as const;

export const STEPS = [
  {
    number: '01',
    icon: '/lp/icons/pessoa.png',
    title: 'Crie sua conta gratuita',
    description:
      'Cadastro em segundos, sem dados bancários, sem burocracia. Só nome, e-mail e senha.',
  },
  {
    number: '02',
    icon: '/lp/icons/money.png',
    title: 'Receba R$50.000 em créditos',
    description:
      'Dinheiro fictício pra você simular à vontade. Fica bem claro que é educativo, nenhum centavo real é movimentado.',
  },
  {
    number: '03',
    icon: '/lp/icons/travel.png',
    title: 'Simule transferências reais',
    description:
      'Escolha moeda, valor e destino. O sistema calcula spread, IOF e tarifas com taxas reais de mercado via API.',
  },
  {
    number: '04',
    icon: '/lp/icons/aprender.png',
    title: 'Entenda cada conceito',
    description:
      'Em cada etapa, o SoIzi Method explica o que está acontecendo. Você sai sabendo o porquê de cada custo.',
  },
] as const;

export const CURRENCIES = [
  { code: 'USD', name: 'Dólar Americano', flag: '/lp/flags/eua.png', rate: '5,42' },
  { code: 'EUR', name: 'Euro', flag: '/lp/flags/eur.png', rate: '5,89' },
  { code: 'GBP', name: 'Libra Esterlina', flag: '/lp/flags/gbp.png', rate: '6,87' },
  { code: 'JPY', name: 'Iene Japonês', flag: '/lp/flags/jpy.png', rate: '0,036' },
  { code: 'CAD', name: 'Dólar Canadense', flag: '/lp/flags/cad.png', rate: '3,91' },
  { code: 'AUD', name: 'Dólar Australiano', flag: '/lp/flags/aud.png', rate: '3,44' },
  { code: 'CHF', name: 'Franco Suíço', flag: '/lp/flags/chf.png', rate: '6,13' },
  { code: 'ARS', name: 'Peso Argentino', flag: '/lp/flags/ars.png', rate: '0,005' },
] as const;

export const SIMULATOR_STEPS = [
  {
    step: 1,
    label: 'Valor & Moeda',
    description: 'Quanto você quer enviar e para qual moeda',
    icon: '/lp/icons/cash-flow.png',
  },
  {
    step: 2,
    label: 'Destinatário',
    description: 'Nome e país de quem vai receber',
    icon: '/lp/icons/pessoa.png',
  },
  {
    step: 3,
    label: 'Revisão',
    description: 'Conferir todos os custos antes de confirmar',
    icon: '/lp/icons/interrogation.png',
  },
  {
    step: 4,
    label: 'Resultado',
    description: 'Simulação concluída com timeline completa',
    icon: '/lp/icons/concluido.png',
  },
] as const;

export const SOIZI_METHOD_TERMS = [
  {
    term: 'Spread',
    short: 'A diferença entre a taxa que o banco compra e vende a moeda.',
    example:
      'Ex.: O dólar está R$5,40 no mercado, mas você paga R$5,54. Os R$0,14 a mais são o spread do banco.',
    color: 'border-primary-container/40 bg-primary-container/5',
  },
  {
    term: 'IOF',
    short: 'Imposto sobre Operações Financeiras cobrado pelo governo.',
    example:
      'Ex.: Numa remessa de R$1.000, o IOF de 0,38% adiciona R$3,80 ao custo total da operação.',
    color: 'border-tertiary/30 bg-tertiary/5',
  },
  {
    term: 'SWIFT',
    short: 'Sistema global de mensagens bancárias para transferências internacionais.',
    example:
      'Ex.: Para enviar dinheiro ao exterior, seu banco usa o código SWIFT do banco destinatário como um endereço.',
    color: 'border-accent/30 bg-accent/5',
  },
] as const;

export const GAMIFICATION_CARDS = [
  {
    icon: '/lp/icons/money.png',
    title: 'R$50.000 em créditos',
    description:
      'Ao criar sua conta, você recebe créditos fictícios pra simular à vontade.',
    color: 'bg-primary-container/10 border-primary-container/30',
  },
  {
    icon: '/lp/icons/conquista.png',
    title: 'Badges de conquista',
    description:
      '"Mestre do Câmbio", "Explorador Global", "Transparência Total" e muito mais.',
    color: 'bg-accent/10 border-accent/30',
  },
  {
    icon: '/lp/icons/flame.png',
    title: 'Streaks diários',
    description:
      'Volte todo dia pra manter sua sequência e desbloquear badges exclusivos.',
    color: 'bg-error/10 border-error/20',
  },
  {
    icon: '/lp/icons/graph.png',
    title: 'Portfolio fictício',
    description:
      'Simule investimentos em moedas estrangeiras e acompanhe seu "desempenho".',
    color: 'bg-tertiary/10 border-tertiary/20',
  },
] as const;

export const MARQUEE_IMAGES = [
  { src: '/lp/faixa/newyork.jpg', alt: 'Nova York' },
  { src: '/lp/faixa/dolar.jpg', alt: 'Dólar' },
  { src: '/lp/faixa/londres.jpg', alt: 'Londres' },
  { src: '/lp/faixa/bank.jpg', alt: 'Banco' },
  { src: '/lp/faixa/toquio.jpg', alt: 'Tóquio' },
  { src: '/lp/faixa/real.jpg', alt: 'Real Brasileiro' },
  { src: '/lp/faixa/saopaulo.jpg', alt: 'São Paulo' },
  { src: '/lp/faixa/airnpot.jpg', alt: 'Aeroporto' },
  { src: '/lp/faixa/map.jpg', alt: 'Mapa' },
  { src: '/lp/faixa/globo.jpg', alt: 'Globo' },
] as const;

export const STATS = [
  { value: '+30', label: 'Moedas disponíveis' },
  { value: 'Real-time', label: 'Taxas via API' },
  { value: '4 etapas', label: 'Simulador completo' },
  { value: '10+ termos', label: 'Glossário financeiro' },
] as const;

export const API_HIGHLIGHTS = [
  'USD, EUR, GBP, JPY e mais de 30 moedas',
  'Cache Redis de 5 minutos para performance',
  'Cálculo automático de spread, IOF e tarifas',
] as const;

export const FAQ = [
  {
    q: 'O SoIzi movimenta dinheiro real?',
    a: 'Não. O SoIzi é 100% educativo. Você simula com créditos fictícios. Nenhum dado bancário é solicitado e nenhum valor real é movimentado.',
  },
  {
    q: 'De onde vêm as taxas de câmbio?',
    a: 'As taxas são obtidas em tempo real via API de câmbio. Elas refletem o mercado atual e ficam em cache por 5 minutos para garantir precisão sem sobrecarregar a fonte.',
  },
  {
    q: 'Preciso pagar alguma coisa?',
    a: 'Não. O SoIzi é completamente gratuito. É um projeto educativo de portfólio, sem planos pagos ou cobranças.',
  },
  {
    q: 'O que é o SoIzi Method?',
    a: 'É o nosso diferencial: em cada conceito financeiro (spread, IOF, SWIFT etc.), há um botão "O que é isso?" que abre uma explicação simples, sem economês, com exemplo prático.',
  },
  {
    q: 'Quais moedas estão disponíveis?',
    a: 'USD, EUR, GBP, JPY, CAD, AUD, CHF, ARS e outras. A lista é expansível conforme a API de câmbio integrada.',
  },
] as const;

export const TESTIMONIALS = [
  {
    name: 'Maria S.',
    role: 'Estudante de Economia',
    text: 'Finalmente entendi o que é spread e IOF. O SoIzi explica tudo de um jeito que qualquer pessoa entende, sem precisar de curso caro.',
  },
  {
    name: 'Carlos R.',
    role: 'Desenvolvedor',
    text: 'Sempre tive medo de enviar dinheiro pro exterior. Com o SoIzi, simulei várias vezes até me sentir confiante pra fazer a transferência real.',
  },
  {
    name: 'Ana P.',
    role: 'Freelancer',
    text: 'O glossário é incrível. Cada termo financeiro explicado com exemplos práticos. Virou meu dicionário de bolso antes de fechar qualquer contrato internacional.',
  },
] as const;
