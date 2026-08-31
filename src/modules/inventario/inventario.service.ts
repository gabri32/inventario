import { sequelize } from '../../database/models';
import { Bien } from '../bienes/bien.model';
import { Producto } from '../productos/producto.model';
import { Categoria } from '../categorias/categoria.model';
import { Estado } from '../estados/estado.model';
import { Movimiento } from '../movimientos/movimiento.model';
import { Prestamo } from '../prestamos/prestamo.model';
import { Prestatario } from '../prestamos/prestatario.model';
import { PrestamoDetalle } from '../prestamos/prestamo.model';
import { QueryTypes } from 'sequelize';

export const InventarioService = {
  async resumen() {
    const schema = process.env.DB_SCHEMA ?? 'administracion';

   const rows = await sequelize.query<{ codigo: string; cantidad: number }>(`
  SELECT
    e.codigo,
    COUNT(b.id_bien)::int AS cantidad
  FROM "${schema}"."bienes" b
  JOIN "${schema}"."estados" e ON e.id_estado = b.id_estado
  WHERE b.activo = true
  GROUP BY e.codigo
`, { type: QueryTypes.SELECT });

    const totalesPorEstado: Record<string, number> = {};
    let totalBienes = 0;
    for (const r of rows) {
      totalesPorEstado[r.codigo] = r.cantidad;
      totalBienes += r.cantidad;
    }

    const totalProductos = await Producto.count({ where: { activo: true } });

    return {
      totalProductos,
      totalBienes,
      disponibles: totalesPorEstado['DISPONIBLE'] ?? 0,
      prestados: totalesPorEstado['PRESTADO'] ?? 0,
      enReparacion: totalesPorEstado['EN_REPARACION'] ?? 0,
      vendidos: totalesPorEstado['VENDIDO'] ?? 0,
      dañados: totalesPorEstado['DAÑADO'] ?? 0,
      perdidos: totalesPorEstado['PERDIDO'] ?? 0,
      baja: totalesPorEstado['BAJA'] ?? 0,
    };
  },

  async stockPorProducto(id_producto: string) {
    const schema = process.env.DB_SCHEMA ?? 'administracion';
    const producto = await Producto.findByPk(id_producto, {
      include: [{ model: Categoria, as: 'categoria', required: false }],
    });
    if (!producto) return null;

    const [rows] = await sequelize.query(`
      SELECT e.codigo, COUNT(b.id_bien)::int AS cantidad
      FROM "${schema}"."bienes" b
      JOIN "${schema}"."estados" e ON e.id_estado = b.id_estado
      WHERE b.id_producto = '${id_producto}' AND b.activo = true
      GROUP BY e.codigo
    `, { type: QueryTypes.SELECT }) as [Array<{ codigo: string; cantidad: number }>];

    const stock: Record<string, number> = {};
    for (const r of rows) stock[r.codigo] = r.cantidad;

    return { producto, stock };
  },

  async alertas() {
    const schema = process.env.DB_SCHEMA ?? 'administracion';
    // Products with available bienes below stock_minimo
    const alertas = await sequelize.query(`
      SELECT
        p.id_producto,
        p.nombre,
        p.codigo_producto,
        p.stock_minimo,
        COUNT(b.id_bien)::int AS stock_disponible
      FROM "${schema}"."productos" p
      LEFT JOIN "${schema}"."bienes" b ON b.id_producto = p.id_producto
        AND b.activo = true
        AND b.id_estado IN (
          SELECT id_estado FROM "${schema}"."estados" WHERE codigo = 'DISPONIBLE'
        )
      WHERE p.activo = true AND p.stock_minimo > 0
      GROUP BY p.id_producto, p.nombre, p.codigo_producto, p.stock_minimo
      HAVING COUNT(b.id_bien) <= p.stock_minimo
      ORDER BY stock_disponible ASC
    `, { type: QueryTypes.SELECT });

    return alertas;
  },

  async movimientos(query: Record<string, unknown>) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const offset = (page - 1) * limit;

    const { rows, count } = await Movimiento.findAndCountAll({
      limit, offset,
      order: [['fecha_creacion', 'DESC']],
      include: [{ model: Producto, as: 'producto', required: false }],
    });

    return {
      movimientos: rows,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  },
};
