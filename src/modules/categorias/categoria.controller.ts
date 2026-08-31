import { Request, Response, NextFunction } from 'express';
import { CategoriaService } from './categoria.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { AuthenticationError } from '../../utils/errors';

export const CategoriaController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await CategoriaService.listar(req.query as Record<string, unknown>);
      sendSuccess(res, data);
    } catch (e) { next(e); }
  },

  async obtenerPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await CategoriaService.obtenerPorId(req.params.id);
      sendSuccess(res, data);
    } catch (e) { next(e); }
  },

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      const data = await CategoriaService.crear(req.body, req.user.sub);
      sendCreated(res, data, 'Categoría creada correctamente');
    } catch (e) { next(e); }
  },

  async actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      const data = await CategoriaService.actualizar(req.params.id, req.body, req.user.sub);
      sendSuccess(res, data, 'Categoría actualizada correctamente');
    } catch (e) { next(e); }
  },

  async cambiarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await CategoriaService.cambiarEstado(req.params.id, Boolean(req.body.activo));
      sendSuccess(res, data, data?.activo ? 'Categoría activada' : 'Categoría desactivada');
    } catch (e) { next(e); }
  },
};
