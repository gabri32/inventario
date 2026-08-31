import { Router, Request, Response, NextFunction } from 'express';
import { InventarioService } from './inventario.service';
import { authenticateJWT } from '../../middlewares/authenticate';
import { requirePermission } from '../../middlewares/authorize';
import { sendSuccess, sendPaginated } from '../../utils/response';

const router = Router();
router.use(authenticateJWT);

router.get('/', requirePermission('INVENTARIO_CONSULTAR'), async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await InventarioService.resumen()); } catch (e) { next(e); }
});

router.get('/alertas', requirePermission('INVENTARIO_CONSULTAR'), async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await InventarioService.alertas()); } catch (e) { next(e); }
});

router.get('/movimientos', requirePermission('INVENTARIO_CONSULTAR'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { movimientos, pagination } = await InventarioService.movimientos(req.query as Record<string, unknown>);
    sendPaginated(res, movimientos, pagination);
  } catch (e) { next(e); }
});

router.get('/productos/:id', requirePermission('INVENTARIO_CONSULTAR'), async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await InventarioService.stockPorProducto(req.params.id)); } catch (e) { next(e); }
});

export default router;
