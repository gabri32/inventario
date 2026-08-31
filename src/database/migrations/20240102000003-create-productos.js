'use strict';
const schema = process.env.DB_SCHEMA || 'administracion';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable({ tableName: 'productos', schema }, {
      id_producto: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      codigo_producto: { type: Sequelize.STRING(50), allowNull: true, unique: true },
      nombre: { type: Sequelize.STRING(200), allowNull: false },
      descripcion: { type: Sequelize.TEXT, allowNull: true },
      id_categoria: { type: Sequelize.UUID, allowNull: true, references: { model: { tableName: 'categorias', schema }, key: 'id_categoria' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      marca: { type: Sequelize.STRING(100), allowNull: true },
      modelo: { type: Sequelize.STRING(100), allowNull: true },
      unidad_medida: { type: Sequelize.STRING(50), allowNull: false, defaultValue: 'UNIDAD' },
      stock_minimo: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      stock_maximo: { type: Sequelize.INTEGER, allowNull: true },
      precio_compra: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      precio_venta: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      usuario_creacion: { type: Sequelize.UUID, allowNull: true },
      usuario_actualizacion: { type: Sequelize.UUID, allowNull: true },
      fecha_creacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      fecha_actualizacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex({ tableName: 'productos', schema }, ['nombre'], { name: 'idx_productos_nombre' });
    await queryInterface.addIndex({ tableName: 'productos', schema }, ['id_categoria'], { name: 'idx_productos_categoria' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'productos', schema });
  },
};
