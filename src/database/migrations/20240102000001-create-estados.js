'use strict';
const schema = process.env.DB_SCHEMA || 'administracion';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable({ tableName: 'estados', schema }, {
      id_estado: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      codigo: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      nombre: { type: Sequelize.STRING(100), allowNull: false },
      descripcion: { type: Sequelize.TEXT, allowNull: true },
      modulo: { type: Sequelize.STRING(50), allowNull: false },
      orden: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      fecha_creacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      fecha_actualizacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex({ tableName: 'estados', schema }, ['codigo'], { name: 'idx_estados_codigo' });
    await queryInterface.addIndex({ tableName: 'estados', schema }, ['modulo'], { name: 'idx_estados_modulo' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'estados', schema });
  },
};
