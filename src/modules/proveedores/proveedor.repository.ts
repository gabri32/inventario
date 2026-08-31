import { Op, WhereOptions } from 'sequelize';
import { Proveedor, ProveedorAttributes } from './proveedor.model';

export const ProveedorRepository = {
  async findAll(opts: { page?: number; limit?: number; search?: string; activo?: boolean } = {}): Promise<{ rows: Proveedor[]; count: number }> {
    const { page = 1, limit = 20, search, activo } = opts;
    const offset = (page - 1) * limit;
    const where: WhereOptions<ProveedorAttributes> = {};

    if (activo !== undefined) where.activo = activo;
    if (search) {
      Object.assign(where, {
        [Op.or]: [
          { razon_social: { [Op.iLike]: `%${search}%` } },
          { numero_documento: { [Op.iLike]: `%${search}%` } },
          { nombre_contacto: { [Op.iLike]: `%${search}%` } },
        ],
      });
    }

    return Proveedor.findAndCountAll({ where, limit, offset, order: [['razon_social', 'ASC']] });
  },

  async findById(id: string): Promise<Proveedor | null> {
    return Proveedor.findByPk(id);
  },

  async findByDocumento(doc: string, excludeId?: string): Promise<Proveedor | null> {
    const where: WhereOptions<ProveedorAttributes> = { numero_documento: doc };
    if (excludeId) Object.assign(where, { id_proveedor: { [Op.ne]: excludeId } });
    return Proveedor.findOne({ where });
  },

  async create(data: Omit<ProveedorAttributes, 'id_proveedor' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<Proveedor> {
    return Proveedor.create(data);
  },

  async update(id: string, data: Partial<ProveedorAttributes>): Promise<Proveedor | null> {
    const p = await Proveedor.findByPk(id);
    if (!p) return null;
    return p.update(data);
  },
};
