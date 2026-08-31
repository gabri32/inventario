import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial');

export const createUsuarioSchema = z.object({
  nombre: z.string().min(2).max(100),
  apellido: z.string().min(2).max(100),
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  email: z.string().email('Email inválido').max(255),
  password: passwordSchema,
});

export const updateUsuarioSchema = z.object({
  nombre: z.string().min(2).max(100).optional(),
  apellido: z.string().min(2).max(100).optional(),
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  email: z.string().email().max(255).optional(),
});

export const changePasswordSchema = z
  .object({
    password_actual: z.string().min(1, 'Contraseña actual requerida'),
    password_nuevo: passwordSchema,
    password_confirmacion: z.string().min(1, 'Confirmación requerida'),
  })
  .refine((data) => data.password_nuevo === data.password_confirmacion, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmacion'],
  });

export const asignarRolSchema = z.object({
  id_rol: z.string().uuid('ID de rol inválido'),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  activo: z.enum(['true', 'false']).optional().transform((v) => v === 'true'),
});

export type CreateUsuarioDto = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioDto = z.infer<typeof updateUsuarioSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type AsignarRolDto = z.infer<typeof asignarRolSchema>;
