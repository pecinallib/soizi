import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' });
const prisma = new PrismaClient({ adapter });

const explanations = [
  {
    key: 'taxa-cambio',
    title: 'O que é taxa de câmbio?',
    description:
      'A taxa de câmbio indica quanto uma moeda vale em relação a outra. Ela flutua constantemente baseada na oferta e demanda do mercado global. Quando você vê USD/BRL = 5.20, significa que 1 dólar americano custa R$5,20.',
    example:
      'Se a taxa USD/BRL é 5.20 e você quer comprar $100, precisará de R$520,00 (sem contar taxas adicionais).',
    category: 'cambio',
    order: 1,
  },
  {
    key: 'spread',
    title: 'O que é spread?',
    description:
      'Spread é a diferença entre a taxa de câmbio real (do mercado) e a taxa que a instituição financeira te oferece. É assim que bancos e corretoras lucram com operações de câmbio. Quanto menor o spread, melhor pra você.',
    example:
      'Taxa do mercado: 5.20. Taxa oferecida: 5.12 (spread de 1.5%). Em R$1.000, você paga R$15 de spread.',
    category: 'cambio',
    order: 2,
  },
  {
    key: 'taxa-fixa',
    title: 'O que é a taxa fixa?',
    description:
      'A taxa fixa é um valor cobrado por operação, independente do montante enviado. Ela cobre custos operacionais como processamento, comunicação entre bancos e compliance.',
    example: 'Taxa fixa de R$5,00: se você enviar R$100 ou R$10.000, a taxa é sempre R$5,00.',
    category: 'taxas',
    order: 1,
  },
  {
    key: 'remessa',
    title: 'O que é uma remessa internacional?',
    description:
      'Remessa internacional é o envio de dinheiro de um país para outro. Envolve a conversão de moedas e a transferência entre sistemas bancários diferentes. O dinheiro passa por intermediários até chegar ao destino.',
    example:
      'Você envia R$1.000 do Brasil para alguém nos EUA. O banco converte para dólares e transfere via rede SWIFT para o banco americano.',
    category: 'transferencia',
    order: 1,
  },
  {
    key: 'swift',
    title: 'O que é SWIFT?',
    description:
      'SWIFT (Society for Worldwide Interbank Financial Telecommunication) é a rede de comunicação usada por bancos em todo o mundo para enviar e receber informações sobre transações financeiras. Não é um sistema de pagamento em si, mas um canal seguro de mensagens entre bancos.',
    example:
      'Quando você faz uma remessa, seu banco envia uma mensagem SWIFT para o banco de destino com os detalhes da transferência. Cada banco tem um código SWIFT único (ex: BRASBRRJXXX).',
    category: 'transferencia',
    order: 2,
  },
  {
    key: 'iot',
    title: 'O que é IOF?',
    description:
      'IOF (Imposto sobre Operações Financeiras) é um imposto federal brasileiro cobrado em operações de câmbio, crédito, seguros e títulos. Em remessas internacionais, a alíquota varia de 0.38% a 1.1% dependendo do tipo de operação.',
    example:
      'Enviando R$1.000 com IOF de 0.38%: o imposto é R$3,80. Para compras no cartão de crédito internacional, o IOF é 4.38%.',
    category: 'taxas',
    order: 2,
  },
  {
    key: 'moeda-base',
    title: 'O que é moeda base?',
    description:
      'Moeda base é a primeira moeda em um par de câmbio. No par USD/BRL, o dólar (USD) é a moeda base e o real (BRL) é a moeda cotada. A taxa indica quantas unidades da moeda cotada são necessárias para comprar uma unidade da moeda base.',
    example:
      'USD/BRL = 5.20 → 1 USD (base) = 5.20 BRL (cotada). EUR/USD = 1.08 → 1 EUR (base) = 1.08 USD (cotada).',
    category: 'cambio',
    order: 3,
  },
  {
    key: 'status-pending',
    title: 'O que significa status PENDING?',
    description:
      'PENDING (pendente) significa que a remessa foi criada mas ainda não começou a ser processada. Nesse estágio, é possível cancelar a operação sem custos. Assim que o processamento inicia, o status muda para PROCESSING.',
    example:
      'Você criou uma remessa de R$1.000 para USD. Enquanto está PENDING, pode revisar os detalhes e cancelar se necessário.',
    category: 'status',
    order: 1,
  },
  {
    key: 'status-processing',
    title: 'O que significa status PROCESSING?',
    description:
      'PROCESSING (processando) significa que o dinheiro está em trânsito. A conversão de moeda foi realizada e os fundos estão sendo transferidos entre os bancos. Nesse estágio, não é possível cancelar.',
    example:
      'Sua remessa saiu do banco brasileiro e está a caminho do banco americano via rede SWIFT. Tempo estimado: 1-3 dias úteis.',
    category: 'status',
    order: 2,
  },
  {
    key: 'status-completed',
    title: 'O que significa status COMPLETED?',
    description:
      'COMPLETED (concluída) significa que o dinheiro chegou ao destino com sucesso. O beneficiário já pode acessar os fundos na conta de destino.',
    example:
      'Sua remessa de R$1.000 foi convertida para $195,31 e depositada na conta do beneficiário nos EUA.',
    category: 'status',
    order: 3,
  },
];

async function main(): Promise<void> {
  console.warn('🌱 Populando explicações do SoIzi Method...');

  for (const explanation of explanations) {
    await prisma.explanation.upsert({
      where: { key: explanation.key },
      update: explanation,
      create: explanation,
    });

    console.warn(`  ✅ ${explanation.key}`);
  }

  console.warn(`\n🎉 ${explanations.length} explicações criadas/atualizadas!`);
}

main()
  .catch((error) => {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
