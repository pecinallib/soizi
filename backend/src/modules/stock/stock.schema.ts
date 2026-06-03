import { z } from 'zod';

export const symbolParamSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Termo de busca obrigatório').max(50),
});

export type SymbolParamDTO = z.infer<typeof symbolParamSchema>;
export type SearchQueryDTO = z.infer<typeof searchQuerySchema>;
