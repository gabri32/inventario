import { Model, DataTypes, Sequelize, Association } from 'sequelize';
import { env } from '../../config/env';

export interface ProductoAttributes {
  id_producto: string;
  codigo_producto?: string;
  nombre: string;
  descripcion?: string;
  id_categoria?: string;
  marca?: string;
  modelo?: string;
  unidad_medida: string;
  stock_minimo: number;
  stock_maximo?: number;
  precio_compra?: number;
  precio_venta?: number;
  activo: boolean;
  usuario_creacion?: string;
  usuario_actualizacion?: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface ProductoCreationAttributes
  extends Omit<ProductoAttributes, 'id_producto' | 'fecha_creacion' | 'fecha_actualizacion'> {}

export class Producto
  extends Model<ProductoAttributes, ProductoCreationAttributes>
  implements ProductoAttributes
{
  public id_producto!: string;
  public codigo_producto?: string;
  public nombre!: string;
  public descripcion?: string;
  public id_categoria?: string;
  public marca?: string;
  public modelo?: string;
  public unidad_medida!: string;
  public stock_minimo!: number;
  public stock_maximo?: number;
  public precio_compra?: number;
  public precio_venta?: number;
  public activo!: boolean;
  public usuario_creacion?: string;
  public usuario_actualizacion?: string;
  public readonly fecha_creacion?: Date;
  public readonly fecha_actualizacion?: Date;

  // Associations
  public categoria?: import('../categorias/categoria.model').Categoria;

  public static associations: {
    categoria: Association<Producto, import('../categorias/categoria.model').Categoria>;
  };

  public static initialize(sequelize: Sequelize): void {
    Producto.init(
      {
        id_producto: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        codigo_producto: { type: DataTypes.STRING(50), allowNull: true, unique: true },
        nombre: { type: DataTypes.STRING(200), allowNull: false },
        descripcion: { type: DataTypes.TEXT, allowNull: true },
        id_categoria: { type: DataTypes.UUID, allowNull: true },
        marca: { type: DataTypes.STRING(100), allowNull: true },
        modelo: { type: DataTypes.STRING(100), allowNull: true },
        unidad_medida: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'UNIDAD' },
        stock_minimo: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        stock_maximo: { type: DataTypes.INTEGER, allowNull: true },
        precio_compra: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
        precio_venta: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
        activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        usuario_creacion: { type: DataTypes.UUID, allowNull: true },
        usuario_actualizacion: { type: DataTypes.UUID, allowNull: true },
      },
      {
        sequelize,
        tableName: 'productos',
        schema: env.db.schema,
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion',
      },
    );
  }
}
