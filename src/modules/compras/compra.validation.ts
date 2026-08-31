import { z } from 'zod';

const detalleSchema = z.object({
  id_producto: z.string().uuid(),
  cantidad: z.coerce.number().int().min(1),
  precio_unitario: z.coerce.number().min(0),
  descuento: z.coerce.number().min(0).default(0),
  impuesto: z.coerce.number().min(0).default(0),
});

export const createCompraSchema = z.object({
  id_proveedor: z.string().uuid(),
  numero_factura: z.string().max(100).optional(),
  fecha_compra: z.string().optional(),
  observaciones: z.string().max(1000).optional(),
  detalle: z.array(detalleSchema).min(1, 'Se requiere al menos un producto'),
});

export const updateCompraSchema = z.object({
  id_proveedor: z.string().uuid().optional(),
  numero_factura: z.string().max(100).optional(),
  fecha_compra: z.string().optional(),
  observaciones: z.string().max(1000).optional(),
  detalle: z.array(detalleSchema).min(1).optional(),
});

export type CreateCompraDto = z.infer<typeof createCompraSchema>;
export type UpdateCompraDto = z.infer<typeof updateCompraSchema>;
