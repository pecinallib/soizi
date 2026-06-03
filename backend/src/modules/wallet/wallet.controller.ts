import type { Request, Response, NextFunction } from 'express';
import { WalletService } from './wallet.service';
import { transferSchema, walletTransactionsQuerySchema } from './wallet.schema';
import { apiResponse } from '../../utils';

const walletService = new WalletService();

export class WalletController {
  async getWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const wallet = await walletService.getWallet(req.userId as string);

      apiResponse(res, 200, 'Carteira obtida com sucesso', wallet, {
        title: 'O que são créditos educativos?',
        description:
          'Seu saldo é fictício, criado exclusivamente para simulações. Ao criar sua conta você recebeu R$50.000 para explorar transferências internacionais, comprar ações e aprender sobre câmbio sem arriscar dinheiro real.',
        example:
          'Com R$50.000 você pode simular o envio de dinheiro para vários países, comprar ações de empresas internacionais e acompanhar a variação do câmbio.',
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = walletTransactionsQuerySchema.parse(req.query);
      const result = await walletService.getTransactions(req.userId as string, filters);

      apiResponse(res, 200, 'Extrato obtido com sucesso', result);
    } catch (error) {
      next(error);
    }
  }

  async transfer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = transferSchema.parse(req.body);
      const result = await walletService.transfer(req.userId as string, data);

      apiResponse(res, 200, 'Transferência realizada com sucesso', result, {
        title: 'Como funcionam as transferências entre usuários?',
        description:
          'No SoIzi você pode simular o envio de créditos educativos para outros usuários, replicando o funcionamento de uma corretora ou banco digital. Ambos os saldos são atualizados instantaneamente.',
      });
    } catch (error) {
      next(error);
    }
  }
}
