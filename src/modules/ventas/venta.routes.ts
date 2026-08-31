import { Router } from 'express';
import { VentaController } from './venta.controller';
import { authenticateJWT } from '../../middlewares/authenticate';
import { requirePermission } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { createVentaSchema, updateVentaSchema } from './venta.validation';

const router = Router();
router.use(authenticateJWT);

router.get('/', requirePermission('VENTA_LISTAR'), VentaController.listar);
router.post('/', requirePermission('VENTA_CREAR'), validate(createVentaSchema), VentaController.crear);
router.get('/:id', requirePermission('VENTA_LISTAR'), VentaController.obtenerPorId);
router.put('/:id', requirePermission('VENTA_CREAR'), validate(updateVentaSchema), VentaController.actualizar);
router.post('/:id/confirmar', requirePermission('VENTA_CREAR'), VentaController.confirmar);
router.post('/:id/anular', requirePermission('VENTA_ANULAR'), VentaController.anular);

export default router;
