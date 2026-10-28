import { z } from 'zod'

import { timestampSchema } from './common'

export const userSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  username: z.string(),
  email: z.email(),
  ensName: z.string().nullable(),
  avatarEmoji: z.string(),
  createdAt: timestampSchema,
})
export type User = z.infer<typeof userSchema>

export const sessionSchema = z.object({
  user: userSchema,
  expiresAt: timestampSchema,
})
export type Session = z.infer<typeof sessionSchema>

const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter ao menos 8 caracteres')
  .max(72, 'A senha deve ter no máximo 72 caracteres')

export const loginSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
})
export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Mínimo de 3 caracteres')
      .regex(/^[a-z0-9_.-]+$/i, 'Use apenas letras, números, ponto, hífen ou underscore'),
    email: z.email('E-mail inválido'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
export type RegisterInput = z.infer<typeof registerSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmNewPassword'],
  })
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1, 'Informe o nome de exibição'),
  username: z.string().trim().min(3, 'Mínimo de 3 caracteres'),
  email: z.email('E-mail inválido'),
  ensName: z.string().trim().nullable(),
  avatarEmoji: z.string().min(1),
})
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const authResponseSchema = sessionSchema.extend({ token: z.string() })
export type AuthResponse = z.infer<typeof authResponseSchema>
