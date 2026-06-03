import type { Request, Response, NextFunction } from 'express';
import { StockService } from './stock.service';
import { symbolParamSchema, searchQuerySchema } from './stock.schema';
import { apiResponse } from '../../utils';

const stockService = new StockService();

export class StockController {
  async getQuote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { symbol } = symbolParamSchema.parse(req.params);
      const quote = await stockService.getQuote(symbol);

      apiResponse(res, 200, `Cotação de ${symbol} obtida com sucesso`, quote, {
        title: 'O que é cotação de uma ação?',
        description:
          'A cotação é o preço atual de uma ação na bolsa de valores. O preço varia a cada segundo conforme compradores e vendedores negociam. A variação percentual indica se a ação subiu ou caiu em relação ao fechamento do dia anterior.',
        example:
          'Se AAPL está em US$180 com variação de +1,5%, significa que ontem fechou a US$177,33 e hoje subiu US$2,67.',
      });
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q } = searchQuerySchema.parse(req.query);
      const results = await stockService.search(q);

      apiResponse(res, 200, 'Busca realizada com sucesso', results, {
        title: 'O que é um ticker (símbolo) de ação?',
        description:
          'O ticker é o código abreviado que identifica uma ação na bolsa. AAPL = Apple, GOOGL = Alphabet (Google), TSLA = Tesla. Esses códigos são universais e usados em todas as bolsas do mundo.',
      });
    } catch (error) {
      next(error);
    }
  }
}
