'use strict';

const schema = process.env.DB_SCHEMA || 'administracion';

const PERMISOS = [
  // USUARIOS
  { nombre: 'USUARIO_LISTAR', modulo: 'USUARIOS', descripcion: 'Listar usuarios' },
  { nombre: 'USUARIO_CREAR', modulo: 'USUARIOS', descripcion: 'Crear usuarios' },
  { nombre: 'USUARIO_EDITAR', modulo: 'USUARIOS', descripcion: 'Editar usuarios' },
  { nombre: 'USUARIO_ELIMINAR', modulo: 'USUARIOS', descripcion: 'Eliminar usuarios' },
  // ROLES
  { nombre: 'ROL_LISTAR', modulo: 'ROLES', descripcion: 'Listar roles' },
  { nombre: 'ROL_CREAR', modulo: 'ROLES', descripcion: 'Crear roles' },
  { nombre: 'ROL_EDITAR', modulo: 'ROLES', descripcion: 'Editar roles' },
  // PRODUCTOS
  { nombre: 'PRODUCTO_LISTAR', modulo: 'PRODUCTOS', descripcion: 'Listar productos' },
  { nombre: 'PRODUCTO_CREAR', modulo: 'PRODUCTOS', descripcion: 'Crear productos' },
  { nombre: 'PRODUCTO_EDITAR', modulo: 'PRODUCTOS', descripcion: 'Editar productos' },
  { nombre: 'PRODUCTO_ELIMINAR', modulo: 'PRODUCTOS', descripcion: 'Eliminar productos' },
  // BIENES
  { nombre: 'BIEN_LISTAR', modulo: 'BIENES', descripcion: 'Listar bienes' },
  { nombre: 'BIEN_CREAR', modulo: 'BIENES', descripcion: 'Crear bienes' },
  { nombre: 'BIEN_EDITAR', modulo: 'BIENES', descripcion: 'Editar bienes' },
  { nombre: 'BIEN_ELIMINAR', modulo: 'BIENES', descripcion: 'Eliminar bienes' },
  // INVENTARIO
  { nombre: 'INVENTARIO_CONSULTAR', modulo: 'INVENTARIO', descripcion: 'Consultar inventario' },
  { nombre: 'INVENTARIO_AJUSTAR', modulo: 'INVENTARIO', descripcion: 'Ajustar inventario' },
  // PROVEEDORES
  { nombre: 'PROVEEDOR_LISTAR', modulo: 'PROVEEDORES', descripcion: 'Listar proveedores' },
  { nombre: 'PROVEEDOR_CREAR', modulo: 'PROVEEDORES', descripcion: 'Crear proveedores' },
  { nombre: 'PROVEEDOR_EDITAR', modulo: 'PROVEEDORES', descripcion: 'Editar proveedores' },
  // COMPRAS
  { nombre: 'COMPRA_LISTAR', modulo: 'COMPRAS', descripcion: 'Listar compras' },
  { nombre: 'COMPRA_CREAR', modulo: 'COMPRAS', descripcion: 'Crear compras' },
  { nombre: 'COMPRA_ANULAR', modulo: 'COMPRAS', descripcion: 'Anular compras' },
  // VENTAS
  { nombre: 'VENTA_LISTAR', modulo: 'VENTAS', descripcion: 'Listar ventas' },
  { nombre: 'VENTA_CREAR', modulo: 'VENTAS', descripcion: 'Crear ventas' },
  { nombre: 'VENTA_ANULAR', modulo: 'VENTAS', descripcion: 'Anular ventas' },
  // PRESTAMOS
  { nombre: 'PRESTAMO_LISTAR', modulo: 'PRESTAMOS', descripcion: 'Listar préstamos' },
  { nombre: 'PRESTAMO_CREAR', modulo: 'PRESTAMOS', descripcion: 'Crear préstamos' },
  { nombre: 'PRESTAMO_DEVOLVER', modulo: 'PRESTAMOS', descripcion: 'Registrar devoluciones' },
  // REPORTES
  { nombre: 'REPORTES_CONSULTAR', modulo: 'REPORTES', descripcion: 'Consultar reportes' },
  // AUDITORIA
  { nombre: 'AUDITORIA_CONSULTAR', modulo: 'AUDITORIA', descripcion: 'Consultar auditoría' },
  // DASHBOARD
  { nombre: 'DASHBOARD_CONSULTAR', modulo: 'DASHBOARD', descripcion: 'Ver dashboard' },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // 1. Create permissions
    const permisosConId = PERMISOS.map((p) => ({
      ...p,
      id_permiso: require('crypto').randomUUID(),
      activo: true,
      fecha_creacion: now,
      fecha_actualizacion: now,
    }));

    await queryInterface.bulkInsert({ tableName: 'permisos', schema }, permisosConId);

    // 2. Create ADMINISTRADOR role
    const idRolAdmin = require('crypto').randomUUID();
    await queryInterface.bulkInsert({ tableName: 'roles', schema }, [
      {
        id_rol: idRolAdmin,
        nombre: 'ADMINISTRADOR',
        descripcion: 'Acceso total al sistema',
        activo: true,
        fecha_creacion: now,
        fecha_actualizacion: now,
      },
    ]);

    // 3. Assign all permissions to ADMINISTRADOR
    const rolPermisos = permisosConId.map((p) => ({
      id_rol: idRolAdmin,
      id_permiso: p.id_permiso,
      fecha_creacion: now,
      fecha_actualizacion: now,
    }));

    await queryInterface.bulkInsert({ tableName: 'rol_permisos', schema }, rolPermisos);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete({ tableName: 'rol_permisos', schema }, null, {});
    await queryInterface.bulkDelete({ tableName: 'roles', schema }, null, {});
    await queryInterface.bulkDelete({ tableName: 'permisos', schema }, null, {});
  },
};
