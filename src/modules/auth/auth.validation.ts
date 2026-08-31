import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z
    .string({ required_error: 'Usuario o email requerido' })
    .min(1, 'Usuario o email requerido'),
  password: z
    .string({ required_error: 'Contraseña requerida' })
    .min(1, 'Contraseña requerida'),
});

export type LoginDto = z.infer<typeof loginSchema>;
