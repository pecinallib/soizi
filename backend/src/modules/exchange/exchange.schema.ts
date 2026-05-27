import { z } from 'zod';

export const convertSchema = z.object({
  from: z.string().length(3, 'Código da moeda deve ter 3 caracteres').toUpperCase(),
  to: z.string().length(3, 'Código da moeda deve ter 3 caracteres').toUpperCase(),
  amount: z.number().positive('Valor deve ser positivo').max(1_000_000, 'Valor máximo é 1.000.000'),
});

export const ratesParamSchema = z.object({
  base: z.string().length(3, 'Código da moeda deve ter 3 caracteres').toUpperCase(),
});

export type ConvertDTO = z.infer<typeof convertSchema>;
export type RatesParamDTO = z.infer<typeof ratesParamSchema>;
