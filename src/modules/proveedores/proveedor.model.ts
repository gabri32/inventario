import { Model, DataTypes, Sequelize } from 'sequelize';
import { env } from '../../config/env';

export interface ProveedorAttributes {
  id_proveedor: string;
  tipo_documento: string;
  numero_documento: string;
  razon_social: string;
  nombre_contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  observaciones?: string;
  activo: boolean;
  usuario_creacion?: string;
  usuario_actualizacion?: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface ProveedorCreationAttributes
  extends Omit<ProveedorAttributes, 'id_proveedor' | 'fecha_creacion' | 'fecha_actualizacion'> {}

export class Proveedor
  extends Model<ProveedorAttributes, ProveedorCreationAttributes>
  implements ProveedorAttributes
{
  public id_proveedor!: string;
  public tipo_documento!: string;
  public numero_documento!: string;
  public razon_social!: string;
  public nombre_contacto?: string;
  public telefono?: string;
  public email?: string;
  public direccion?: string;
  public ciudad?: string;
  public observaciones?: string;
  public activo!: boolean;
  public usuario_creacion?: string;
  public usuario_actualizacion?: string;
  public readonly fecha_creacion?: Date;
  public readonly fecha_actualizacion?: Date;

  public static initialize(sequelize: Sequelize): void {
    Proveedor.init(
      {
        id_proveedor: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        tipo_documento: { type: DataTypes.STRING(20), allowNull: false },
        numero_documento: { type: DataTypes.STRING(20), allowNull: false, unique: true },
        razon_social: { type: DataTypes.STRING(200), allowNull: false },
        nombre_contacto: { type: DataTypes.STRING(200), allowNull: true },
        telefono: { type: DataTypes.STRING(20), allowNull: true },
        email: { type: DataTypes.STRING(255), allowNull: true },
        direccion: { type: DataTypes.TEXT, allowNull: true },
        ciudad: { type: DataTypes.STRING(100), allowNull: true },
        observaciones: { type: DataTypes.TEXT, allowNull: true },
        activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        usuario_creacion: { type: DataTypes.UUID, allowNull: true },
        usuario_actualizacion: { type: DataTypes.UUID, allowNull: true },
      },
      {
        sequelize,
        tableName: 'proveedores',
        schema: env.db.schema,
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion',
      },
    );
  }
}
