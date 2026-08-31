import { Op, WhereOptions } from 'sequelize';
import { Producto, ProductoAttributes } from './producto.model';
import { Categoria } from '../categorias/categoria.model';

export interface ProductoFindOptions {
  page?: number;
  limit?: number;
  search?: string;
  id_categoria?: string;
  activo?: boolean;
}

export const ProductoRepository = {
  async findAll(opts: ProductoFindOptions = {}): Promise<{ rows: Producto[]; count: number }> {
    const { page = 1, limit = 20, search, id_categoria, activo } = opts;
    const offset = (page - 1) * limit;
    const where: WhereOptions<ProductoAttributes> = {};

    if (activo !== undefined) where.activo = activo;
    if (id_categoria) where.id_categoria = id_categoria;
    if (search) {
      Object.assign(where, {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { codigo_producto: { [Op.iLike]: `%${search}%` } },
          { marca: { [Op.iLike]: `%${search}%` } },
        ],
      });
    }

    return Producto.findAndCountAll({
      where,
      limit,
      offset,
      order: [['nombre', 'ASC']],
      include: [{ model: Categoria, as: 'categoria', required: false }],
    });
  },

  async findById(id: string): Promise<Producto | null> {
    return Producto.findByPk(id, {
      include: [{ model: Categoria, as: 'categoria', required: false }],
    });
  },

  async findByCodigo(codigo: string, excludeId?: string): Promise<Producto | null> {
    const where: WhereOptions<ProductoAttributes> = { codigo_producto: codigo };
    if (excludeId) Object.assign(where, { id_producto: { [Op.ne]: excludeId } });
    return Producto.findOne({ where });
  },

  async create(data: Omit<ProductoAttributes, 'id_producto' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<Producto> {
    return Producto.create(data);
  },

  async update(id: string, data: Partial<ProductoAttributes>): Promise<Producto | null> {
    const prod = await Producto.findByPk(id);
    if (!prod) return null;
    return prod.update(data);
  },

  async findWithLowStock(): Promise<Producto[]> {
    // Products where we would need to query bienes count — for now returns all active
    return Producto.findAll({
      where: { activo: true },
      include: [{ model: Categoria, as: 'categoria', required: false }],
    });
  },
};
