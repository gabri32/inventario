import { Op, WhereOptions } from 'sequelize';
import { Bien, BienAttributes } from './bien.model';
import { Producto } from '../productos/producto.model';
import { Categoria } from '../categorias/categoria.model';
import { Estado } from '../estados/estado.model';

export interface BienFindOptions {
  page?: number;
  limit?: number;
  search?: string;
  id_producto?: string;
  id_estado?: string;
  ubicacion?: string;
  activo?: boolean;
}

const defaultIncludes = () => [
  {
    model: Producto,
    as: 'producto',
    required: false,
    include: [{ model: Categoria, as: 'categoria', required: false }],
  },
  { model: Estado, as: 'estado', required: false },
];

export const BienRepository = {
  async findAll(opts: BienFindOptions = {}): Promise<{ rows: Bien[]; count: number }> {
    const { page = 1, limit = 20, search, id_producto, id_estado, ubicacion, activo } = opts;
    const offset = (page - 1) * limit;
    const where: WhereOptions<BienAttributes> = {};

    if (activo !== undefined) where.activo = activo;
    if (id_producto) where.id_producto = id_producto;
    if (id_estado) where.id_estado = id_estado;
    if (ubicacion) Object.assign(where, { ubicacion: { [Op.iLike]: `%${ubicacion}%` } });
    if (search) {
      Object.assign(where, {
        [Op.or]: [
          { codigo_interno: { [Op.iLike]: `%${search}%` } },
          { numero_serie: { [Op.iLike]: `%${search}%` } },
          { ubicacion: { [Op.iLike]: `%${search}%` } },
        ],
      });
    }

    return Bien.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id_bien', 'DESC']],
      include: defaultIncludes(),
    });
  },

  async findById(id: number | string): Promise<Bien | null> {
    return Bien.findByPk(id, { include: defaultIncludes() });
  },

  async findByCodigoInterno(codigo: string, excludeId?: number): Promise<Bien | null> {
    const where: WhereOptions<BienAttributes> = { codigo_interno: codigo };
    if (excludeId) Object.assign(where, { id_bien: { [Op.ne]: excludeId } });
    return Bien.findOne({ where });
  },

  async findDisponibles(id_producto?: string): Promise<Bien[]> {
    // Find bienes with estado DISPONIBLE
    const estadoDisponible = await Estado.findOne({ where: { codigo: 'DISPONIBLE' } });
    if (!estadoDisponible) return [];

    const where: WhereOptions<BienAttributes> = {
      id_estado: estadoDisponible.id_estado,
      activo: true,
    };
    if (id_producto) where.id_producto = id_producto;

    return Bien.findAll({ where, include: defaultIncludes() });
  },

  async create(data: Omit<BienAttributes, 'id_bien' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<Bien> {
    return Bien.create(data);
  },

  async update(id: number, data: Partial<BienAttributes>): Promise<Bien | null> {
    const bien = await Bien.findByPk(id);
    if (!bien) return null;
    return bien.update(data);
  },

  async updateEstado(id: number, id_estado: string, observaciones?: string, usuario?: string): Promise<Bien | null> {
    const bien = await Bien.findByPk(id);
    if (!bien) return null;
    return bien.update({
      id_estado,
      ...(observaciones && { observaciones }),
      ...(usuario && { usuario_actualizacion: usuario }),
    });
  },
};
