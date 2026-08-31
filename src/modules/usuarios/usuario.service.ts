import { UsuarioRepository } from './usuario.repository';
import { hashPassword, comparePassword } from '../../utils/bcrypt';
import { ConflictError, NotFoundError, AuthenticationError, BusinessRuleError } from '../../utils/errors';
import { CreateUsuarioDto, UpdateUsuarioDto, ChangePasswordDto } from './usuario.validation';
import { UsuarioPublico } from './usuario.model';
import { buildPagination, PaginationMeta } from '../../utils/response';

export const UsuarioService = {
  async crear(dto: CreateUsuarioDto): Promise<UsuarioPublico> {
    if (await UsuarioRepository.existsByUsername(dto.username)) {
      throw new ConflictError(`El username '${dto.username}' ya está en uso`);
    }
    if (await UsuarioRepository.existsByEmail(dto.email)) {
      throw new ConflictError(`El email '${dto.email}' ya está registrado`);
    }

    const password_hash = await hashPassword(dto.password);
    const usuario = await UsuarioRepository.create({
      nombre: dto.nombre,
      apellido: dto.apellido,
      username: dto.username,
      email: dto.email,
      password_hash,
      activo: true,
    });

    const { password_hash: _pw, ...pub } = usuario.toJSON() as typeof usuario.dataValues;
    return pub as UsuarioPublico;
  },

  async listar(
    query: Record<string, unknown>,
  ): Promise<{ usuarios: UsuarioPublico[]; pagination: PaginationMeta }> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const search = query.search ? String(query.search) : undefined;
    const activo =
      query.activo === 'true' ? true : query.activo === 'false' ? false : undefined;

    const { rows, count } = await UsuarioRepository.findAll({ page, limit, search, activo });

    return {
      usuarios: rows.map((u) => {
        const { password_hash: _pw, ...pub } = u.toJSON() as typeof u.dataValues;
        return pub as UsuarioPublico;
      }),
      pagination: buildPagination(page, limit, count),
    };
  },

  async obtenerPorId(id: string): Promise<UsuarioPublico> {
    const usuario = await UsuarioRepository.findById(id);
    if (!usuario) throw new NotFoundError('Usuario');

    const { password_hash: _pw, ...pub } = usuario.toJSON() as typeof usuario.dataValues;
    return pub as UsuarioPublico;
  },

  async actualizar(id: string, dto: UpdateUsuarioDto): Promise<UsuarioPublico> {
    const existe = await UsuarioRepository.findById(id);
    if (!existe) throw new NotFoundError('Usuario');

    if (dto.username && (await UsuarioRepository.existsByUsername(dto.username, id))) {
      throw new ConflictError(`El username '${dto.username}' ya está en uso`);
    }
    if (dto.email && (await UsuarioRepository.existsByEmail(dto.email, id))) {
      throw new ConflictError(`El email '${dto.email}' ya está registrado`);
    }

    const usuario = await UsuarioRepository.update(id, dto);
    if (!usuario) throw new NotFoundError('Usuario');

    const { password_hash: _pw, ...pub } = usuario.toJSON() as typeof usuario.dataValues;
    return pub as UsuarioPublico;
  },

  async cambiarEstado(id: string, activo: boolean): Promise<UsuarioPublico> {
    const existe = await UsuarioRepository.findById(id);
    if (!existe) throw new NotFoundError('Usuario');

    const usuario = await UsuarioRepository.update(id, { activo });
    if (!usuario) throw new NotFoundError('Usuario');

    const { password_hash: _pw, ...pub } = usuario.toJSON() as typeof usuario.dataValues;
    return pub as UsuarioPublico;
  },

  async cambiarPassword(idUsuario: string, dto: ChangePasswordDto): Promise<void> {
    const usuario = await UsuarioRepository.findByUsernameOrEmail(
      (await UsuarioRepository.findById(idUsuario))?.email ?? '',
    );
    if (!usuario) throw new NotFoundError('Usuario');

    const isValid = await comparePassword(dto.password_actual, usuario.password_hash);
    if (!isValid) {
      throw new AuthenticationError('La contraseña actual es incorrecta');
    }

    if (dto.password_actual === dto.password_nuevo) {
      throw new BusinessRuleError('La nueva contraseña debe ser diferente a la actual');
    }

    const password_hash = await hashPassword(dto.password_nuevo);
    await UsuarioRepository.update(idUsuario, { password_hash });
  },

  async asignarRol(idUsuario: string, idRol: string): Promise<void> {
    const usuario = await UsuarioRepository.findById(idUsuario);
    if (!usuario) throw new NotFoundError('Usuario');
    await UsuarioRepository.assignRol(idUsuario, idRol);
  },

  async removerRol(idUsuario: string, idRol: string): Promise<void> {
    const usuario = await UsuarioRepository.findById(idUsuario);
    if (!usuario) throw new NotFoundError('Usuario');
    await UsuarioRepository.removeRol(idUsuario, idRol);
  },
};
