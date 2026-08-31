import { Router, Request, Response, NextFunction } from 'express';
import { MovimientoRepository } from './movimiento.repository';
import { authenticateJWT } from '../../middlewares/authenticate';
import { requirePermission } from '../../middlewares/authorize';
import { sendPaginated } from '../../utils/response';
import { buildPagination } from '../../utils/response';

const router = Router();
router.use(authenticateJWT);

router.get('/', requirePermission('INVENTARIO_CONSULTAR'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const { rows, count } = await MovimientoRepository.findAll({
      page, limit,
      id_producto: req.query.id_producto as string,
      tipo_movimiento: req.query.tipo_movimiento as string,
      fecha_desde: req.query.fecha_desde as string,
      fecha_hasta: req.query.fecha_hasta as string,
      usuario: req.query.usuario as string,
    });
    sendPaginated(res, rows, buildPagination(page, limit, count));
  } catch (e) { next(e); }
});

export default router;
