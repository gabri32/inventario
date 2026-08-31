import { Model, DataTypes, Sequelize, Association, HasManyGetAssociationsMixin } from 'sequelize';
import { env } from '../../config/env';

export interface VentaAttributes {
  id_venta: string;
  cliente?: string;
  fecha_venta: Date;
  subtotal: number;
  impuesto: number;
  descuento: number;
  total: number;
  id_estado: string;
  observaciones?: string;
  usuario_creacion?: string;
  usuario_actualizacion?: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface VentaCreationAttributes
  extends Omit<VentaAttributes, 'id_venta' | 'fecha_creacion' | 'fecha_actualizacion'> {}

export interface VentaDetalleAttributes {
  id_detalle: string;
  id_venta: string;
  id_producto: string;
  id_bien?: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  impuesto: number;
  subtotal: number;
  total: number;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface VentaDetalleCreationAttributes
  extends Omit<VentaDetalleAttributes, 'id_detalle' | 'fecha_creacion' | 'fecha_actualizacion'> {}

export class VentaDetalle
  extends Model<VentaDetalleAttributes, VentaDetalleCreationAttributes>
  implements VentaDetalleAttributes
{
  public id_detalle!: string;
  public id_venta!: string;
  public id_producto!: string;
  public id_bien?: number;
  public cantidad!: number;
  public precio_unitario!: number;
  public descuento!: number;
  public impuesto!: number;
  public subtotal!: number;
  public total!: number;
  public readonly fecha_creacion?: Date;
  public readonly fecha_actualizacion?: Date;

  public producto?: import('../productos/producto.model').Producto;
  public bien?: import('../bienes/bien.model').Bien;

  public static initialize(sequelize: Sequelize): void {
    VentaDetalle.init(
      {
        id_detalle: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        id_venta: { type: DataTypes.UUID, allowNull: false },
        id_producto: { type: DataTypes.UUID, allowNull: false },
        id_bien: { type: DataTypes.BIGINT, allowNull: true },
        cantidad: { type: DataTypes.INTEGER, allowNull: false },
        precio_unitario: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        descuento: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        impuesto: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      },
      {
        sequelize, tableName: 'ventas_detalle', schema: env.db.schema,
        timestamps: true, createdAt: 'fecha_creacion', updatedAt: 'fecha_actualizacion',
      },
    );
  }
}

export class Venta
  extends Model<VentaAttributes, VentaCreationAttributes>
  implements VentaAttributes
{
  public id_venta!: string;
  public cliente?: string;
  public fecha_venta!: Date;
  public subtotal!: number;
  public impuesto!: number;
  public descuento!: number;
  public total!: number;
  public id_estado!: string;
  public observaciones?: string;
  public usuario_creacion?: string;
  public usuario_actualizacion?: string;
  public readonly fecha_creacion?: Date;
  public readonly fecha_actualizacion?: Date;

  public detalle?: VentaDetalle[];
  public estado?: import('../estados/estado.model').Estado;
  public getDetalle!: HasManyGetAssociationsMixin<VentaDetalle>;

  public static associations: {
    detalle: Association<Venta, VentaDetalle>;
    estado: Association<Venta, import('../estados/estado.model').Estado>;
  };

  public static initialize(sequelize: Sequelize): void {
    Venta.init(
      {
        id_venta: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        cliente: { type: DataTypes.STRING(200), allowNull: true },
        fecha_venta: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
        subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        impuesto: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        descuento: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        total: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        id_estado: { type: DataTypes.UUID, allowNull: false },
        observaciones: { type: DataTypes.TEXT, allowNull: true },
        usuario_creacion: { type: DataTypes.UUID, allowNull: true },
        usuario_actualizacion: { type: DataTypes.UUID, allowNull: true },
      },
      {
        sequelize, tableName: 'ventas', schema: env.db.schema,
        timestamps: true, createdAt: 'fecha_creacion', updatedAt: 'fecha_actualizacion',
      },
    );
  }
}
