import { prisma } from '../../config/database';
import { ApiError } from '../../utils';
import { StockService } from '../stock/stock.service';
import { ExchangeService } from '../exchange/exchange.service';
import type { BuyDTO, SellDTO, PortfolioTransactionsQueryDTO } from './portfolio.schema';

interface PositionItem {
  symbol: string;
  quantity: string;
  avgPriceBRL: string;
  currentPriceUSD: string;
  currentPriceBRL: string;
  currentValueBRL: string;
  investedBRL: string;
  pnlBRL: string;
  pnlPercent: string;
  changePercent: string;
  updatedAt: Date;
}

interface PortfolioResult {
  positions: PositionItem[];
  totalInvestedBRL: string;
}

interface StockOperationResult {
  symbol: string;
  quantity: string;
  priceUSD: string;
  priceBRL: string;
  exchangeRate: string;
  totalBRL: string;
  newBalance: string;
}

interface SellResult extends StockOperationResult {
  pnlBRL: string;
}

interface StockTransactionItem {
  id: string;
  symbol: string;
  type: string;
  quantity: string;
  priceUSD: string;
  priceBRL: string;
  exchangeRate: string;
  totalBRL: string;
  createdAt: Date;
}

interface PaginatedStockTransactions {
  transactions: StockTransactionItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const stockService = new StockService();
const exchangeService = new ExchangeService();

export class PortfolioService {
  async getPortfolio(userId: string): Promise<PortfolioResult> {
    const positions = await prisma.portfolio.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    if (positions.length === 0) {
      return { positions: [], totalInvestedBRL: '0.00' };
    }

    const rates = await exchangeService.getRates('BRL');
    const usdToBRL = rates.rates['USD'] ?? 0;

    const enriched = await Promise.allSettled(
      positions.map(async (p) => {
        const quote = await stockService.getQuote(p.symbol);
        const qty = p.quantity.toNumber();
        const avgPrice = p.avgPriceBRL.toNumber();
        const currentPriceBRL = usdToBRL > 0 ? quote.price / usdToBRL : 0;
        const currentValueBRL = currentPriceBRL * qty;
        const investedBRL = avgPrice * qty;
        const pnlBRL = currentValueBRL - investedBRL;
        const pnlPercent = investedBRL > 0 ? (pnlBRL / investedBRL) * 100 : 0;

        return {
          symbol: p.symbol,
          quantity: qty.toFixed(6),
          avgPriceBRL: avgPrice.toFixed(2),
          currentPriceUSD: quote.price.toFixed(2),
          currentPriceBRL: currentPriceBRL.toFixed(2),
          currentValueBRL: currentValueBRL.toFixed(2),
          investedBRL: investedBRL.toFixed(2),
          pnlBRL: pnlBRL.toFixed(2),
          pnlPercent: pnlPercent.toFixed(2),
          changePercent: quote.changePercent.toFixed(2),
          updatedAt: p.updatedAt,
        };
      }),
    );

    const positionsList = enriched.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));

    const totalInvestedBRL = positions.reduce(
      (acc, p) => acc + p.avgPriceBRL.toNumber() * p.quantity.toNumber(),
      0,
    );

