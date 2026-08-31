import { z } from 'zod';

export const createPrestatarioSchema = z.object({
  tipo: z.enum(['EMPLEADO', 'ESTUDIANTE', 'EXTERNO', 'DEPENDENCIA']).default('EXTERNO'),
  nombre: z.string().min(2).max(200),
  apellido: z.string().max(200).optional(),
  identificacion: z.string().max(50).optional(),
  cargo: z.string().max(100).optional(),
  dependencia: z.string().max(200).optional(),
  telefono: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal('')),
  observaciones: z.string().max(1000).optional(),
});

export const createPrestamoSchema = z.object({
  id_prestatario: z.string().uuid(),
  fecha_vencimiento: z.string().min(1, 'Fecha de vencimiento requerida'),
  observaciones: z.string().max(1000).optional(),
  bienes: z.array(z.coerce.number().int().positive()).min(1, 'Se requiere al menos un bien'),
});

export const devolucionSchema = z.object({
  observaciones: z.string().max(1000).optional(),
  bienes: z.array(
    z.object({
      id_bien: z.coerce.number().int().positive(),
      estado_devolucion: z.enum(['BUENO', 'CON_DAÑOS', 'PERDIDO']).default('BUENO'),
      observaciones: z.string().max(500).optional(),
    }),
  ).min(1, 'Se requiere al menos un bien para devolver'),
});

export type CreatePrestatarioDto = z.infer<typeof createPrestatarioSchema>;
export type CreatePrestamoDto = z.infer<typeof createPrestamoSchema>;
export type DevolucionDto = z.infer<typeof devolucionSchema>;
