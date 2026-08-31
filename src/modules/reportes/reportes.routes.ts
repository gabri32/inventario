import { Router, Request, Response, NextFunction } from 'express';
import { ReportesService } from './reportes.service';
import { authenticateJWT } from '../../middlewares/authenticate';
import { requirePermission } from '../../middlewares/authorize';
import { sendSuccess, sendPaginated } from '../../utils/response';

const router = Router();
router.use(authenticateJWT);
router.use(requirePermission('REPORTES_CONSULTAR'));

router.get('/inventario', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bienes, pagination } = await ReportesService.inventarioActual(req.query as Record<string, unknown>);
    sendPaginated(res, bienes, pagination);
  } catch (e) { next(e); }
});

router.get('/inventario/categoria', async (_req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await ReportesService.inventarioPorCategoria()); } catch (e) { next(e); }
});

router.get('/prestamos/activos', async (_req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await ReportesService.prestamosActivos()); } catch (e) { next(e); }
});

router.get('/prestamos/vencidos', async (_req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await ReportesService.prestamosVencidos()); } catch (e) { next(e); }
});

router.get('/prestamos/por-persona', async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await ReportesService.bienesPrestadosPorPersona(req.query.id_prestatario as string)); }
  catch (e) { next(e); }
});

router.get('/bienes/:id/historial', async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await ReportesService.historialBien(parseInt(req.params.id, 10))); }
  catch (e) { next(e); }
});

router.get('/movimientos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { movimientos, pagination } = await ReportesService.movimientosPorPeriodo(req.query as Record<string, unknown>);
    sendPaginated(res, movimientos, pagination);
  } catch (e) { next(e); }
});

router.get('/bienes/ubicacion', async (_req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await ReportesService.bienesPorUbicacion()); } catch (e) { next(e); }
});

export default router;
