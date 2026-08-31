import {
  Model,
  DataTypes,
  Sequelize,
  Association,
  BelongsToManyGetAssociationsMixin,
} from 'sequelize';
import { env } from '../../config/env';

export interface UsuarioAttributes {
  id_usuario: string;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  password_hash: string;
  activo: boolean;
  fecha_ultimo_acceso?: Date;
  fecha_eliminacion?: Date;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface UsuarioCreationAttributes
  extends Omit<UsuarioAttributes, 'id_usuario' | 'fecha_creacion' | 'fecha_actualizacion'> {}

// Safe type: never exposes password_hash
export type UsuarioPublico = Omit<UsuarioAttributes, 'password_hash'>;

export class Usuario
  extends Model<UsuarioAttributes, UsuarioCreationAttributes>
  implements UsuarioAttributes
{
  public id_usuario!: string;
  public nombre!: string;
  public apellido!: string;
  public username!: string;
  public email!: string;
  public password_hash!: string;
  public activo!: boolean;
  public fecha_ultimo_acceso?: Date;
  public fecha_eliminacion?: Date;
  public readonly fecha_creacion?: Date;
  public readonly fecha_actualizacion?: Date;

  // Associations
  public roles?: import('../roles/rol.model').Rol[];
  public getRoles!: BelongsToManyGetAssociationsMixin<import('../roles/rol.model').Rol>;

  public static associations: {
    roles: Association<Usuario, import('../roles/rol.model').Rol>;
  };

  public toPublic(): UsuarioPublico {
    const { password_hash: _pw, ...pub } = this.toJSON() as UsuarioAttributes;
    return pub;
  }

  public static initialize(sequelize: Sequelize): void {
    Usuario.init(
      {
        id_usuario: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
        },
        nombre: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        apellido: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        username: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
          validate: { isEmail: true },
        },
        password_hash: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        activo: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        fecha_ultimo_acceso: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        fecha_eliminacion: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'usuarios',
        schema: env.db.schema,
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion',
        defaultScope: {
          attributes: { exclude: ['password_hash'] },
        },
        scopes: {
          withPassword: {
            attributes: { include: ['password_hash'] },
          },
          active: {
            where: { activo: true },
          },
        },
      },
    );
  }
}
