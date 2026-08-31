import { Request, Response, NextFunction } from 'express';
import { AuthorizationError, AuthenticationError } from '../utils/errors';

/**
 * Verifica que el usuario autenticado tenga al menos uno de los roles requeridos.
 * Los roles se consultan mediante la relación usuario → usuario_rol → rol.
 */
export const requireRole = (...roles: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new AuthenticationError());
      }

      // Dynamic import to avoid circular dependencies
      const { UsuarioRepository } = await import('../modules/usuarios/usuario.repository');
      const userWithRoles = await UsuarioRepository.findByIdWithRolesAndPermissions(
        req.user.sub,
      );

      if (!userWithRoles) {
        return next(new AuthenticationError('Usuario no encontrado'));
      }

      const userRoles = userWithRoles.roles?.map((r: { nombre: string }) => r.nombre) ?? [];
      const hasRole = roles.some((role) => userRoles.includes(role));

      if (!hasRole) {
        return next(
          new AuthorizationError(
            `Se requiere uno de los siguientes roles: ${roles.join(', ')}`,
          ),
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Verifica que el usuario autenticado tenga el permiso específico requerido.
 * Los permisos se consultan mediante: usuario → usuario_rol → rol → rol_permiso → permiso
 */
export const requirePermission = (...permissions: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new AuthenticationError());
      }

      const { UsuarioRepository } = await import('../modules/usuarios/usuario.repository');
      const userWithRoles = await UsuarioRepository.findByIdWithRolesAndPermissions(
        req.user.sub,
      );

      if (!userWithRoles) {
        return next(new AuthenticationError('Usuario no encontrado'));
      }

      const userPermissions = new Set<string>();

      for (const rol of userWithRoles.roles ?? []) {
        for (const permiso of rol.permisos ?? []) {
          userPermissions.add(permiso.nombre);
        }
      }
      
      const hasPermission = permissions.some((p) => userPermissions.has(p));

      if (!hasPermission) {
        return next(
          new AuthorizationError(
            `Permisos requeridos: ${permissions.join(' o ')}`,
          ),
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
