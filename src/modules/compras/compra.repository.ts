import { Transaction, Op, WhereOptions } from 'sequelize';
import { Compra, CompraAttributes, CompraDetalle, CompraDetalleCreationAttributes } from './compra.model';
import { Proveedor } from '../proveedores/proveedor.model';
import { Estado } from '../estados/estado.model';
import { Producto } from '../productos/producto.model';

const defaultIncludes = () => [
  { model: Proveedor, as: 'proveedor', required: false },
  { model: Estado, as: 'estado', required: false },
];

const withDetalle = () => [
  ...defaultIncludes(),
  {
    model: CompraDetalle,
    as: 'detalle',
    required: false,
    include: [{ model: Producto, as: 'producto', required: false }],
  },
];

export const CompraRepository = {
  async findAll(opts: { page?: number; limit?: number; id_proveedor?: string; id_estado?: string; fecha_desde?: string; fecha_hasta?: string } = {}): Promise<{ rows: Compra[]; count: number }> {
    const { page = 1, limit = 20, id_proveedor, id_estado, fecha_desde, fecha_hasta } = opts;
    const offset = (page - 1) * limit;
    const where: WhereOptions<CompraAttributes> = {};
    if (id_proveedor) where.id_proveedor = id_proveedor;
    if (id_estado) where.id_estado = id_estado;
    if (fecha_desde || fecha_hasta) {
      const fw: Record<string, unknown> = {};
      if (fecha_desde) fw[Op.gte as unknown as string] = fecha_desde;
      if (fecha_hasta) fw[Op.lte as unknown as string] = fecha_hasta;
      (where as Record<string, unknown>)['fecha_compra'] = fw;
    }
    return Compra.findAndCountAll({ where, limit, offset, order: [['fecha_creacion', 'DESC']], include: defaultIncludes() });
  },

  async findById(id: string): Promise<Compra | null> {
    return Compra.findByPk(id, { include: withDetalle() });
  },

  async create(data: Omit<CompraAttributes, 'id_compra' | 'fecha_creacion' | 'fecha_actualizacion'>, t?: Transaction): Promise<Compra> {
    return Compra.create(data, { transaction: t });
  },

  async createDetalle(data: CompraDetalleCreationAttributes, t?: Transaction): Promise<CompraDetalle> {
    return CompraDetalle.create(data, { transaction: t });
  },

  async updateEstado(id: string, id_estado: string, extra: Partial<CompraAttributes>, t?: Transaction): Promise<void> {
    await Compra.update({ id_estado, ...extra }, { where: { id_compra: id }, transaction: t });
  },

  async deleteDetalle(id_compra: string, t?: Transaction): Promise<void> {
    await CompraDetalle.destroy({ where: { id_compra }, transaction: t });
  },
};
