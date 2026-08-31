import { Model, DataTypes, Sequelize } from 'sequelize';
import { env } from '../../config/env';

export interface AuditoriaAttributes {
  id_auditoria: string;
  id_usuario?: string;
  accion: string;
  modulo: string;
  entidad?: string;
  id_entidad?: string;
  datos_anteriores?: object;
  datos_nuevos?: object;
  ip?: string;
  user_agent?: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface AuditoriaCreationAttributes
  extends Omit<AuditoriaAttributes, 'id_auditoria' | 'fecha_creacion' | 'fecha_actualizacion'> {}

export class Auditoria
  extends Model<AuditoriaAttributes, AuditoriaCreationAttributes>
  implements AuditoriaAttributes
{
  public id_auditoria!: string;
  public id_usuario?: string;
  public accion!: string;
  public modulo!: string;
  public entidad?: string;
  public id_entidad?: string;
  public datos_anteriores?: object;
  public datos_nuevos?: object;
  public ip?: string;
  public user_agent?: string;
  public readonly fecha_creacion?: Date;
  public readonly fecha_actualizacion?: Date;

  public static initialize(sequelize: Sequelize): void {
    Auditoria.init(
      {
        id_auditoria: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        id_usuario: { type: DataTypes.UUID, allowNull: true },
        accion: { type: DataTypes.STRING(50), allowNull: false },
        modulo: { type: DataTypes.STRING(100), allowNull: false },
        entidad: { type: DataTypes.STRING(100), allowNull: true },
        id_entidad: { type: DataTypes.STRING(100), allowNull: true },
        datos_anteriores: { type: DataTypes.JSONB, allowNull: true },
        datos_nuevos: { type: DataTypes.JSONB, allowNull: true },
        ip: { type: DataTypes.STRING(45), allowNull: true },
        user_agent: { type: DataTypes.TEXT, allowNull: true },
      },
      {
        sequelize, tableName: 'auditoria', schema: env.db.schema,
        timestamps: true, createdAt: 'fecha_creacion', updatedAt: 'fecha_actualizacion',
      },
    );
  }
}
