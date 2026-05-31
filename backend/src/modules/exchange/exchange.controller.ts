import type { Request, Response, NextFunction } from 'express';
import { ExchangeService } from './exchange.service';
import { convertSchema, ratesParamSchema } from './exchange.schema';
import { apiResponse } from '../../utils';

const exchangeService = new ExchangeService();

export class ExchangeController {
  async getRates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { base } = ratesParamSchema.parse(req.params);
      const rates = await exchangeService.getRates(base);

      apiResponse(res, 200, 'Taxas de câmbio obtidas com sucesso', rates, {
        title: 'O que são taxas de câmbio?',
        description:
          'A taxa de câmbio indica quanto uma moeda vale em relação a outra. Por exemplo, se USD/BRL = 5.20, significa que 1 dólar americano vale R$5,20. As taxas flutuam constantemente baseadas na oferta e demanda do mercado global.',
        example:
          'Se a taxa USD/BRL é 5.20 e você quer converter $100, o valor bruto seria R$520,00 (sem taxas).',
      });
    } catch (error) {
      next(error);
    }
  }

  async convert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = convertSchema.parse(req.body);
      const result = await exchangeService.convert(data.from, data.to, data.amount);

      apiResponse(res, 200, 'Conversão realizada com sucesso', result, {
        title: 'Como funciona a conversão?',
        description:
          'A conversão usa a taxa de câmbio atual e aplica dois custos: o spread (diferença entre taxa de compra e venda, geralmente 1-2%) e uma taxa fixa operacional. O spread é como as instituições financeiras lucram com a operação — quanto menor o spread, melhor pra você.',
        example:
          'Enviando R$1000 para USD com taxa 5.20 e spread 1.5%: taxa efetiva = 5.12, você recebe ~$195,31. Taxa fixa: R$5,00. Custo total: R$1005,00.',
      });
    } catch (error) {
      next(error);
    }
  }

  async getPreview(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rates = await exchangeService.getPreviewRates();
      apiResponse(res, 200, 'Taxas de prévia obtidas com sucesso', rates);
    } catch (error) {
      next(error);
    }
  }

  async getSupportedCurrencies(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currencies = await exchangeService.getSupportedCurrencies();

      apiResponse(res, 200, 'Moedas suportadas', currencies, {
        title: 'O que são códigos de moeda?',
        description:
          'Cada moeda tem um código ISO 4217 de 3 letras. BRL = Real Brasileiro, USD = Dólar Americano, EUR = Euro, GBP = Libra Esterlina. Esses códigos são usados mundialmente para identificar moedas sem ambiguidade.',
      });
    } catch (error) {
      next(error);
    }
  }
}
