import { z } from 'zod';

export const createRemittanceSchema = z.object({
  originCurrency: z.string().length(3, 'Código da moeda deve ter 3 caracteres').toUpperCase(),
  targetCurrency: z.string().length(3, 'Código da moeda deve ter 3 caracteres').toUpperCase(),
  originAmount: z
    .number()
    .positive('Valor deve ser positivo')
    .max(1_000_000, 'Valor máximo é 1.000.000'),
});

export const remittanceIdSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export const listRemittancesSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type CreateRemittanceDTO = z.infer<typeof createRemittanceSchema>;
export type RemittanceIdDTO = z.infer<typeof remittanceIdSchema>;
export type ListRemittancesDTO = z.infer<typeof listRemittancesSchema>;
