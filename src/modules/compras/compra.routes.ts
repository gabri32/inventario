import { Router } from 'express';
import { CompraController } from './compra.controller';
import { authenticateJWT } from '../../middlewares/authenticate';
import { requirePermission } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { createCompraSchema, updateCompraSchema } from './compra.validation';

const router = Router();
router.use(authenticateJWT);

router.get('/', requirePermission('COMPRA_LISTAR'), CompraController.listar);
router.post('/', requirePermission('COMPRA_CREAR'), validate(createCompraSchema), CompraController.crear);
router.get('/:id', requirePermission('COMPRA_LISTAR'), CompraController.obtenerPorId);
router.put('/:id', requirePermission('COMPRA_CREAR'), validate(updateCompraSchema), CompraController.actualizar);
router.post('/:id/confirmar', requirePermission('COMPRA_CREAR'), CompraController.confirmar);
router.post('/:id/anular', requirePermission('COMPRA_ANULAR'), CompraController.anular);

export default router;
