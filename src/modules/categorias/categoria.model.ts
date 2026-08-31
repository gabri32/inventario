import { Model, DataTypes, Sequelize } from 'sequelize';
import { env } from '../../config/env';

export interface CategoriaAttributes {
  id_categoria: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  usuario_creacion?: string;
  usuario_actualizacion?: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface CategoriaCreationAttributes
  extends Omit<CategoriaAttributes, 'id_categoria' | 'fecha_creacion' | 'fecha_actualizacion'> {}

export class Categoria
  extends Model<CategoriaAttributes, CategoriaCreationAttributes>
  implements CategoriaAttributes
{
  public id_categoria!: string;
  public nombre!: string;
  public descripcion?: string;
  public activo!: boolean;
  public usuario_creacion?: string;
  public usuario_actualizacion?: string;
  public readonly fecha_creacion?: Date;
  public readonly fecha_actualizacion?: Date;

  public static initialize(sequelize: Sequelize): void {
    Categoria.init(
      {
        id_categoria: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
        },
        nombre: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
        },
        descripcion: { type: DataTypes.TEXT, allowNull: true },
        activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        usuario_creacion: { type: DataTypes.UUID, allowNull: true },
        usuario_actualizacion: { type: DataTypes.UUID, allowNull: true },
      },
      {
        sequelize,
        tableName: 'categorias',
        schema: env.db.schema,
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion',
      },
    );
  }
}
