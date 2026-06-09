import type { Request, Response, NextFunction } from 'express';
import { ForexService } from './forex.service';
import { buyCurrencySchema, sellCurrencySchema, forexTransactionsQuerySchema } from './forex.schema';
import { apiResponse } from '../../utils';

const forexService = new ForexService();

export class ForexController {
  async buy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId as string;
      const data = buyCurrencySchema.parse(req.body);
      const result = await forexService.buy(userId, data);
      apiResponse(res, 200, `Compra de ${result.currency} realizada com sucesso`, result, {
        title: 'Como funciona a compra de moeda?',
        description:
          'Você usa seu saldo em reais para adquirir moeda estrangeira. As taxas incluem IOF (imposto obrigatório), spread bancário (margem da corretora) e uma taxa fixa de operação.',
        example: `Comprando R$1.000 em USD: IOF de R$3,80 + R$5,00 de taxa + spread de 1,5% = custo real maior que R$1.000.`,
      });
    } catch (error) {
      next(error);
    }
  }

  async sell(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId as string;
      const data = sellCurrencySchema.parse(req.body);
      const result = await forexService.sell(userId, data);
      apiResponse(res, 200, `Venda de ${result.currency} realizada com sucesso`, result, {
        title: 'Como funciona a venda de moeda?',
        description:
          'Ao vender moeda estrangeira de volta para reais, o mesmo processo de taxas se aplica — spread, IOF e taxa fixa são descontados do valor bruto recebido.',
      });
    } catch (error) {
      next(error);
    }
  }

  async getHoldings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId as string;
      const holdings = await forexService.getHoldings(userId);
      apiResponse(res, 200, 'Posições em moeda estrangeira obtidas', holdings);
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId as string;
      const filters = forexTransactionsQuerySchema.parse(req.query);
      const result = await forexService.getTransactions(userId, filters);
      apiResponse(res, 200, 'Histórico de câmbio obtido', result);
    } catch (error) {
      next(error);
    }
  }
}
