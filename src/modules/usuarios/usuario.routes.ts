import { Router } from 'express';
import { UsuarioController } from './usuario.controller';
import { authenticateJWT } from '../../middlewares/authenticate';
import { requirePermission } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import {
  createUsuarioSchema,
  updateUsuarioSchema,
  changePasswordSchema,
  asignarRolSchema,
} from './usuario.validation';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

router.get('/', requirePermission('USUARIO_LISTAR'), UsuarioController.listar);
router.get('/:id', requirePermission('USUARIO_LISTAR'), UsuarioController.obtenerPorId);
router.post('/', requirePermission('USUARIO_CREAR'), validate(createUsuarioSchema), UsuarioController.crear);
router.put('/:id', requirePermission('USUARIO_EDITAR'), validate(updateUsuarioSchema), UsuarioController.actualizar);
router.patch('/:id/estado', requirePermission('USUARIO_EDITAR'), UsuarioController.cambiarEstado);
router.patch('/:id/password', validate(changePasswordSchema), UsuarioController.cambiarPassword);
router.post('/:id/roles', requirePermission('USUARIO_EDITAR'), validate(asignarRolSchema), UsuarioController.asignarRol);
router.delete('/:id/roles/:idRol', requirePermission('USUARIO_EDITAR'), UsuarioController.removerRol);

export default router;
