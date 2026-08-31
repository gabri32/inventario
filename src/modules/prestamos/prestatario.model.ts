import { Model, DataTypes, Sequelize } from 'sequelize';
import { env } from '../../config/env';

export interface PrestatarioAttributes {
  id_prestatario: string;
  tipo: string;
  nombre: string;
  apellido?: string;
  identificacion?: string;
  cargo?: string;
  dependencia?: string;
  telefono?: string;
  email?: string;
  observaciones?: string;
  activo: boolean;
  usuario_creacion?: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface PrestatarioCreationAttributes
  extends Omit<PrestatarioAttributes, 'id_prestatario' | 'fecha_creacion' | 'fecha_actualizacion'> {}

export class Prestatario
  extends Model<PrestatarioAttributes, PrestatarioCreationAttributes>
  implements PrestatarioAttributes
{
  public id_prestatario!: string;
  public tipo!: string;
  public nombre!: string;
  public apellido?: string;
  public identificacion?: string;
  public cargo?: string;
  public dependencia?: string;
  public telefono?: string;
  public email?: string;
  public observaciones?: string;
  public activo!: boolean;
  public usuario_creacion?: string;
  public readonly fecha_creacion?: Date;
  public readonly fecha_actualizacion?: Date;

  public static initialize(sequelize: Sequelize): void {
    Prestatario.init(
      {
        id_prestatario: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        tipo: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'EXTERNO' },
        nombre: { type: DataTypes.STRING(200), allowNull: false },
        apellido: { type: DataTypes.STRING(200), allowNull: true },
        identificacion: { type: DataTypes.STRING(50), allowNull: true },
        cargo: { type: DataTypes.STRING(100), allowNull: true },
        dependencia: { type: DataTypes.STRING(200), allowNull: true },
        telefono: { type: DataTypes.STRING(20), allowNull: true },
        email: { type: DataTypes.STRING(255), allowNull: true },
        observaciones: { type: DataTypes.TEXT, allowNull: true },
        activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        usuario_creacion: { type: DataTypes.UUID, allowNull: true },
      },
      {
        sequelize, tableName: 'prestatarios', schema: env.db.schema,
        timestamps: true, createdAt: 'fecha_creacion', updatedAt: 'fecha_actualizacion',
      },
    );
  }
}
