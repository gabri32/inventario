'use strict';
const schema = process.env.DB_SCHEMA || 'administracion';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable({ tableName: 'movimientos_inventario', schema }, {
      id_movimiento: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      id_producto: { type: Sequelize.UUID, allowNull: false, references: { model: { tableName: 'productos', schema }, key: 'id_producto' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      id_bien: { type: Sequelize.BIGINT, allowNull: true, references: { model: { tableName: 'bienes', schema }, key: 'id_bien' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      tipo_movimiento: { type: Sequelize.STRING(50), allowNull: false },
      cantidad: { type: Sequelize.INTEGER, allowNull: false },
      stock_anterior: { type: Sequelize.INTEGER, allowNull: false },
      stock_nuevo: { type: Sequelize.INTEGER, allowNull: false },
      referencia_tipo: { type: Sequelize.STRING(50), allowNull: true },
      referencia_id: { type: Sequelize.STRING(100), allowNull: true },
      usuario_creacion: { type: Sequelize.UUID, allowNull: true },
      observaciones: { type: Sequelize.TEXT, allowNull: true },
      fecha_creacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      fecha_actualizacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex({ tableName: 'movimientos_inventario', schema }, ['id_producto'], { name: 'idx_movimientos_producto' });
    await queryInterface.addIndex({ tableName: 'movimientos_inventario', schema }, ['id_bien'], { name: 'idx_movimientos_bien' });
    await queryInterface.addIndex({ tableName: 'movimientos_inventario', schema }, ['tipo_movimiento'], { name: 'idx_movimientos_tipo' });
    await queryInterface.addIndex({ tableName: 'movimientos_inventario', schema }, ['fecha_creacion'], { name: 'idx_movimientos_fecha' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'movimientos_inventario', schema });
  },
};
