import { Router, Request, Response, NextFunction } from 'express';
import { EstadoRepository } from './estado.repository';
import { authenticateJWT } from '../../middlewares/authenticate';
import { sendSuccess } from '../../utils/response';

const router = Router();
router.use(authenticateJWT);

router.get('/:modulo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const estados = await EstadoRepository.findByModulo(req.params.modulo.toUpperCase());
    sendSuccess(res, estados);
  } catch (e) {
    next(e);
  }
});

export default router;
