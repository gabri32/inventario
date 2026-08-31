import { Transaction, WhereOptions, Op } from 'sequelize';
import { Movimiento, MovimientoAttributes, MovimientoCreationAttributes } from './movimiento.model';
import { Producto } from '../productos/producto.model';
import { Bien } from '../bienes/bien.model';

export interface MovimientoFindOptions {
  page?: number;
  limit?: number;
  id_producto?: string;
  id_bien?: number;
  tipo_movimiento?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  usuario?: string;
}

export const MovimientoRepository = {
  async create(
    data: MovimientoCreationAttributes,
    transaction?: Transaction,
  ): Promise<Movimiento> {
    return Movimiento.create(data, { transaction });
  },

  async findAll(opts: MovimientoFindOptions = {}): Promise<{ rows: Movimiento[]; count: number }> {
    const { page = 1, limit = 20, id_producto, id_bien, tipo_movimiento, fecha_desde, fecha_hasta, usuario } = opts;
    const offset = (page - 1) * limit;
    const where: WhereOptions<MovimientoAttributes> = {};

    if (id_producto) where.id_producto = id_producto;
    if (id_bien) where.id_bien = id_bien;
    if (tipo_movimiento) where.tipo_movimiento = tipo_movimiento;
    if (usuario) where.usuario_creacion = usuario;
    if (fecha_desde || fecha_hasta) {
      const fechaWhere: Record<string, unknown> = {};
      if (fecha_desde) fechaWhere[Op.gte as unknown as string] = new Date(fecha_desde);
      if (fecha_hasta) fechaWhere[Op.lte as unknown as string] = new Date(fecha_hasta);
      (where as Record<string, unknown>)['fecha_creacion'] = fechaWhere;
    }

    return Movimiento.findAndCountAll({
      where,
      limit,
      offset,
      order: [['fecha_creacion', 'DESC']],
      include: [
        { model: Producto, as: 'producto', required: false },
        { model: Bien, as: 'bien', required: false },
      ],
    });
  },

  async findByBien(id_bien: number): Promise<Movimiento[]> {
    return Movimiento.findAll({
      where: { id_bien },
      order: [['fecha_creacion', 'ASC']],
      include: [{ model: Producto, as: 'producto', required: false }],
    });
  },

  async findByProducto(id_producto: string, limit = 50): Promise<Movimiento[]> {
    return Movimiento.findAll({
      where: { id_producto },
      order: [['fecha_creacion', 'DESC']],
      limit,
    });
  },
};
