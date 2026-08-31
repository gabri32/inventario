import { Model, DataTypes, Sequelize, Association, HasManyGetAssociationsMixin } from 'sequelize';
import { env } from '../../config/env';

export interface CompraAttributes {
  id_compra: string;
  id_proveedor: string;
  numero_factura?: string;
  fecha_compra: Date;
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

export interface CompraCreationAttributes
  extends Omit<CompraAttributes, 'id_compra' | 'fecha_creacion' | 'fecha_actualizacion'> {}

export interface CompraDetalleAttributes {
  id_detalle: string;
  id_compra: string;
  id_producto: string;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  impuesto: number;
  subtotal: number;
  total: number;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface CompraDetalleCreationAttributes
  extends Omit<CompraDetalleAttributes, 'id_detalle' | 'fecha_creacion' | 'fecha_actualizacion'> {}

export class CompraDetalle
  extends Model<CompraDetalleAttributes, CompraDetalleCreationAttributes>
  implements CompraDetalleAttributes
{
  public id_detalle!: string;
  public id_compra!: string;
  public id_producto!: string;
  public cantidad!: number;
  public precio_unitario!: number;
  public descuento!: number;
  public impuesto!: number;
  public subtotal!: number;
  public total!: number;
  public readonly fecha_creacion?: Date;
  public readonly fecha_actualizacion?: Date;

  public producto?: import('../productos/producto.model').Producto;

  public static initialize(sequelize: Sequelize): void {
    CompraDetalle.init(
      {
        id_detalle: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        id_compra: { type: DataTypes.UUID, allowNull: false },
        id_producto: { type: DataTypes.UUID, allowNull: false },
        cantidad: { type: DataTypes.INTEGER, allowNull: false },
        precio_unitario: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        descuento: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        impuesto: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      },
      {
        sequelize,
        tableName: 'compras_detalle',
        schema: env.db.schema,
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion',
      },
    );
  }
}

export class Compra
  extends Model<CompraAttributes, CompraCreationAttributes>
  implements CompraAttributes
{
  public id_compra!: string;
  public id_proveedor!: string;
  public numero_factura?: string;
  public fecha_compra!: Date;
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

  public detalle?: CompraDetalle[];
  public proveedor?: import('../proveedores/proveedor.model').Proveedor;
  public estado?: import('../estados/estado.model').Estado;
  public getDetalle!: HasManyGetAssociationsMixin<CompraDetalle>;

  public static associations: {
    detalle: Association<Compra, CompraDetalle>;
    proveedor: Association<Compra, import('../proveedores/proveedor.model').Proveedor>;
    estado: Association<Compra, import('../estados/estado.model').Estado>;
  };

  public static initialize(sequelize: Sequelize): void {
    Compra.init(
      {
        id_compra: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        id_proveedor: { type: DataTypes.UUID, allowNull: false },
        numero_factura: { type: DataTypes.STRING(100), allowNull: true },
        fecha_compra: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
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
        sequelize,
        tableName: 'compras',
        schema: env.db.schema,
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion',
      },
    );
  }
}
