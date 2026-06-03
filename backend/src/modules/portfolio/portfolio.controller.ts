import type { Request, Response, NextFunction } from 'express';
import { PortfolioService } from './portfolio.service';
import { buySchema, sellSchema, portfolioTransactionsQuerySchema } from './portfolio.schema';
import { apiResponse } from '../../utils';

const portfolioService = new PortfolioService();

export class PortfolioController {
  async getPortfolio(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await portfolioService.getPortfolio(req.userId as string);

      apiResponse(res, 200, 'Portfolio obtido com sucesso', result, {
        title: 'O que é um portfolio de ações?',
        description:
          'Seu portfolio é o conjunto de todas as ações que você possui. O P&L (Profit and Loss) mostra quanto você ganhou ou perdeu em relação ao preço médio de compra. Valores positivos indicam lucro, negativos indicam prejuízo.',
        example:
          'Se você comprou 10 ações de AAPL a R$900 cada (total R$9.000) e hoje valem R$950, seu P&L é +R$500 (+5,56%).',
      });
    } catch (error) {
      next(error);
    }
  }

  async buy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = buySchema.parse(req.body);
      const result = await portfolioService.buy(req.userId as string, data);

      apiResponse(res, 201, `Compra de ${data.symbol} realizada com sucesso`, result, {
        title: 'Como funciona a compra de ações?',
        description:
          'Ao comprar uma ação, o valor em BRL é debitado da sua carteira calculando o preço atual em dólares convertido pela taxa de câmbio USD/BRL do momento. Se você já possuía ações do mesmo ticker, o preço médio é recalculado.',
        example:
          'Comprando 5 AAPL a US$180 com câmbio R$5,40, você paga R$4.860. Se já tinha 5 a R$900 cada, novo preço médio = R$930.',
      });
    } catch (error) {
      next(error);
    }
  }

  async sell(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = sellSchema.parse(req.body);
      const result = await portfolioService.sell(req.userId as string, data);

      apiResponse(res, 200, `Venda de ${data.symbol} realizada com sucesso`, result, {
        title: 'Como funciona a venda de ações?',
        description:
          'Ao vender, o valor em BRL é creditado na sua carteira. O P&L da operação é calculado comparando o preço de venda com seu preço médio de compra. O lucro ou prejuízo é realizado no momento da venda.',
        example:
          'Vendendo 5 AAPL a US$200 (R$5,40 câmbio) = R$5.400 creditados. Se preço médio era R$900, lucro = R$5.400 - R$4.500 = +R$900.',
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = portfolioTransactionsQuerySchema.parse(req.query);
      const result = await portfolioService.getTransactions(req.userId as string, filters);

      apiResponse(res, 200, 'Histórico de operações obtido com sucesso', result);
    } catch (error) {
      next(error);
    }
  }
}