    return {
      positions: positionsList,
      totalInvestedBRL: totalInvestedBRL.toFixed(2),
    };
  }

  async buy(userId: string, data: BuyDTO): Promise<StockOperationResult> {
    const quote = await stockService.getQuote(data.symbol);
    const rates = await exchangeService.getRates('BRL');
    const usdToBRL = rates.rates['USD'] ?? 0;

    if (!usdToBRL) throw ApiError.badRequest('Não foi possível obter taxa de câmbio USD/BRL');

    const priceBRL = quote.price / usdToBRL;
    const totalBRL = priceBRL * data.quantity;

    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw ApiError.notFound('Carteira não encontrada');

      if (wallet.balance.lessThan(totalBRL)) {
        throw ApiError.badRequest(
          `Saldo insuficiente. Necessário: R$${totalBRL.toFixed(2)}, disponível: R$${wallet.balance.toFixed(2)}`,
        );
      }

      const stockTx = await tx.stockTransaction.create({
        data: {
          userId,
          symbol: data.symbol,
          type: 'BUY',
          quantity: data.quantity,
          priceUSD: quote.price,
          priceBRL,
          exchangeRate: usdToBRL,
          totalBRL,
        },
      });

      const existing = await tx.portfolio.findUnique({
        where: { userId_symbol: { userId, symbol: data.symbol } },
      });

      if (existing) {
        const existingQty = existing.quantity.toNumber();
        const existingAvg = existing.avgPriceBRL.toNumber();
        const newQty = existingQty + data.quantity;
        const newAvg = (existingAvg * existingQty + priceBRL * data.quantity) / newQty;

        await tx.portfolio.update({
          where: { userId_symbol: { userId, symbol: data.symbol } },
          data: { quantity: newQty, avgPriceBRL: newAvg },
        });
      } else {
        await tx.portfolio.create({
          data: { userId, symbol: data.symbol, quantity: data.quantity, avgPriceBRL: priceBRL },
        });
      }

      const newBalance = wallet.balance.sub(totalBRL);
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'STOCK_BUY',
          amount: totalBRL,
          balanceBefore: wallet.balance,
          balanceAfter: newBalance,
          description: `Compra de ${data.quantity} ação(ões) de ${data.symbol}`,
          relatedId: stockTx.id,
        },
      });

      return {
        symbol: data.symbol,
        quantity: data.quantity.toFixed(6),
        priceUSD: quote.price.toFixed(4),
        priceBRL: priceBRL.toFixed(2),
        exchangeRate: usdToBRL.toFixed(4),
        totalBRL: totalBRL.toFixed(2),
        newBalance: newBalance.toFixed(2),
      };
    });
  }

  async sell(userId: string, data: SellDTO): Promise<SellResult> {
    const position = await prisma.portfolio.findUnique({
      where: { userId_symbol: { userId, symbol: data.symbol } },
    });

    if (!position) throw ApiError.notFound(`Você não possui ações de ${data.symbol} na carteira`);

    if (position.quantity.lessThan(data.quantity)) {
      throw ApiError.badRequest(
        `Quantidade insuficiente. Você possui ${position.quantity.toFixed(6)} ação(ões) de ${data.symbol}`,
      );
    }

    const quote = await stockService.getQuote(data.symbol);
    const rates = await exchangeService.getRates('BRL');
    const usdToBRL = rates.rates['USD'] ?? 0;

    if (!usdToBRL) throw ApiError.badRequest('Não foi possível obter taxa de câmbio USD/BRL');

    const priceBRL = quote.price / usdToBRL;
    const totalBRL = priceBRL * data.quantity;
    const pnlBRL = (priceBRL - position.avgPriceBRL.toNumber()) * data.quantity;

    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw ApiError.notFound('Carteira não encontrada');

      const stockTx = await tx.stockTransaction.create({
        data: {
          userId,
          symbol: data.symbol,
          type: 'SELL',
          quantity: data.quantity,
          priceUSD: quote.price,
          priceBRL,
          exchangeRate: usdToBRL,
          totalBRL,
        },
      });

      const newQty = position.quantity.toNumber() - data.quantity;

      if (newQty === 0) {
        await tx.portfolio.delete({ where: { userId_symbol: { userId, symbol: data.symbol } } });
      } else {
        await tx.portfolio.update({
          where: { userId_symbol: { userId, symbol: data.symbol } },
          data: { quantity: newQty },
        });
      }

      const newBalance = wallet.balance.add(totalBRL);
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'STOCK_SELL',
          amount: totalBRL,
          balanceBefore: wallet.balance,
          balanceAfter: newBalance,
          description: `Venda de ${data.quantity} ação(ões) de ${data.symbol}`,
          relatedId: stockTx.id,
        },
      });

      return {
        symbol: data.symbol,
        quantity: data.quantity.toFixed(6),
        priceUSD: quote.price.toFixed(4),
        priceBRL: priceBRL.toFixed(2),
        exchangeRate: usdToBRL.toFixed(4),
        totalBRL: totalBRL.toFixed(2),
        pnlBRL: pnlBRL.toFixed(2),
        newBalance: newBalance.toFixed(2),
      };
    });
  }

  async getTransactions(userId: string, filters: PortfolioTransactionsQueryDTO): Promise<PaginatedStockTransactions> {
    const where = {
      userId,
      ...(filters.symbol ? { symbol: filters.symbol } : {}),
      ...(filters.type ? { type: filters.type } : {}),
    };

    const skip = (filters.page - 1) * filters.limit;

    const [transactions, total] = await Promise.all([
      prisma.stockTransaction.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.stockTransaction.count({ where }),
    ]);

    return {
      transactions: transactions.map((t) => ({
        id: t.id,
        symbol: t.symbol,
        type: t.type,
        quantity: t.quantity.toFixed(6),
        priceUSD: t.priceUSD.toFixed(4),
        priceBRL: t.priceBRL.toFixed(2),
        exchangeRate: t.exchangeRate.toFixed(4),
        totalBRL: t.totalBRL.toFixed(2),
        createdAt: t.createdAt,
      })),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }
}
