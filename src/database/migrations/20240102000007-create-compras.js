'use strict';
const schema = process.env.DB_SCHEMA || 'administracion';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable({ tableName: 'compras', schema }, {
      id_compra: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      id_proveedor: { type: Sequelize.UUID, allowNull: false, references: { model: { tableName: 'proveedores', schema }, key: 'id_proveedor' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      numero_factura: { type: Sequelize.STRING(100), allowNull: true },
      fecha_compra: { type: Sequelize.DATEONLY, allowNull: false, defaultValue: Sequelize.literal('CURRENT_DATE') },
      subtotal: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      impuesto: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      descuento: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      total: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      id_estado: { type: Sequelize.UUID, allowNull: false, references: { model: { tableName: 'estados', schema }, key: 'id_estado' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      observaciones: { type: Sequelize.TEXT, allowNull: true },
      usuario_creacion: { type: Sequelize.UUID, allowNull: true },
      usuario_actualizacion: { type: Sequelize.UUID, allowNull: true },
      fecha_creacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      fecha_actualizacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.createTable({ tableName: 'compras_detalle', schema }, {
      id_detalle: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      id_compra: { type: Sequelize.UUID, allowNull: false, references: { model: { tableName: 'compras', schema }, key: 'id_compra' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      id_producto: { type: Sequelize.UUID, allowNull: false, references: { model: { tableName: 'productos', schema }, key: 'id_producto' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      cantidad: { type: Sequelize.INTEGER, allowNull: false },
      precio_unitario: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      descuento: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      impuesto: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      subtotal: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      total: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      fecha_creacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      fecha_actualizacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.addIndex({ tableName: 'compras', schema }, ['id_proveedor'], { name: 'idx_compras_proveedor' });
    await queryInterface.addIndex({ tableName: 'compras', schema }, ['id_estado'], { name: 'idx_compras_estado' });
    await queryInterface.addIndex({ tableName: 'compras_detalle', schema }, ['id_compra'], { name: 'idx_compras_detalle_compra' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'compras_detalle', schema });
    await queryInterface.dropTable({ tableName: 'compras', schema });
  },
};
