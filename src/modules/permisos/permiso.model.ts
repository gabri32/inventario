import { Model, DataTypes, Sequelize } from 'sequelize';
import { env } from '../../config/env';

export interface PermisoAttributes {
  id_permiso: string;
  nombre: string;
  descripcion?: string;
  modulo: string;
  activo: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface PermisoCreationAttributes
  extends Omit<PermisoAttributes, 'id_permiso' | 'fecha_creacion' | 'fecha_actualizacion'> {}

export class Permiso
  extends Model<PermisoAttributes, PermisoCreationAttributes>
  implements PermisoAttributes
{
  public id_permiso!: string;
  public nombre!: string;
  public descripcion?: string;
  public modulo!: string;
  public activo!: boolean;
  public readonly fecha_creacion?: Date;
  public readonly fecha_actualizacion?: Date;

  public static initialize(sequelize: Sequelize): void {
    Permiso.init(
      {
        id_permiso: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
        },
        nombre: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
          comment: 'Ej: USUARIO_CREAR, PRODUCTO_LISTAR',
        },
        descripcion: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        modulo: {
          type: DataTypes.STRING(100),
          allowNull: false,
          comment: 'Módulo al que pertenece el permiso: USUARIOS, PRODUCTOS, etc.',
        },
        activo: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        sequelize,
        tableName: 'permisos',
        schema: env.db.schema,
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion',
      },
    );
  }
}
