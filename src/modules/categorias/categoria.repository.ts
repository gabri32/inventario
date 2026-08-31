import { Op, WhereOptions } from 'sequelize';
import { Categoria, CategoriaAttributes } from './categoria.model';

export const CategoriaRepository = {
  async findAll(opts: { search?: string; activo?: boolean } = {}): Promise<Categoria[]> {
    const where: WhereOptions<CategoriaAttributes> = {};
    if (opts.activo !== undefined) where.activo = opts.activo;
    if (opts.search) {
      Object.assign(where, { nombre: { [Op.iLike]: `%${opts.search}%` } });
    }
    return Categoria.findAll({ where, order: [['nombre', 'ASC']] });
  },

  async findById(id: string): Promise<Categoria | null> {
    return Categoria.findByPk(id);
  },

  async findByNombre(nombre: string, excludeId?: string): Promise<Categoria | null> {
    const where: WhereOptions<CategoriaAttributes> = { nombre };
    if (excludeId) Object.assign(where, { id_categoria: { [Op.ne]: excludeId } });
    return Categoria.findOne({ where });
  },

  async create(data: Omit<CategoriaAttributes, 'id_categoria' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<Categoria> {
    return Categoria.create(data);
  },

  async update(id: string, data: Partial<CategoriaAttributes>): Promise<Categoria | null> {
    const cat = await Categoria.findByPk(id);
    if (!cat) return null;
    return cat.update(data);
  },
};
