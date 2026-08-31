import { z } from 'zod';

export const createProveedorSchema = z.object({
  tipo_documento: z.enum(['RUC', 'CEDULA', 'PASAPORTE']),
  numero_documento: z.string().min(5).max(20),
  razon_social: z.string().min(2).max(200),
  nombre_contacto: z.string().max(200).optional(),
  telefono: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal('')),
  direccion: z.string().max(500).optional(),
  ciudad: z.string().max(100).optional(),
  observaciones: z.string().max(1000).optional(),
});

export const updateProveedorSchema = createProveedorSchema.partial();

export type CreateProveedorDto = z.infer<typeof createProveedorSchema>;
export type UpdateProveedorDto = z.infer<typeof updateProveedorSchema>;
