import { Transaction, Op, WhereOptions } from 'sequelize';
import { Prestamo, PrestamoAttributes, PrestamoDetalle, PrestamoDetalleCreationAttributes } from './prestamo.model';
import { Prestatario } from './prestatario.model';
import { Estado } from '../estados/estado.model';
import { Bien } from '../bienes/bien.model';
import { Producto } from '../productos/producto.model';

const withAll = () => [
  { model: Prestatario, as: 'prestatario', required: false },
  { model: Estado, as: 'estado', required: false },
  {
    model: PrestamoDetalle, as: 'detalle', required: false,
    include: [{ model: Bien, as: 'bien', required: false, include: [{ model: Producto, as: 'producto', required: false }] }],
  },
];

export const PrestamoRepository = {
  async findAll(opts: { page?: number; limit?: number; id_prestatario?: string; id_estado?: string } = {}): Promise<{ rows: Prestamo[]; count: number }> {
    const { page = 1, limit = 20, id_prestatario, id_estado } = opts;
    const offset = (page - 1) * limit;
    const where: WhereOptions<PrestamoAttributes> = {};
    if (id_prestatario) where.id_prestatario = id_prestatario;
    if (id_estado) where.id_estado = id_estado;
    return Prestamo.findAndCountAll({
      where, limit, offset,
      order: [['fecha_creacion', 'DESC']],
      include: [{ model: Prestatario, as: 'prestatario', required: false }, { model: Estado, as: 'estado', required: false }],
    });
  },

  async findById(id: string): Promise<Prestamo | null> {
    return Prestamo.findByPk(id, { include: withAll() });
  },

  async create(data: Omit<PrestamoAttributes, 'id_prestamo' | 'fecha_creacion' | 'fecha_actualizacion'>, t?: Transaction): Promise<Prestamo> {
    return Prestamo.create(data, { transaction: t });
  },

  async createDetalle(data: PrestamoDetalleCreationAttributes, t?: Transaction): Promise<PrestamoDetalle> {
    return PrestamoDetalle.create(data, { transaction: t });
  },

  async findDetalle(id_prestamo: string): Promise<PrestamoDetalle[]> {
    return PrestamoDetalle.findAll({
      where: { id_prestamo },
      include: [{ model: Bien, as: 'bien', required: false }],
    });
  },

  async updateDetalle(id_detalle: string, data: Partial<PrestamoDetalle>, t?: Transaction): Promise<void> {
    await PrestamoDetalle.update(data as Record<string, unknown>, { where: { id_detalle }, transaction: t });
  },

  async updateEstado(id: string, id_estado: string, extra: Partial<PrestamoAttributes>, t?: Transaction): Promise<void> {
    await Prestamo.update({ id_estado, ...extra }, { where: { id_prestamo: id }, transaction: t });
  },

  // Prestatarios
  async findAllPrestatarios(opts: { page?: number; limit?: number; search?: string } = {}): Promise<{ rows: Prestatario[]; count: number }> {
    const { page = 1, limit = 20, search } = opts;
    const offset = (page - 1) * limit;
    const where: Record<string, unknown> = { activo: true };
    if (search) {
      Object.assign(where, {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { apellido: { [Op.iLike]: `%${search}%` } },
          { identificacion: { [Op.iLike]: `%${search}%` } },
        ],
      });
    }
    return Prestatario.findAndCountAll({ where, limit, offset, order: [['nombre', 'ASC']] });
  },

  async findPrestatarioById(id: string): Promise<Prestatario | null> {
    return Prestatario.findByPk(id);
  },

  async createPrestatario(data: Omit<import('./prestatario.model').PrestatarioAttributes, 'id_prestatario' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<Prestatario> {
    return Prestatario.create(data);
  },
};
