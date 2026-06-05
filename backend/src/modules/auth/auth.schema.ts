import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
  .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial');

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.email('Email inválido'),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export const checkEmailSchema = z.object({
  email: z.email('Email inválido'),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type RefreshDTO = z.infer<typeof refreshSchema>;
export type CheckEmailDTO = z.infer<typeof checkEmailSchema>;
