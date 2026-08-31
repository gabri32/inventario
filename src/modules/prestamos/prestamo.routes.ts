import { Router } from 'express';
import { PrestamoController } from './prestamo.controller';
import { authenticateJWT } from '../../middlewares/authenticate';
import { requirePermission } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { createPrestamoSchema, devolucionSchema, createPrestatarioSchema } from './prestamo.validation';

const router = Router();
router.use(authenticateJWT);

// Prestatarios
router.get('/prestatarios', requirePermission('PRESTAMO_LISTAR'), PrestamoController.listarPrestatarios);
router.post('/prestatarios', requirePermission('PRESTAMO_CREAR'), validate(createPrestatarioSchema), PrestamoController.crearPrestatario);

// Préstamos
router.get('/', requirePermission('PRESTAMO_LISTAR'), PrestamoController.listar);
router.post('/', requirePermission('PRESTAMO_CREAR'), validate(createPrestamoSchema), PrestamoController.crear);
router.get('/:id', requirePermission('PRESTAMO_LISTAR'), PrestamoController.obtenerPorId);
router.post('/:id/devolver', requirePermission('PRESTAMO_DEVOLVER'), validate(devolucionSchema), PrestamoController.devolver);

export default router;
