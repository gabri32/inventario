import { Router, Request, Response, NextFunction } from 'express';
import { AuditoriaService } from './auditoria.service';
import { authenticateJWT } from '../../middlewares/authenticate';
import { requirePermission } from '../../middlewares/authorize';
import { sendPaginated } from '../../utils/response';

const router = Router();
router.use(authenticateJWT);

router.get('/', requirePermission('AUDITORIA_CONSULTAR'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { registros, pagination } = await AuditoriaService.listar(req.query as Record<string, unknown>);
    sendPaginated(res, registros, pagination);
  } catch (e) { next(e); }
});

export default router;
