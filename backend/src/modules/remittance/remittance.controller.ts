import type { Request, Response, NextFunction } from 'express';
import { RemittanceService } from './remittance.service';
import {
  createRemittanceSchema,
  remittanceIdSchema,
  listRemittancesSchema,
} from './remittance.schema';
import { apiResponse } from '../../utils';

const remittanceService = new RemittanceService();

export class RemittanceController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId as string;
      const data = createRemittanceSchema.parse(req.body);
      const remittance = await remittanceService.create(userId, data);

      apiResponse(res, 201, 'Remessa criada com sucesso', remittance, {
        title: 'O que é uma remessa internacional?',
        description:
          'Uma remessa internacional é uma transferência de dinheiro entre dois países. Quando você envia dinheiro do Brasil para os EUA, por exemplo, seu Real (BRL) é convertido em Dólar (USD). Nesse processo, existem custos como o spread (diferença entre a taxa de compra e venda) e taxas operacionais.',
        example:
          'Você envia R$1.000 para os EUA. Com taxa de câmbio 5.20 e spread 1.5%, a taxa efetiva fica 5.12. Você recebe ~$195,31. A taxa fixa de R$5,00 é cobrada sobre o valor enviado, totalizando R$1.005,00.',
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId as string;
      const filters = listRemittancesSchema.parse(req.query);
      const result = await remittanceService.list(userId, filters);

      apiResponse(res, 200, 'Remessas listadas com sucesso', result, {
        title: 'O que significam os status?',
        description:
          'PENDING: remessa criada, aguardando processamento. PROCESSING: dinheiro em trânsito entre os bancos. COMPLETED: dinheiro chegou ao destino. FAILED: algo deu errado no processamento. CANCELLED: você cancelou a remessa antes do processamento.',
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId as string;
      const { id } = remittanceIdSchema.parse(req.params);
      const remittance = await remittanceService.getById(userId, id);

      apiResponse(res, 200, 'Detalhes da remessa', remittance, {
        title: 'Como ler os detalhes da remessa?',
        description:
          'originAmount: valor que você enviou na moeda de origem. targetAmount: valor que chega na moeda de destino. exchangeRate: taxa de câmbio usada. spread: percentual cobrado pela operação (diferença entre taxa real e taxa aplicada). fee: taxa fixa operacional. totalCost: custo total na moeda de origem (valor enviado + taxa fixa).',
      });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId as string;
      const { id } = remittanceIdSchema.parse(req.params);
      const remittance = await remittanceService.cancel(userId, id);

      apiResponse(res, 200, 'Remessa cancelada com sucesso', remittance, {
        title: 'Posso cancelar qualquer remessa?',
        description:
          'Só é possível cancelar remessas com status PENDING (pendente). Uma vez que a remessa entra em PROCESSING, o dinheiro já está em trânsito e não pode ser cancelado. Por isso é importante revisar todos os detalhes antes de confirmar o envio.',
      });
    } catch (error) {
      next(error);
    }
  }
}
