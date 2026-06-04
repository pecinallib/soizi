import { z } from 'zod';

export const transferSchema = z.object({
  toEmail: z.string().email('Email inválido'),
  amount: z
    .number()
    .positive('Valor deve ser positivo')
    .max(50000, 'Valor máximo por transferência é R$50.000'),
  description: z.string().max(200).optional(),
});

export const walletTransactionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  type: z
    .enum([
      'INITIAL_CREDIT',
      'CREDIT',
      'DEBIT',
      'TRANSFER_IN',
      'TRANSFER_OUT',
      'STOCK_BUY',
      'STOCK_SELL',
      'REMITTANCE',
    ])
    .optional(),
});

export type TransferDTO = z.infer<typeof transferSchema>;
export type WalletTransactionsQueryDTO = z.infer<typeof walletTransactionsQuerySchema>;
