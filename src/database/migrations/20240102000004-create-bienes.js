'use strict';
const schema = process.env.DB_SCHEMA || 'administracion';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable({ tableName: 'bienes', schema }, {
      id_bien: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      id_producto: { type: Sequelize.UUID, allowNull: false, references: { model: { tableName: 'productos', schema }, key: 'id_producto' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      codigo_interno: { type: Sequelize.STRING(100), allowNull: true, unique: true },
      numero_serie: { type: Sequelize.STRING(200), allowNull: true },
      id_estado: { type: Sequelize.UUID, allowNull: false, references: { model: { tableName: 'estados', schema }, key: 'id_estado' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      ubicacion: { type: Sequelize.STRING(200), allowNull: true },
      fecha_adquisicion: { type: Sequelize.DATEONLY, allowNull: true },
      precio_adquisicion: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      observaciones: { type: Sequelize.TEXT, allowNull: true },
      activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      usuario_creacion: { type: Sequelize.UUID, allowNull: true },
      usuario_actualizacion: { type: Sequelize.UUID, allowNull: true },
      fecha_eliminacion: { type: Sequelize.DATE, allowNull: true },
      fecha_creacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      fecha_actualizacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex({ tableName: 'bienes', schema }, ['id_producto'], { name: 'idx_bienes_producto' });
    await queryInterface.addIndex({ tableName: 'bienes', schema }, ['id_estado'], { name: 'idx_bienes_estado' });
    await queryInterface.addIndex({ tableName: 'bienes', schema }, ['codigo_interno'], { name: 'idx_bienes_codigo_interno' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'bienes', schema });
  },
};
