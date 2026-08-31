import { Router } from 'express';
import { BienController } from './bien.controller';
import { authenticateJWT } from '../../middlewares/authenticate';
import { requirePermission } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import {
  createBienSchema,
  updateBienSchema,
  cambiarEstadoBienSchema,
  createMasivaSchema,
} from './bien.validation';

const router = Router();
router.use(authenticateJWT);

// Special routes first
router.get('/disponibles', requirePermission('BIEN_LISTAR'), BienController.disponibles);
router.post('/masivo', requirePermission('BIEN_CREAR'), validate(createMasivaSchema), BienController.crearMasivo);

// Standard CRUD
router.get('/', requirePermission('BIEN_LISTAR'), BienController.listar);
router.post('/', requirePermission('BIEN_CREAR'), validate(createBienSchema), BienController.crear);
router.get('/:id', requirePermission('BIEN_LISTAR'), BienController.obtenerPorId);
router.put('/:id', requirePermission('BIEN_EDITAR'), validate(updateBienSchema), BienController.actualizar);
router.patch('/:id/estado', requirePermission('BIEN_EDITAR'), validate(cambiarEstadoBienSchema), BienController.cambiarEstado);

// Historial y códigos de barras
router.get('/:id/historial', requirePermission('BIEN_LISTAR'), BienController.historial);
router.get('/:id/codigo-barras', requirePermission('BIEN_LISTAR'), BienController.codigoBarrasDatos);
router.get('/:id/codigo-barras/imagen', requirePermission('BIEN_LISTAR'), BienController.codigoBarrasImagen);
router.get('/:id/codigo-barras/pdf', requirePermission('BIEN_LISTAR'), BienController.codigoBarrasPdf);

export default router;
