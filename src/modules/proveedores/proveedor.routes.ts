import { Router } from 'express';
import { ProveedorController } from './proveedor.controller';
import { authenticateJWT } from '../../middlewares/authenticate';
import { requirePermission } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { createProveedorSchema, updateProveedorSchema } from './proveedor.validation';

const router = Router();
router.use(authenticateJWT);

router.get('/', requirePermission('PROVEEDOR_LISTAR'), ProveedorController.listar);
router.get('/:id', requirePermission('PROVEEDOR_LISTAR'), ProveedorController.obtenerPorId);
router.post('/', requirePermission('PROVEEDOR_CREAR'), validate(createProveedorSchema), ProveedorController.crear);
router.put('/:id', requirePermission('PROVEEDOR_EDITAR'), validate(updateProveedorSchema), ProveedorController.actualizar);
router.patch('/:id/estado', requirePermission('PROVEEDOR_EDITAR'), ProveedorController.cambiarEstado);

export default router;
