import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../../middlewares/authenticate';
import { requirePermission } from '../../middlewares/authorize';
import { sendSuccess } from '../../utils/response';
import { InventarioService } from '../inventario/inventario.service';
import { sequelize } from '../../database/models';
import { QueryTypes } from 'sequelize';

const router = Router();
router.use(authenticateJWT);

router.get('/resumen', requirePermission('DASHBOARD_CONSULTAR'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = process.env.DB_SCHEMA ?? 'administracion';
    const resumen = await InventarioService.resumen();
    const alertas = await InventarioService.alertas();

    // Prestamos vencidos (ACTIVO con fecha_vencimiento < NOW)
    const [vencidos] = await sequelize.query(`
      SELECT COUNT(*)::int AS total
      FROM "${schema}"."prestamos" p
      JOIN "${schema}"."estados" e ON e.id_estado = p.id_estado
      WHERE e.codigo = 'ACTIVO' AND p.fecha_vencimiento < NOW()
    `, { type: QueryTypes.SELECT }) as [{ total: number }[]];

    sendSuccess(res, {
      productos: resumen.totalProductos,
      bienes: resumen.totalBienes,
      disponibles: resumen.disponibles,
      prestados: resumen.prestados,
      enReparacion: resumen.enReparacion,
      vendidos: resumen.vendidos,
      alertasStock: (alertas as unknown[]).length,
      prestamosVencidos: (vencidos as unknown as { total: number })?.total ?? 0,
    });
  } catch (e) { next(e); }
});

router.get('/movimientos-recientes', requirePermission('DASHBOARD_CONSULTAR'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { movimientos } = await InventarioService.movimientos({ page: 1, limit: 10 });
    sendSuccess(res, movimientos);
  } catch (e) { next(e); }
});

router.get('/prestamos-proximos', requirePermission('DASHBOARD_CONSULTAR'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = process.env.DB_SCHEMA ?? 'administracion';
    const proximos = await sequelize.query(`
      SELECT
        p.id_prestamo,
        p.fecha_vencimiento,
        per.nombre || ' ' || COALESCE(per.apellido,'') AS prestatario,
        COUNT(pd.id_detalle)::int AS bienes
      FROM "${schema}"."prestamos" p
      JOIN "${schema}"."prestatarios" per ON per.id_prestatario = p.id_prestatario
      LEFT JOIN "${schema}"."prestamos_detalle" pd ON pd.id_prestamo = p.id_prestamo
      JOIN "${schema}"."estados" e ON e.id_estado = p.id_estado
      WHERE e.codigo = 'ACTIVO'
        AND p.fecha_vencimiento BETWEEN NOW() AND NOW() + INTERVAL '7 days'
      GROUP BY p.id_prestamo, p.fecha_vencimiento, per.nombre, per.apellido
      ORDER BY p.fecha_vencimiento ASC
      LIMIT 10
    `, { type: QueryTypes.SELECT });
    sendSuccess(res, proximos);
  } catch (e) { next(e); }
});

export default router;
