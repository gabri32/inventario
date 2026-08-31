import { Model, DataTypes, Sequelize } from 'sequelize';
import { env } from '../../config/env';

export interface EstadoAttributes {
  id_estado: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  modulo: string;
  orden: number;
  activo: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface EstadoCreationAttributes
  extends Omit<EstadoAttributes, 'id_estado' | 'fecha_creacion' | 'fecha_actualizacion'> {}

export class Estado
  extends Model<EstadoAttributes, EstadoCreationAttributes>
  implements EstadoAttributes
{
  public id_estado!: string;
  public codigo!: string;
  public nombre!: string;
  public descripcion?: string;
  public modulo!: string;
  public orden!: number;
  public activo!: boolean;
  public readonly fecha_creacion?: Date;
  public readonly fecha_actualizacion?: Date;

  public static initialize(sequelize: Sequelize): void {
    Estado.init(
      {
        id_estado: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        codigo: { type: DataTypes.STRING(50), allowNull: false, unique: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false },
        descripcion: { type: DataTypes.TEXT, allowNull: true },
        modulo: { type: DataTypes.STRING(50), allowNull: false },
        orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      },
      {
        sequelize,
        tableName: 'estados',
        schema: env.db.schema,
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion',
      },
    );
  }
}
