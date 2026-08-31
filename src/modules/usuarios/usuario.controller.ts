import { Request, Response, NextFunction } from 'express';
import { UsuarioService } from './usuario.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { AuthenticationError } from '../../utils/errors';

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios del sistema
 */

export const UsuarioController = {
  /**
   * @swagger
   * /usuarios:
   *   get:
   *     summary: Listar usuarios
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 20 }
   *       - in: query
   *         name: search
   *         schema: { type: string }
   *         description: Buscar por nombre, apellido, username o email
   *       - in: query
   *         name: activo
   *         schema: { type: boolean }
   *     responses:
   *       200:
   *         description: Lista paginada de usuarios
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedResponse'
   */
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { usuarios, pagination } = await UsuarioService.listar(
        req.query as Record<string, unknown>,
      );
      sendPaginated(res, usuarios, pagination);
    } catch (error) {
      next(error);
    }
  },

  /**
   * @swagger
   * /usuarios/{id}:
   *   get:
   *     summary: Obtener usuario por ID
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     responses:
   *       200:
   *         description: Datos del usuario
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  async obtenerPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuario = await UsuarioService.obtenerPorId(req.params.id);
      sendSuccess(res, usuario);
    } catch (error) {
      next(error);
    }
  },

  /**
   * @swagger
   * /usuarios:
   *   post:
   *     summary: Crear usuario
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [nombre, apellido, username, email, password]
   *             properties:
   *               nombre: { type: string }
   *               apellido: { type: string }
   *               username: { type: string }
   *               email: { type: string, format: email }
   *               password: { type: string }
   *     responses:
   *       201:
   *         description: Usuario creado
   *       409:
   *         description: Username o email ya en uso
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuario = await UsuarioService.crear(req.body);
      sendCreated(res, usuario, 'Usuario creado correctamente');
    } catch (error) {
      next(error);
    }
  },

  /**
   * @swagger
   * /usuarios/{id}:
   *   put:
   *     summary: Actualizar usuario
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nombre: { type: string }
   *               apellido: { type: string }
   *               username: { type: string }
   *               email: { type: string }
   *     responses:
   *       200:
   *         description: Usuario actualizado
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  async actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuario = await UsuarioService.actualizar(req.params.id, req.body);
      sendSuccess(res, usuario, 'Usuario actualizado correctamente');
    } catch (error) {
      next(error);
    }
  },

  /**
   * @swagger
   * /usuarios/{id}/estado:
   *   patch:
   *     summary: Activar o desactivar usuario
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [activo]
   *             properties:
   *               activo: { type: boolean }
   *     responses:
   *       200:
   *         description: Estado actualizado
   */
  async cambiarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuario = await UsuarioService.cambiarEstado(
        req.params.id,
        Boolean(req.body.activo),
      );
      const msg = usuario.activo ? 'Usuario activado' : 'Usuario desactivado';
      sendSuccess(res, usuario, msg);
    } catch (error) {
      next(error);
    }
  },

  /**
   * @swagger
   * /usuarios/{id}/password:
   *   patch:
   *     summary: Cambiar contraseña del usuario autenticado
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [password_actual, password_nuevo, password_confirmacion]
   *             properties:
   *               password_actual: { type: string }
   *               password_nuevo: { type: string }
   *               password_confirmacion: { type: string }
   *     responses:
   *       200:
   *         description: Contraseña actualizada
   */
  async cambiarPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      // Only allow changing own password (unless admin role check added later)
      const targetId = req.params.id;
      if (req.user.sub !== targetId) {
        return next(new AuthenticationError('Solo puedes cambiar tu propia contraseña'));
      }
      await UsuarioService.cambiarPassword(targetId, req.body);
      sendSuccess(res, null, 'Contraseña actualizada correctamente');
    } catch (error) {
      next(error);
    }
  },

  /**
   * @swagger
   * /usuarios/{id}/roles:
   *   post:
   *     summary: Asignar rol a usuario
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [id_rol]
   *             properties:
   *               id_rol: { type: string, format: uuid }
   *     responses:
   *       200:
   *         description: Rol asignado
   */
  async asignarRol(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await UsuarioService.asignarRol(req.params.id, req.body.id_rol);
      sendSuccess(res, null, 'Rol asignado correctamente');
    } catch (error) {
      next(error);
    }
  },

  /**
   * @swagger
   * /usuarios/{id}/roles/{idRol}:
   *   delete:
   *     summary: Remover rol de usuario
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *       - in: path
   *         name: idRol
   *         required: true
   *         schema: { type: string, format: uuid }
   *     responses:
   *       200:
   *         description: Rol removido
   */
  async removerRol(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await UsuarioService.removerRol(req.params.id, req.params.idRol);
      sendSuccess(res, null, 'Rol removido correctamente');
    } catch (error) {
      next(error);
    }
  },
};
