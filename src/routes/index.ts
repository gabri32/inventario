import { Router, Request, Response } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import usuarioRoutes from '../modules/usuarios/usuario.routes';
import categoriaRoutes from '../modules/categorias/categoria.routes';
import productoRoutes from '../modules/productos/producto.routes';
import bienRoutes from '../modules/bienes/bien.routes';
import estadoRoutes from '../modules/estados/estado.routes';
import proveedorRoutes from '../modules/proveedores/proveedor.routes';
import compraRoutes from '../modules/compras/compra.routes';
import movimientoRoutes from '../modules/movimientos/movimiento.routes';
import prestamoRoutes from '../modules/prestamos/prestamo.routes';
import ventaRoutes from '../modules/ventas/venta.routes';
import inventarioRoutes from '../modules/inventario/inventario.routes';
import reportesRoutes from '../modules/reportes/reportes.routes';
import dashboardRoutes from '../modules/dashboard/dashboard.routes';
import auditoriaRoutes from '../modules/auditoria/auditoria.routes';
import { authenticateJWT } from '../middlewares/authenticate';
import { BienService } from '../modules/bienes/bien.service';
import { sendSuccess } from '../utils/response';
import { NextFunction } from 'express';

const router = Router();

// ─── Health check ─────────────────────────────────────────────────────────────
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check del servidor
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Servidor en línea',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV ?? 'development',
      version: process.env.npm_package_version ?? '1.0.0',
    },
  });
});

// ─── Auth & Usuarios ──────────────────────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);

// ─── Catálogos ────────────────────────────────────────────────────────────────
router.use('/categorias', categoriaRoutes);
router.use('/estados', estadoRoutes);

// ─── Productos & Bienes ───────────────────────────────────────────────────────
router.use('/productos', productoRoutes);
router.use('/bienes', bienRoutes);

// ─── Código de barras global (buscar por código) ──────────────────────────────
router.get('/codigos-barras/:codigo', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await BienService.buscarPorCodigo(req.params.codigo);
    sendSuccess(res, data);
  } catch (e) { next(e); }
});

// ─── Proveedores & Compras ────────────────────────────────────────────────────
router.use('/proveedores', proveedorRoutes);
router.use('/compras', compraRoutes);

// ─── Movimientos ──────────────────────────────────────────────────────────────
router.use('/movimientos', movimientoRoutes);

// ─── Préstamos & Ventas ───────────────────────────────────────────────────────
router.use('/prestamos', prestamoRoutes);
router.use('/ventas', ventaRoutes);

// ─── Inventario ───────────────────────────────────────────────────────────────
router.use('/inventario', inventarioRoutes);

// ─── Reportes ─────────────────────────────────────────────────────────────────
router.use('/reportes', reportesRoutes);

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.use('/dashboard', dashboardRoutes);

// ─── Auditoría ────────────────────────────────────────────────────────────────
router.use('/auditoria', auditoriaRoutes);

export default router;
