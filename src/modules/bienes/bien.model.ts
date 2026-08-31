import { Model, DataTypes, Sequelize, Association } from 'sequelize';
import { env } from '../../config/env';

export interface BienAttributes {
  id_bien?: number;
  id_producto: string;
  codigo_interno?: string;
  numero_serie?: string;
  id_estado: string;
  ubicacion?: string;
  fecha_adquisicion?: Date;
  precio_adquisicion?: number;
  observaciones?: string;
  activo: boolean;
  usuario_creacion?: string;
  usuario_actualizacion?: string;
  fecha_eliminacion?: Date;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface BienCreationAttributes
  extends Omit<BienAttributes, 'id_bien' | 'fecha_creacion' | 'fecha_actualizacion'> {}

export class Bien
  extends Model<BienAttributes, BienCreationAttributes>
  implements BienAttributes
{
  public id_bien!: number;
  public id_producto!: string;
  public codigo_interno?: string;
  public numero_serie?: string;
  public id_estado!: string;
  public ubicacion?: string;
  public fecha_adquisicion?: Date;
  public precio_adquisicion?: number;
  public observaciones?: string;
  public activo!: boolean;
  public usuario_creacion?: string;
  public usuario_actualizacion?: string;
  public fecha_eliminacion?: Date;
  public readonly fecha_creacion?: Date;
  public readonly fecha_actualizacion?: Date;

  public producto?: import('../productos/producto.model').Producto;
  public estado?: import('../estados/estado.model').Estado;

  public static associations: {
    producto: Association<Bien, import('../productos/producto.model').Producto>;
    estado: Association<Bien, import('../estados/estado.model').Estado>;
  };

  public static initialize(sequelize: Sequelize): void {
    Bien.init(
      {
        id_bien: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        id_producto: { type: DataTypes.UUID, allowNull: false },
        codigo_interno: { type: DataTypes.STRING(100), allowNull: true, unique: true },
        numero_serie: { type: DataTypes.STRING(200), allowNull: true },
        id_estado: { type: DataTypes.UUID, allowNull: false },
        ubicacion: { type: DataTypes.STRING(200), allowNull: true },
        fecha_adquisicion: { type: DataTypes.DATEONLY, allowNull: true },
        precio_adquisicion: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
        observaciones: { type: DataTypes.TEXT, allowNull: true },
        activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        usuario_creacion: { type: DataTypes.UUID, allowNull: true },
        usuario_actualizacion: { type: DataTypes.UUID, allowNull: true },
        fecha_eliminacion: { type: DataTypes.DATE, allowNull: true },
      },
      {
        sequelize,
        tableName: 'bienes',
        schema: env.db.schema,
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion',
      },
    );
  }
}
