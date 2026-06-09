import { prisma } from '../../config/database';
import { ApiError } from '../../utils';
import { ExchangeService } from '../exchange/exchange.service';
import type { BuyCurrencyDTO, SellCurrencyDTO, ForexTransactionsQueryDTO } from './forex.schema';

const exchangeService = new ExchangeService();

const IOF_RATE = 0.0038;
const SPREAD_RATE = 0.015;
const FIXED_FEE = 5.0;

interface ForexResult {
  currency: string;
  amount: string;
  rateBRL: string;
  grossBRL: string;
  iofBRL: string;
  feeBRL: string;
  spreadBRL: string;
  netBRL: string;
  newBalance: string;
  holding: { currency: string; amount: string; avgBuyRateBRL: string };
}

interface HoldingResult {
  currency: string;
  amount: string;
  avgBuyRateBRL: string;
  currentRateBRL: string | null;
  currentValueBRL: string | null;
  pnlBRL: string | null;
  pnlPercent: string | null;
}

export class ForexService {
  async buy(userId: string, data: BuyCurrencyDTO): Promise<ForexResult> {
    const rates = await exchangeService.getRates('BRL');
    const brlPerForeign = rates.rates[data.currency];
    if (!brlPerForeign) throw ApiError.badRequest(`Moeda "${data.currency}" não suportada`);

    // 1 foreign unit = (1/brlPerForeign) BRL — but getRates('BRL') gives BRL per 1 unit?
    // Actually exchangeService.getRates('BRL') returns rates where rates[USD] = how many USD per 1 BRL
    // So to get BRL per 1 USD: 1 / rates['USD']
    const foreignPerBRL = brlPerForeign; // e.g. 0.19 USD per 1 BRL
    const brlPerOne = 1 / foreignPerBRL; // e.g. 5.26 BRL per 1 USD (base rate)

    const spreadBRL = data.amountBRL * SPREAD_RATE;
    const iofBRL = data.amountBRL * IOF_RATE;
    const feeBRL = FIXED_FEE;
    const netAmountBRL = data.amountBRL - spreadBRL; // BRL used for actual conversion after spread
    const foreignAmount = netAmountBRL * foreignPerBRL; // foreign units received
    const totalCost = data.amountBRL + iofBRL + feeBRL;

    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw ApiError.notFound('Carteira não encontrada');
      if (wallet.balance.toNumber() < totalCost) {
        throw ApiError.badRequest(
          `Saldo insuficiente. Necessário: R$${totalCost.toFixed(2)}, disponível: R$${wallet.balance.toFixed(2)}`,
        );
      }

      const newBalance = wallet.balance.toNumber() - totalCost;

      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'FOREX_BUY',
          amount: totalCost,
          balanceBefore: wallet.balance.toNumber(),
          balanceAfter: newBalance,
          description: `Compra de ${foreignAmount.toFixed(6)} ${data.currency} por R$${data.amountBRL.toFixed(2)}`,
        },
      });

      // Upsert holding — average cost calculation
      const existing = await tx.currencyHolding.findUnique({
        where: { userId_currency: { userId, currency: data.currency } },
      });

      let newAvgRate: number;
      let newHoldingAmount: number;

      if (existing) {
        const existingTotal = existing.amount.toNumber() * existing.avgBuyRateBRL.toNumber();
        const newTotal = foreignAmount * brlPerOne;
        newHoldingAmount = existing.amount.toNumber() + foreignAmount;
        newAvgRate = (existingTotal + newTotal) / newHoldingAmount;
      } else {
        newHoldingAmount = foreignAmount;
        newAvgRate = brlPerOne;
      }

      const holding = await tx.currencyHolding.upsert({
        where: { userId_currency: { userId, currency: data.currency } },
        create: { userId, currency: data.currency, amount: foreignAmount, avgBuyRateBRL: brlPerOne },
        update: { amount: newHoldingAmount, avgBuyRateBRL: newAvgRate },
      });

      await tx.currencyTransaction.create({
        data: {
          userId,
          type: 'BUY',
          currency: data.currency,
          amount: foreignAmount,
          rateBRL: brlPerOne,
          grossBRL: data.amountBRL,
          iofBRL,
          feeBRL,
          spreadBRL,
          netBRL: totalCost,
        },
      });

      return {
        currency: data.currency,
        amount: foreignAmount.toFixed(6),
        rateBRL: brlPerOne.toFixed(4),
        grossBRL: data.amountBRL.toFixed(2),
        iofBRL: iofBRL.toFixed(2),
        feeBRL: feeBRL.toFixed(2),
        spreadBRL: spreadBRL.toFixed(2),
        netBRL: totalCost.toFixed(2),
        newBalance: newBalance.toFixed(2),
        holding: {
          currency: holding.currency,
          amount: holding.amount.toFixed(6),
          avgBuyRateBRL: holding.avgBuyRateBRL.toFixed(4),
        },
      };
    });
  }

  async sell(userId: string, data: SellCurrencyDTO): Promise<ForexResult> {
    const rates = await exchangeService.getRates('BRL');
    const foreignPerBRL = rates.rates[data.currency];
    if (!foreignPerBRL) throw ApiError.badRequest(`Moeda "${data.currency}" não suportada`);

    const brlPerOne = 1 / foreignPerBRL;
    const grossBRL = data.amount * brlPerOne;
    const spreadBRL = grossBRL * SPREAD_RATE;
    const netGrossBRL = grossBRL - spreadBRL; // after spread
    const iofBRL = netGrossBRL * IOF_RATE;
    const feeBRL = FIXED_FEE;
    const netBRL = netGrossBRL - iofBRL - feeBRL;

    if (netBRL <= 0) throw ApiError.badRequest('Valor muito baixo para cobrir as taxas');

    return prisma.$transaction(async (tx) => {
      const holding = await tx.currencyHolding.findUnique({
        where: { userId_currency: { userId, currency: data.currency } },
      });

      if (!holding || holding.amount.toNumber() < data.amount) {
        throw ApiError.badRequest(
          `Saldo insuficiente em ${data.currency}. Disponível: ${holding ? holding.amount.toFixed(6) : '0'}`,
        );
      }

      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw ApiError.notFound('Carteira não encontrada');

      const newBalance = wallet.balance.toNumber() + netBRL;
      const newHoldingAmount = holding.amount.toNumber() - data.amount;

      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'FOREX_SELL',
          amount: netBRL,
          balanceBefore: wallet.balance.toNumber(),
          balanceAfter: newBalance,
          description: `Venda de ${data.amount.toFixed(6)} ${data.currency} por R$${netBRL.toFixed(2)}`,
        },
      });

      if (newHoldingAmount <= 0.000001) {
        await tx.currencyHolding.delete({
          where: { userId_currency: { userId, currency: data.currency } },
        });
      } else {
        await tx.currencyHolding.update({
          where: { userId_currency: { userId, currency: data.currency } },
          data: { amount: newHoldingAmount },
        });
      }

      await tx.currencyTransaction.create({
        data: {
          userId,
          type: 'SELL',
          currency: data.currency,
          amount: data.amount,
          rateBRL: brlPerOne,
          grossBRL,
          iofBRL,
          feeBRL,
          spreadBRL,
          netBRL,
        },
      });

      const updatedHolding = newHoldingAmount > 0.000001
        ? { currency: data.currency, amount: newHoldingAmount.toFixed(6), avgBuyRateBRL: holding.avgBuyRateBRL.toFixed(4) }
        : { currency: data.currency, amount: '0', avgBuyRateBRL: '0' };

      return {
        currency: data.currency,
        amount: data.amount.toFixed(6),
        rateBRL: brlPerOne.toFixed(4),
        grossBRL: grossBRL.toFixed(2),
        iofBRL: iofBRL.toFixed(2),
        feeBRL: feeBRL.toFixed(2),
        spreadBRL: spreadBRL.toFixed(2),
        netBRL: netBRL.toFixed(2),
        newBalance: newBalance.toFixed(2),
        holding: updatedHolding,
      };
    });
  }

  async getHoldings(userId: string): Promise<HoldingResult[]> {
    const holdings = await prisma.currencyHolding.findMany({
      where: { userId },
      orderBy: { currency: 'asc' },
    });

    if (holdings.length === 0) return [];

    const rates = await exchangeService.getRates('BRL').catch(() => null);

    return holdings.map((h) => {
      const currentForeignPerBRL = rates?.rates[h.currency];
      const currentBRLPerOne = currentForeignPerBRL ? 1 / currentForeignPerBRL : null;
      const amount = h.amount.toNumber();
      const avgRate = h.avgBuyRateBRL.toNumber();
      const currentValueBRL = currentBRLPerOne ? amount * currentBRLPerOne : null;
      const investedBRL = amount * avgRate;
      const pnlBRL = currentValueBRL !== null ? currentValueBRL - investedBRL : null;
      const pnlPercent = pnlBRL !== null && investedBRL > 0 ? (pnlBRL / investedBRL) * 100 : null;

      return {
        currency: h.currency,
        amount: amount.toFixed(6),
        avgBuyRateBRL: avgRate.toFixed(4),
        currentRateBRL: currentBRLPerOne ? currentBRLPerOne.toFixed(4) : null,
        currentValueBRL: currentValueBRL ? currentValueBRL.toFixed(2) : null,
        pnlBRL: pnlBRL !== null ? pnlBRL.toFixed(2) : null,
        pnlPercent: pnlPercent !== null ? pnlPercent.toFixed(2) : null,
      };
    });
  }

  async getTransactions(userId: string, filters: ForexTransactionsQueryDTO) {
    const where = {
      userId,
      ...(filters.currency ? { currency: filters.currency.toUpperCase() } : {}),
    };

    const skip = (filters.page - 1) * filters.limit;

    const [transactions, total] = await Promise.all([
      prisma.currencyTransaction.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.currencyTransaction.count({ where }),
    ]);

    return {
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        currency: t.currency,
        amount: t.amount.toFixed(6),
        rateBRL: t.rateBRL.toFixed(4),
        grossBRL: t.grossBRL.toFixed(2),
        iofBRL: t.iofBRL.toFixed(2),
        feeBRL: t.feeBRL.toFixed(2),
        spreadBRL: t.spreadBRL.toFixed(2),
        netBRL: t.netBRL.toFixed(2),
        createdAt: t.createdAt,
      })),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }
}
