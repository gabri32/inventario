import { Model, DataTypes, Sequelize, Association, HasManyGetAssociationsMixin } from 'sequelize';
import { env } from '../../config/env';

export interface PrestamoAttributes {
  id_prestamo: string;
  id_prestatario: string;
  fecha_prestamo: Date;
  fecha_vencimiento: Date;
  fecha_devolucion?: Date;
  id_estado: string;
  observaciones?: string;
  usuario_responsable?: string;
  usuario_creacion?: string;
  usuario_actualizacion?: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface PrestamoCreationAttributes
  extends Omit<PrestamoAttributes, 'id_prestamo' | 'fecha_creacion' | 'fecha_actualizacion'> {}

export interface PrestamoDetalleAttributes {
  id_detalle: string;
  id_prestamo: string;
  id_bien: number;
  fecha_devolucion?: Date;
  estado_devolucion?: string;
  observaciones?: string;
  usuario_devolucion?: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface PrestamoDetalleCreationAttributes
  extends Omit<PrestamoDetalleAttributes, 'id_detalle' | 'fecha_creacion' | 'fecha_actualizacion'> {}

export class PrestamoDetalle
  extends Model<PrestamoDetalleAttributes, PrestamoDetalleCreationAttributes>
  implements PrestamoDetalleAttributes
{
  public id_detalle!: string;
  public id_prestamo!: string;
  public id_bien!: number;
  public fecha_devolucion?: Date;
  public estado_devolucion?: string;
  public observaciones?: string;
  public usuario_devolucion?: string;
  public readonly fecha_creacion?: Date;
  public readonly fecha_actualizacion?: Date;

  public bien?: import('../bienes/bien.model').Bien;

  public static initialize(sequelize: Sequelize): void {
    PrestamoDetalle.init(
      {
        id_detalle: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        id_prestamo: { type: DataTypes.UUID, allowNull: false },
        id_bien: { type: DataTypes.BIGINT, allowNull: false },
        fecha_devolucion: { type: DataTypes.DATE, allowNull: true },
        estado_devolucion: { type: DataTypes.STRING(50), allowNull: true },
        observaciones: { type: DataTypes.TEXT, allowNull: true },
        usuario_devolucion: { type: DataTypes.UUID, allowNull: true },
      },
      {
        sequelize, tableName: 'prestamos_detalle', schema: env.db.schema,
        timestamps: true, createdAt: 'fecha_creacion', updatedAt: 'fecha_actualizacion',
      },
    );
  }
}

export class Prestamo
  extends Model<PrestamoAttributes, PrestamoCreationAttributes>
  implements PrestamoAttributes
{
  public id_prestamo!: string;
  public id_prestatario!: string;
  public fecha_prestamo!: Date;
  public fecha_vencimiento!: Date;
  public fecha_devolucion?: Date;
  public id_estado!: string;
  public observaciones?: string;
  public usuario_responsable?: string;
  public usuario_creacion?: string;
  public usuario_actualizacion?: string;
  public readonly fecha_creacion?: Date;
  public readonly fecha_actualizacion?: Date;

  public detalle?: PrestamoDetalle[];
  public prestatario?: import('./prestatario.model').Prestatario;
  public estado?: import('../estados/estado.model').Estado;
  public getDetalle!: HasManyGetAssociationsMixin<PrestamoDetalle>;

  public static associations: {
    detalle: Association<Prestamo, PrestamoDetalle>;
  };

  public static initialize(sequelize: Sequelize): void {
    Prestamo.init(
      {
        id_prestamo: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        id_prestatario: { type: DataTypes.UUID, allowNull: false },
        fecha_prestamo: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        fecha_vencimiento: { type: DataTypes.DATE, allowNull: false },
        fecha_devolucion: { type: DataTypes.DATE, allowNull: true },
        id_estado: { type: DataTypes.UUID, allowNull: false },
        observaciones: { type: DataTypes.TEXT, allowNull: true },
        usuario_responsable: { type: DataTypes.UUID, allowNull: true },
        usuario_creacion: { type: DataTypes.UUID, allowNull: true },
        usuario_actualizacion: { type: DataTypes.UUID, allowNull: true },
      },
      {
        sequelize, tableName: 'prestamos', schema: env.db.schema,
        timestamps: true, createdAt: 'fecha_creacion', updatedAt: 'fecha_actualizacion',
      },
    );
  }
}
