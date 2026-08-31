import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess } from '../../utils/response';
import { AuthenticationError } from '../../utils/errors';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación y autorización
 */

export const AuthController = {
  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Iniciar sesión
   *     tags: [Auth]
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [identifier, password]
   *             properties:
   *               identifier:
   *                 type: string
   *                 description: Username o email del usuario
   *                 example: admin
   *               password:
   *                 type: string
   *                 description: Contraseña del usuario
   *                 example: Admin1234!
   *     responses:
   *       200:
   *         description: Login exitoso
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         token:
   *                           type: string
   *                         usuario:
   *                           type: object
   *                         roles:
   *                           type: array
   *                           items:
   *                             type: string
   *                         permisos:
   *                           type: array
   *                           items:
   *                             type: string
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      sendSuccess(res, result, 'Sesión iniciada correctamente');
    } catch (error) {
      next(error);
    }
  },

  /**
   * @swagger
   * /auth/me:
   *   get:
   *     summary: Obtener usuario autenticado
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Datos del usuario autenticado con roles y permisos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   */
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AuthenticationError());
      }
      const result = await AuthService.me(req.user.sub);
      sendSuccess(res, result, 'Datos del usuario autenticado');
    } catch (error) {
      next(error);
    }
  },

  /**
   * @swagger
   * /auth/logout:
   *   post:
   *     summary: Cerrar sesión
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Sesión cerrada correctamente
   */
  async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // JWT is stateless: client discards the token.
      // In future phases: add token to revocation list.
      sendSuccess(res, null, 'Sesión cerrada correctamente');
    } catch (error) {
      next(error);
    }
  },
};
