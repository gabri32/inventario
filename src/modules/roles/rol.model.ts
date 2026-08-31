import {
  Model,
  DataTypes,
  Sequelize,
  Association,
  BelongsToManyGetAssociationsMixin,
} from 'sequelize';
import { env } from '../../config/env';

export interface RolAttributes {
  id_rol: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface RolCreationAttributes extends Omit<RolAttributes, 'id_rol' | 'fecha_creacion' | 'fecha_actualizacion'> {}

export class Rol extends Model<RolAttributes, RolCreationAttributes> implements RolAttributes {
  public id_rol!: string;
  public nombre!: string;
  public descripcion?: string;
  public activo!: boolean;
  public readonly fecha_creacion?: Date;
  public readonly fecha_actualizacion?: Date;

  // Associations
  public permisos?: import('../permisos/permiso.model').Permiso[];
  public getPermisos!: BelongsToManyGetAssociationsMixin<import('../permisos/permiso.model').Permiso>;

  public static associations: {
    permisos: Association<Rol, import('../permisos/permiso.model').Permiso>;
  };

  public static initialize(sequelize: Sequelize): void {
    Rol.init(
      {
        id_rol: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
        },
        nombre: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
        },
        descripcion: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        activo: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        sequelize,
        tableName: 'roles',
        schema: env.db.schema,
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion',
      },
    );
  }
}
