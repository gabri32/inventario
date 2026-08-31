import { Router } from 'express';
import { ProductoController } from './producto.controller';
import { authenticateJWT } from '../../middlewares/authenticate';
import { requirePermission } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { createProductoSchema, updateProductoSchema } from './producto.validation';

const router = Router();
router.use(authenticateJWT);

router.get('/', requirePermission('PRODUCTO_LISTAR'), ProductoController.listar);
router.get('/:id', requirePermission('PRODUCTO_LISTAR'), ProductoController.obtenerPorId);
router.post('/', requirePermission('PRODUCTO_CREAR'), validate(createProductoSchema), ProductoController.crear);
router.put('/:id', requirePermission('PRODUCTO_EDITAR'), validate(updateProductoSchema), ProductoController.actualizar);
router.patch('/:id/estado', requirePermission('PRODUCTO_EDITAR'), ProductoController.cambiarEstado);

export default router;
