import { z } from 'zod';

const detalleSchema = z.object({
  id_producto: z.string().uuid(),
  id_bien: z.coerce.number().int().positive().optional(),
  cantidad: z.coerce.number().int().min(1),
  precio_unitario: z.coerce.number().min(0),
  descuento: z.coerce.number().min(0).default(0),
  impuesto: z.coerce.number().min(0).default(0),
});

export const createVentaSchema = z.object({
  cliente: z.string().max(200).optional(),
  fecha_venta: z.string().optional(),
  observaciones: z.string().max(1000).optional(),
  detalle: z.array(detalleSchema).min(1, 'Se requiere al menos un producto'),
});

export const updateVentaSchema = createVentaSchema.partial();

export type CreateVentaDto = z.infer<typeof createVentaSchema>;
export type UpdateVentaDto = z.infer<typeof updateVentaSchema>;
