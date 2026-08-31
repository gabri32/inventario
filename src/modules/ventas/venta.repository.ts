import { Transaction, WhereOptions, Op } from 'sequelize';
import { Venta, VentaAttributes, VentaDetalle, VentaDetalleCreationAttributes } from './venta.model';
import { Estado } from '../estados/estado.model';
import { Producto } from '../productos/producto.model';
import { Bien } from '../bienes/bien.model';

const withAll = () => [
  { model: Estado, as: 'estado', required: false },
  {
    model: VentaDetalle, as: 'detalle', required: false,
    include: [
      { model: Producto, as: 'producto', required: false },
      { model: Bien, as: 'bien', required: false },
    ],
  },
];

export const VentaRepository = {
  async findAll(opts: { page?: number; limit?: number; id_estado?: string; fecha_desde?: string; fecha_hasta?: string } = {}): Promise<{ rows: Venta[]; count: number }> {
    const { page = 1, limit = 20, id_estado, fecha_desde, fecha_hasta } = opts;
    const offset = (page - 1) * limit;
    const where: WhereOptions<VentaAttributes> = {};
    if (id_estado) where.id_estado = id_estado;
    if (fecha_desde || fecha_hasta) {
      const fw: Record<string, unknown> = {};
      if (fecha_desde) fw[Op.gte as unknown as string] = fecha_desde;
      if (fecha_hasta) fw[Op.lte as unknown as string] = fecha_hasta;
      (where as Record<string, unknown>)['fecha_venta'] = fw;
    }
    return Venta.findAndCountAll({ where, limit, offset, order: [['fecha_creacion', 'DESC']], include: [{ model: Estado, as: 'estado', required: false }] });
  },

  async findById(id: string): Promise<Venta | null> {
    return Venta.findByPk(id, { include: withAll() });
  },

  async create(data: Omit<VentaAttributes, 'id_venta' | 'fecha_creacion' | 'fecha_actualizacion'>, t?: Transaction): Promise<Venta> {
    return Venta.create(data, { transaction: t });
  },

  async createDetalle(data: VentaDetalleCreationAttributes, t?: Transaction): Promise<VentaDetalle> {
    return VentaDetalle.create(data, { transaction: t });
  },

  async updateEstado(id: string, id_estado: string, extra: Partial<VentaAttributes>, t?: Transaction): Promise<void> {
    await Venta.update({ id_estado, ...extra }, { where: { id_venta: id }, transaction: t });
  },

  async deleteDetalle(id_venta: string, t?: Transaction): Promise<void> {
    await VentaDetalle.destroy({ where: { id_venta }, transaction: t });
  },
};
