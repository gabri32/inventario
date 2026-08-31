import { Op, WhereOptions } from 'sequelize';
import { Usuario, UsuarioAttributes } from './usuario.model';
import { Rol } from '../roles/rol.model';
import { Permiso } from '../permisos/permiso.model';

export interface UsuarioFindOptions {
  page?: number;
  limit?: number;
  search?: string;
  activo?: boolean;
}

export const UsuarioRepository = {
  async findById(id: string): Promise<Usuario | null> {
    return Usuario.findByPk(id);
  },

  async findByIdWithRolesAndPermissions(id: string): Promise<Usuario | null> {
    return Usuario.findByPk(id, {
      include: [
        {
          model: Rol,
          as: 'roles',
          through: { attributes: [] },
          where: { activo: true },
          required: false,
          include: [
            {
              model: Permiso,
              as: 'permisos',
              through: { attributes: [] },
              where: { activo: true },
              required: false,
            },
          ],
        },
      ],
    });
  },

  async findByUsername(username: string): Promise<Usuario | null> {
    return (Usuario as typeof Usuario)
      .scope('withPassword')
      .findOne({ where: { username } });
  },

  async findByEmail(email: string): Promise<Usuario | null> {
    return (Usuario as typeof Usuario)
      .scope('withPassword')
      .findOne({ where: { email } });
  },

  async findByUsernameOrEmail(identifier: string): Promise<Usuario | null> {
    return (Usuario as typeof Usuario).scope('withPassword').findOne({
      where: {
        [Op.or]: [{ username: identifier }, { email: identifier }],
      },
    });
  },

  async findAll(options: UsuarioFindOptions = {}): Promise<{ rows: Usuario[]; count: number }> {
    const { page = 1, limit = 20, search, activo } = options;
    const offset = (page - 1) * limit;

    const where: WhereOptions<UsuarioAttributes> = {};

    if (activo !== undefined) {
      where.activo = activo;
    }

    if (search) {
      Object.assign(where, {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { apellido: { [Op.iLike]: `%${search}%` } },
          { username: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ],
      });
    }

    return Usuario.findAndCountAll({
      where,
      limit,
      offset,
      order: [['fecha_creacion', 'DESC']],
      include: [
        {
          model: Rol,
          as: 'roles',
          through: { attributes: [] },
          required: false,
        },
      ],
    });
  },

  async create(data: Omit<UsuarioAttributes, 'id_usuario' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<Usuario> {
    return Usuario.create(data);
  },

  async update(id: string, data: Partial<UsuarioAttributes>): Promise<Usuario | null> {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return null;
    return usuario.update(data);
  },

  async updateLastAccess(id: string): Promise<void> {
    await Usuario.update(
      { fecha_ultimo_acceso: new Date() },
      { where: { id_usuario: id } },
    );
  },

  async softDelete(id: string): Promise<boolean> {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return false;
    await usuario.update({ activo: false, fecha_eliminacion: new Date() });
    return true;
  },

  async existsByUsername(username: string, excludeId?: string): Promise<boolean> {
    const where: WhereOptions<UsuarioAttributes> = { username };
    if (excludeId) {
      Object.assign(where, { id_usuario: { [Op.ne]: excludeId } });
    }
    const count = await Usuario.count({ where });
    return count > 0;
  },

  async existsByEmail(email: string, excludeId?: string): Promise<boolean> {
    const where: WhereOptions<UsuarioAttributes> = { email };
    if (excludeId) {
      Object.assign(where, { id_usuario: { [Op.ne]: excludeId } });
    }
    const count = await Usuario.count({ where });
    return count > 0;
  },

  async assignRol(idUsuario: string, idRol: string): Promise<void> {
    const usuario = await Usuario.findByPk(idUsuario);
    if (!usuario) throw new Error('Usuario no encontrado');
    const rol = await Rol.findByPk(idRol);
    if (!rol) throw new Error('Rol no encontrado');
    await (usuario as any).addRol(rol);
  },

  async removeRol(idUsuario: string, idRol: string): Promise<void> {
    const usuario = await Usuario.findByPk(idUsuario);
    if (!usuario) throw new Error('Usuario no encontrado');
    const rol = await Rol.findByPk(idRol);
    if (!rol) throw new Error('Rol no encontrado');
    await (usuario as any).removeRol(rol);
  },
};
