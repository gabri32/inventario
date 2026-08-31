'use strict';
const schema = process.env.DB_SCHEMA || 'administracion';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable({ tableName: 'ventas', schema }, {
      id_venta: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      cliente: { type: Sequelize.STRING(200), allowNull: true },
      fecha_venta: { type: Sequelize.DATEONLY, allowNull: false, defaultValue: Sequelize.literal('CURRENT_DATE') },
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

    await queryInterface.createTable({ tableName: 'ventas_detalle', schema }, {
      id_detalle: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      id_venta: { type: Sequelize.UUID, allowNull: false, references: { model: { tableName: 'ventas', schema }, key: 'id_venta' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      id_producto: { type: Sequelize.UUID, allowNull: false, references: { model: { tableName: 'productos', schema }, key: 'id_producto' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      id_bien: { type: Sequelize.BIGINT, allowNull: true, references: { model: { tableName: 'bienes', schema }, key: 'id_bien' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      cantidad: { type: Sequelize.INTEGER, allowNull: false },
      precio_unitario: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      descuento: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      impuesto: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      subtotal: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      total: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      fecha_creacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      fecha_actualizacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.addIndex({ tableName: 'ventas', schema }, ['id_estado'], { name: 'idx_ventas_estado' });
    await queryInterface.addIndex({ tableName: 'ventas_detalle', schema }, ['id_venta'], { name: 'idx_ventas_detalle_venta' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'ventas_detalle', schema });
    await queryInterface.dropTable({ tableName: 'ventas', schema });
  },
};
