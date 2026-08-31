import { z } from 'zod';

export const createBienSchema = z.object({
  id_producto: z.string().uuid('ID de producto inválido'),
  codigo_interno: z.string().max(100).optional(),
  numero_serie: z.string().max(200).optional(),
  id_estado: z.string().uuid('ID de estado inválido').optional(), // opcional: por defecto DISPONIBLE
  ubicacion: z.string().max(200).optional(),
  fecha_adquisicion: z.string().optional(),
  precio_adquisicion: z.coerce.number().min(0).optional(),
  observaciones: z.string().max(1000).optional(),
});

export const updateBienSchema = createBienSchema.partial().omit({ id_producto: true });

export const cambiarEstadoBienSchema = z.object({
  id_estado: z.string().uuid('ID de estado inválido'),
  observaciones: z.string().max(500).optional(),
});

export const createMasivaSchema = z.object({
  id_producto: z.string().uuid(),
  id_estado: z.string().uuid(),
  ubicacion: z.string().max(200).optional(),
  fecha_adquisicion: z.string().optional(),
  precio_adquisicion: z.coerce.number().min(0).optional(),
  bienes: z.array(
    z.object({
      codigo_interno: z.string().max(100).optional(),
      numero_serie: z.string().max(200).optional(),
      observaciones: z.string().max(1000).optional(),
    }),
  ).min(1, 'Se requiere al menos un bien'),
});

export type CreateBienDto = z.infer<typeof createBienSchema>;
export type UpdateBienDto = z.infer<typeof updateBienSchema>;
export type CambiarEstadoBienDto = z.infer<typeof cambiarEstadoBienSchema>;
export type CreateMasivaDto = z.infer<typeof createMasivaSchema>;
