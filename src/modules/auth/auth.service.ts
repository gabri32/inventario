import { UsuarioRepository } from '../usuarios/usuario.repository';
import { comparePassword } from '../../utils/bcrypt';
import { signToken } from '../../utils/jwt';
import { AuthenticationError } from '../../utils/errors';
import { LoginDto } from './auth.validation';
import { UsuarioPublico } from '../usuarios/usuario.model';

export interface LoginResult {
  token: string;
  usuario: UsuarioPublico;
  roles: string[];
  permisos: string[];
}

export const AuthService = {
  async login(dto: LoginDto): Promise<LoginResult> {
    // Find user with password (scoped query)
    const usuario = await UsuarioRepository.findByUsernameOrEmail(dto.identifier);

    if (!usuario) {
      // Constant-time comparison to prevent user enumeration
      await comparePassword('dummy', '$2a$12$dummyhashfortimingattackprevention123456789012');
      throw new AuthenticationError('Credenciales incorrectas');
    }

    if (!usuario.activo) {
      throw new AuthenticationError('Cuenta desactivada. Contacta al administrador');
    }

    const isPasswordValid = await comparePassword(dto.password, usuario.password_hash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Credenciales incorrectas');
    }

    // Update last access
    await UsuarioRepository.updateLastAccess(usuario.id_usuario);

    // Get user with roles and permissions for token
    const usuarioConRoles = await UsuarioRepository.findByIdWithRolesAndPermissions(
      usuario.id_usuario,
    );

    const roles = usuarioConRoles?.roles?.map((r) => r.nombre) ?? [];
    const permisos = new Set<string>();
    for (const rol of usuarioConRoles?.roles ?? []) {
      for (const permiso of rol.permisos ?? []) {
        permisos.add(permiso.nombre);
      }
    }

    const token = signToken({
      sub: usuario.id_usuario,
      username: usuario.username,
      email: usuario.email,
    });

    const { password_hash: _pw, ...usuarioPublico } = usuario.toJSON() as typeof usuario.dataValues;

    return {
      token,
      usuario: usuarioPublico as UsuarioPublico,
      roles,
      permisos: Array.from(permisos),
    };
  },

  async me(idUsuario: string): Promise<UsuarioPublico & { roles: string[]; permisos: string[] }> {
    const usuario = await UsuarioRepository.findByIdWithRolesAndPermissions(idUsuario);

    if (!usuario) {
      throw new AuthenticationError('Usuario no encontrado');
    }

    const roles = usuario.roles?.map((r) => r.nombre) ?? [];
    const permisos = new Set<string>();
    for (const rol of usuario.roles ?? []) {
      for (const permiso of rol.permisos ?? []) {
        permisos.add(permiso.nombre);
      }
    }

    const { password_hash: _pw, ...pub } = usuario.toJSON() as typeof usuario.dataValues;

    return {
      ...(pub as UsuarioPublico),
      roles,
      permisos: Array.from(permisos),
    };
  },
};
