import { z } from 'zod';

export const createProductoSchema = z.object({
  codigo_producto: z.string().max(50).optional(),
  nombre: z.string().min(2).max(200),
  descripcion: z.string().max(1000).optional(),
  id_categoria: z.string().uuid().optional(),
  marca: z.string().max(100).optional(),
  modelo: z.string().max(100).optional(),
  unidad_medida: z.string().max(50).default('UNIDAD'),
  stock_minimo: z.coerce.number().int().min(0).default(0),
  stock_maximo: z.coerce.number().int().min(0).optional(),
  precio_compra: z.coerce.number().min(0).optional(),
  precio_venta: z.coerce.number().min(0).optional(),
});

export const updateProductoSchema = createProductoSchema.partial();

export const productoQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  id_categoria: z.string().uuid().optional(),
  activo: z.enum(['true', 'false']).optional(),
});

export type CreateProductoDto = z.infer<typeof createProductoSchema>;
export type UpdateProductoDto = z.infer<typeof updateProductoSchema>;
