import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z.string().min(1).max(100),
  academicEmail: z.string().email('Invalid email format.'),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  institution: z.string().min(1).max(200),
  academicLevel: z.enum(['UNDERGRADUATE', 'MASTER', 'PHD', 'PROFESSOR']),
  dateOfBirth: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date format.' }),
});

// Todos os campos são opcionais; imagens aceitam `null` para remover.
export const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().nullable().optional(),
  coverPhoto: z.string().nullable().optional(),
});

const REQUIRED = 'Senha atual e nova senha são obrigatórias.';

export const changePasswordSchema = z.object({
  currentPassword: z.string(REQUIRED).min(1, REQUIRED),
  newPassword: z.string(REQUIRED).min(8, 'A nova senha deve ter ao menos 8 caracteres.'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
