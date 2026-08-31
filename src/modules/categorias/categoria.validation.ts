import { z } from 'zod';

export const createCategoriaSchema = z.object({
  nombre: z.string().min(2).max(100),
  descripcion: z.string().max(500).optional(),
});

export const updateCategoriaSchema = createCategoriaSchema.partial();

export type CreateCategoriaDto = z.infer<typeof createCategoriaSchema>;
export type UpdateCategoriaDto = z.infer<typeof updateCategoriaSchema>;
