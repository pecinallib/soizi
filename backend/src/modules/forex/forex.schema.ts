import { z } from 'zod/v4';

export const buyCurrencySchema = z.object({
  currency: z.string().min(3).max(10).toUpperCase(),
  amountBRL: z.number().positive('Informe um valor positivo'),
});

export const sellCurrencySchema = z.object({
  currency: z.string().min(3).max(10).toUpperCase(),
  amount: z.number().positive('Informe uma quantidade positiva'),
});

export const forexTransactionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  currency: z.string().optional(),
});

export type BuyCurrencyDTO = z.infer<typeof buyCurrencySchema>;
export type SellCurrencyDTO = z.infer<typeof sellCurrencySchema>;
export type ForexTransactionsQueryDTO = z.infer<typeof forexTransactionsQuerySchema>;
