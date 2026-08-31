import { Model, DataTypes, Sequelize, Association } from 'sequelize';
import { env } from '../../config/env';

export interface MovimientoAttributes {
  id_movimiento?: string;
  id_producto: string;
  id_bien?: number;
  tipo_movimiento: string;
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  referencia_tipo?: string;
  referencia_id?: string;
  usuario_creacion?: string;
  observaciones?: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface MovimientoCreationAttributes
  extends Omit<MovimientoAttributes, 'id_movimiento' | 'fecha_creacion' | 'fecha_actualizacion'> {}

export class Movimiento
  extends Model<MovimientoAttributes, MovimientoCreationAttributes>
  implements MovimientoAttributes
{
  public id_movimiento!: string;
  public id_producto!: string;
  public id_bien?: number;
  public tipo_movimiento!: string;
  public cantidad!: number;
  public stock_anterior!: number;
  public stock_nuevo!: number;
  public referencia_tipo?: string;
  public referencia_id?: string;
  public usuario_creacion?: string;
  public observaciones?: string;
  public readonly fecha_creacion?: Date;
  public readonly fecha_actualizacion?: Date;

  public producto?: import('../productos/producto.model').Producto;
  public bien?: import('../bienes/bien.model').Bien;

  public static associations: {
    producto: Association<Movimiento, import('../productos/producto.model').Producto>;
    bien: Association<Movimiento, import('../bienes/bien.model').Bien>;
  };

  public static initialize(sequelize: Sequelize): void {
    Movimiento.init(
      {
        id_movimiento: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        id_producto: { type: DataTypes.UUID, allowNull: false },
        id_bien: { type: DataTypes.BIGINT, allowNull: true },
        tipo_movimiento: { type: DataTypes.STRING(50), allowNull: false },
        cantidad: { type: DataTypes.INTEGER, allowNull: false },
        stock_anterior: { type: DataTypes.INTEGER, allowNull: false },
        stock_nuevo: { type: DataTypes.INTEGER, allowNull: false },
        referencia_tipo: { type: DataTypes.STRING(50), allowNull: true },
        referencia_id: { type: DataTypes.STRING(100), allowNull: true },
        usuario_creacion: { type: DataTypes.UUID, allowNull: true },
        observaciones: { type: DataTypes.TEXT, allowNull: true },
      },
      {
        sequelize,
        tableName: 'movimientos_inventario',
        schema: env.db.schema,
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion',
        // Immutable: no updates allowed at application level
      },
    );
  }
}
