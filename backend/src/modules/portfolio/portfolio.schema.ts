import { z } from 'zod';

export const buySchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
  quantity: z.number().positive('Quantidade deve ser positiva').max(10000),
});

export const sellSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
  quantity: z.number().positive('Quantidade deve ser positiva').max(10000),
});

export const portfolioTransactionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  symbol: z.string().toUpperCase().optional(),
  type: z.enum(['BUY', 'SELL']).optional(),
});

export type BuyDTO = z.infer<typeof buySchema>;
export type SellDTO = z.infer<typeof sellSchema>;
export type PortfolioTransactionsQueryDTO = z.infer<typeof portfolioTransactionsQuerySchema>;
