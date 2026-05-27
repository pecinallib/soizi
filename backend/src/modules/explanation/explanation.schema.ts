import { z } from 'zod';

export const createExplanationSchema = z.object({
  key: z.string().min(2, 'Chave deve ter no mínimo 2 caracteres'),
  title: z.string().min(2, 'Título deve ter no mínimo 2 caracteres'),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  example: z.string().optional(),
  category: z.string().min(2, 'Categoria deve ter no mínimo 2 caracteres'),
  order: z.number().int().nonnegative().default(0),
});

export const updateExplanationSchema = createExplanationSchema.partial().omit({ key: true });

export const explanationKeySchema = z.object({
  key: z.string().min(1, 'Chave é obrigatória'),
});

export const explanationCategorySchema = z.object({
  category: z.string().min(1, 'Categoria é obrigatória'),
});

export type CreateExplanationDTO = z.infer<typeof createExplanationSchema>;
export type UpdateExplanationDTO = z.infer<typeof updateExplanationSchema>;
export type ExplanationKeyDTO = z.infer<typeof explanationKeySchema>;
export type ExplanationCategoryDTO = z.infer<typeof explanationCategorySchema>;
