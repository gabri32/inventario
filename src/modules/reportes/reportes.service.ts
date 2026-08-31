import { sequelize } from '../../database/models';
import { QueryTypes } from 'sequelize';
import { Bien } from '../bienes/bien.model';
import { Producto } from '../productos/producto.model';
import { Categoria } from '../categorias/categoria.model';
import { Estado } from '../estados/estado.model';
import { Movimiento } from '../movimientos/movimiento.model';
import { Prestamo } from '../prestamos/prestamo.model';
import { Prestatario } from '../prestamos/prestatario.model';
import { PrestamoDetalle } from '../prestamos/prestamo.model';
import { MovimientoRepository } from '../movimientos/movimiento.repository';

const schema = process.env.DB_SCHEMA ?? 'administracion';

export const ReportesService = {
  async inventarioActual(query: Record<string, unknown>) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 100);
    const offset = (page - 1) * limit;

    const { rows, count } = await Bien.findAndCountAll({
      where: { activo: true },
      limit, offset,
      order: [['id_bien', 'ASC']],
      include: [
        {
          model: Producto, as: 'producto', required: false,
          include: [{ model: Categoria, as: 'categoria', required: false }],
        },
        { model: Estado, as: 'estado', required: false },
      ],
    });

    return { bienes: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } };
  },

  async inventarioPorCategoria() {
    const data = await sequelize.query(`
      SELECT
        c.nombre AS categoria,
        e.codigo AS estado,
        COUNT(b.id_bien)::int AS cantidad
      FROM "${schema}"."bienes" b
      JOIN "${schema}"."productos" p ON p.id_producto = b.id_producto
      LEFT JOIN "${schema}"."categorias" c ON c.id_categoria = p.id_categoria
      JOIN "${schema}"."estados" e ON e.id_estado = b.id_estado
      WHERE b.activo = true
      GROUP BY c.nombre, e.codigo
      ORDER BY c.nombre, e.codigo
    `, { type: QueryTypes.SELECT });
    return data;
  },

  async prestamosActivos() {
    return Prestamo.findAll({
      include: [
        { model: Prestatario, as: 'prestatario', required: false },
        { model: Estado, as: 'estado', required: true, where: { codigo: 'ACTIVO' } },
        {
          model: PrestamoDetalle, as: 'detalle', required: false,
          include: [{ model: Bien, as: 'bien', required: false }],
        },
      ],
      order: [['fecha_vencimiento', 'ASC']],
    });
  },

  async prestamosVencidos() {
    const estadoVencido = await Estado.findOne({ where: { codigo: 'VENCIDO' } });
    const estadoActivo = await Estado.findOne({ where: { codigo: 'ACTIVO' } });

    if (!estadoActivo) return [];

    // Prestamos ACTIVO con fecha_vencimiento pasada
    const ahora = new Date();
    return Prestamo.findAll({
      where: {
        id_estado: estadoActivo.id_estado,
      },
      include: [
        { model: Prestatario, as: 'prestatario', required: false },
        { model: Estado, as: 'estado', required: false },
        {
          model: PrestamoDetalle, as: 'detalle', required: false,
          include: [{ model: Bien, as: 'bien', required: false }],
        },
      ],
      having: sequelize.literal(`"Prestamo"."fecha_vencimiento" < '${ahora.toISOString()}'`),
      order: [['fecha_vencimiento', 'ASC']],
    }).catch(() => {
      // Fallback with raw query if HAVING fails
      return sequelize.query(`
        SELECT p.* FROM "${schema}"."prestamos" p
        JOIN "${schema}"."estados" e ON e.id_estado = p.id_estado
        WHERE e.codigo = 'ACTIVO'
          AND p.fecha_vencimiento < NOW()
        ORDER BY p.fecha_vencimiento ASC
      `, { type: QueryTypes.SELECT });
    });
  },

  async historialBien(id_bien: number) {
    return MovimientoRepository.findByBien(id_bien);
  },

  async movimientosPorPeriodo(query: Record<string, unknown>) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 100);
    const { rows, count } = await MovimientoRepository.findAll({
      page, limit,
      id_producto: query.id_producto as string,
      tipo_movimiento: query.tipo_movimiento as string,
      fecha_desde: query.fecha_desde as string,
      fecha_hasta: query.fecha_hasta as string,
    });
    return { movimientos: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } };
  },

  async bienesPorUbicacion() {
    return sequelize.query(`
      SELECT
        COALESCE(b.ubicacion, 'Sin ubicación') AS ubicacion,
        e.codigo AS estado,
        COUNT(b.id_bien)::int AS cantidad
      FROM "${schema}"."bienes" b
      JOIN "${schema}"."estados" e ON e.id_estado = b.id_estado
      WHERE b.activo = true
      GROUP BY b.ubicacion, e.codigo
      ORDER BY b.ubicacion, e.codigo
    `, { type: QueryTypes.SELECT });
  },

  async bienesPrestadosPorPersona(id_prestatario?: string) {
    const whereClause = id_prestatario
      ? `AND pr.id_prestatario = '${id_prestatario}'`
      : '';

    return sequelize.query(`
      SELECT
        per.nombre || ' ' || COALESCE(per.apellido, '') AS prestatario,
        per.identificacion,
        per.tipo,
        COUNT(pd.id_bien)::int AS bienes_prestados,
        pr.fecha_prestamo,
        pr.fecha_vencimiento
      FROM "${schema}"."prestamos" pr
      JOIN "${schema}"."prestatarios" per ON per.id_prestatario = pr.id_prestatario
      JOIN "${schema}"."prestamos_detalle" pd ON pd.id_prestamo = pr.id_prestamo
      JOIN "${schema}"."estados" e ON e.id_estado = pr.id_estado
      WHERE e.codigo IN ('ACTIVO', 'PARCIALMENTE_DEVUELTO')
      ${whereClause}
        AND pd.fecha_devolucion IS NULL
      GROUP BY per.nombre, per.apellido, per.identificacion, per.tipo,
               pr.fecha_prestamo, pr.fecha_vencimiento
      ORDER BY pr.fecha_vencimiento ASC
    `, { type: QueryTypes.SELECT });
  },
};
