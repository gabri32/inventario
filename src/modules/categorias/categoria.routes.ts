import { Router } from 'express';
import { CategoriaController } from './categoria.controller';
import { authenticateJWT } from '../../middlewares/authenticate';
import { requirePermission } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { createCategoriaSchema, updateCategoriaSchema } from './categoria.validation';

const router = Router();
router.use(authenticateJWT);

router.get('/', requirePermission('PRODUCTO_LISTAR'), CategoriaController.listar);
router.get('/:id', requirePermission('PRODUCTO_LISTAR'), CategoriaController.obtenerPorId);
router.post('/', requirePermission('PRODUCTO_CREAR'), validate(createCategoriaSchema), CategoriaController.crear);
router.put('/:id', requirePermission('PRODUCTO_EDITAR'), validate(updateCategoriaSchema), CategoriaController.actualizar);
router.patch('/:id/estado', requirePermission('PRODUCTO_EDITAR'), CategoriaController.cambiarEstado);

export default router;
