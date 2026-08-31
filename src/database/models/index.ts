import { sequelize } from '../connection';
import { DataTypes, Model } from 'sequelize';
import { env } from '../../config/env';

// ─── Import all models ────────────────────────────────────────────────────────
import { Usuario } from '../../modules/usuarios/usuario.model';
import { Rol } from '../../modules/roles/rol.model';
import { Permiso } from '../../modules/permisos/permiso.model';
import { Categoria } from '../../modules/categorias/categoria.model';
import { Estado } from '../../modules/estados/estado.model';
import { Producto } from '../../modules/productos/producto.model';
import { Bien } from '../../modules/bienes/bien.model';
import { Movimiento } from '../../modules/movimientos/movimiento.model';
import { Proveedor } from '../../modules/proveedores/proveedor.model';
import { Compra, CompraDetalle } from '../../modules/compras/compra.model';
import { Prestatario } from '../../modules/prestamos/prestatario.model';
import { Prestamo, PrestamoDetalle } from '../../modules/prestamos/prestamo.model';
import { Venta, VentaDetalle } from '../../modules/ventas/venta.model';
import { Auditoria } from '../../modules/auditoria/auditoria.model';

// ─── Initialize all models ────────────────────────────────────────────────────
Usuario.initialize(sequelize);
Rol.initialize(sequelize);
Permiso.initialize(sequelize);
Categoria.initialize(sequelize);
Estado.initialize(sequelize);
Producto.initialize(sequelize);
Bien.initialize(sequelize);
Movimiento.initialize(sequelize);
Proveedor.initialize(sequelize);
Compra.initialize(sequelize);
CompraDetalle.initialize(sequelize);
Prestatario.initialize(sequelize);
Prestamo.initialize(sequelize);
PrestamoDetalle.initialize(sequelize);
Venta.initialize(sequelize);
VentaDetalle.initialize(sequelize);
Auditoria.initialize(sequelize);

// ─── Junction models ──────────────────────────────────────────────────────────
class UsuarioRol extends Model {}
UsuarioRol.init(
  {
    id_usuario: { type: DataTypes.UUID, primaryKey: true },
    id_rol: { type: DataTypes.UUID, primaryKey: true },
  },
  { sequelize, tableName: 'usuario_roles', schema: env.db.schema, timestamps: true, createdAt: 'fecha_creacion', updatedAt: 'fecha_actualizacion' },
);

class RolPermiso extends Model {}
RolPermiso.init(
  {
    id_rol: { type: DataTypes.UUID, primaryKey: true },
    id_permiso: { type: DataTypes.UUID, primaryKey: true },
  },
  { sequelize, tableName: 'rol_permisos', schema: env.db.schema, timestamps: true, createdAt: 'fecha_creacion', updatedAt: 'fecha_actualizacion' },
);

// ─── Associations ─────────────────────────────────────────────────────────────

// Usuario <-> Rol
Usuario.belongsToMany(Rol, { through: UsuarioRol, foreignKey: 'id_usuario', otherKey: 'id_rol', as: 'roles' });
Rol.belongsToMany(Usuario, { through: UsuarioRol, foreignKey: 'id_rol', otherKey: 'id_usuario', as: 'usuarios' });

// Rol <-> Permiso
Rol.belongsToMany(Permiso, { through: RolPermiso, foreignKey: 'id_rol', otherKey: 'id_permiso', as: 'permisos' });
Permiso.belongsToMany(Rol, { through: RolPermiso, foreignKey: 'id_permiso', otherKey: 'id_rol', as: 'roles' });

// Producto -> Categoria
Producto.belongsTo(Categoria, { foreignKey: 'id_categoria', as: 'categoria' });
Categoria.hasMany(Producto, { foreignKey: 'id_categoria', as: 'productos' });

// Bien -> Producto
Bien.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });
Producto.hasMany(Bien, { foreignKey: 'id_producto', as: 'bienes' });

// Bien -> Estado
Bien.belongsTo(Estado, { foreignKey: 'id_estado', as: 'estado' });
Estado.hasMany(Bien, { foreignKey: 'id_estado', as: 'bienes' });

// Movimiento -> Producto
Movimiento.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });
Producto.hasMany(Movimiento, { foreignKey: 'id_producto', as: 'movimientos' });

// Movimiento -> Bien
Movimiento.belongsTo(Bien, { foreignKey: 'id_bien', as: 'bien' });

// Compra -> Proveedor
Compra.belongsTo(Proveedor, { foreignKey: 'id_proveedor', as: 'proveedor' });
Proveedor.hasMany(Compra, { foreignKey: 'id_proveedor', as: 'compras' });

// Compra -> Estado
Compra.belongsTo(Estado, { foreignKey: 'id_estado', as: 'estado' });

// Compra -> CompraDetalle
Compra.hasMany(CompraDetalle, { foreignKey: 'id_compra', as: 'detalle', onDelete: 'CASCADE' });
CompraDetalle.belongsTo(Compra, { foreignKey: 'id_compra', as: 'compra' });
CompraDetalle.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });

// Prestamo -> Prestatario
Prestamo.belongsTo(Prestatario, { foreignKey: 'id_prestatario', as: 'prestatario' });
Prestatario.hasMany(Prestamo, { foreignKey: 'id_prestatario', as: 'prestamos' });

// Prestamo -> Estado
Prestamo.belongsTo(Estado, { foreignKey: 'id_estado', as: 'estado' });

// Prestamo -> PrestamoDetalle
Prestamo.hasMany(PrestamoDetalle, { foreignKey: 'id_prestamo', as: 'detalle', onDelete: 'CASCADE' });
PrestamoDetalle.belongsTo(Prestamo, { foreignKey: 'id_prestamo', as: 'prestamo' });
PrestamoDetalle.belongsTo(Bien, { foreignKey: 'id_bien', as: 'bien' });

// Venta -> Estado
Venta.belongsTo(Estado, { foreignKey: 'id_estado', as: 'estado' });

// Venta -> VentaDetalle
Venta.hasMany(VentaDetalle, { foreignKey: 'id_venta', as: 'detalle', onDelete: 'CASCADE' });
VentaDetalle.belongsTo(Venta, { foreignKey: 'id_venta', as: 'venta' });
VentaDetalle.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });
VentaDetalle.belongsTo(Bien, { foreignKey: 'id_bien', as: 'bien' });

export {
  sequelize,
  Usuario, Rol, Permiso, UsuarioRol, RolPermiso,
  Categoria, Estado, Producto, Bien, Movimiento,
  Proveedor, Compra, CompraDetalle,
  Prestatario, Prestamo, PrestamoDetalle,
  Venta, VentaDetalle,
  Auditoria,
};
