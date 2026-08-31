'use strict';
const schema = process.env.DB_SCHEMA || 'administracion';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable({ tableName: 'proveedores', schema }, {
      id_proveedor: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      tipo_documento: { type: Sequelize.STRING(20), allowNull: false },
      numero_documento: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      razon_social: { type: Sequelize.STRING(200), allowNull: false },
      nombre_contacto: { type: Sequelize.STRING(200), allowNull: true },
      telefono: { type: Sequelize.STRING(20), allowNull: true },
      email: { type: Sequelize.STRING(255), allowNull: true },
      direccion: { type: Sequelize.TEXT, allowNull: true },
      ciudad: { type: Sequelize.STRING(100), allowNull: true },
      observaciones: { type: Sequelize.TEXT, allowNull: true },
      activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      usuario_creacion: { type: Sequelize.UUID, allowNull: true },
      usuario_actualizacion: { type: Sequelize.UUID, allowNull: true },
      fecha_creacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      fecha_actualizacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex({ tableName: 'proveedores', schema }, ['numero_documento'], { name: 'idx_proveedores_documento' });
    await queryInterface.addIndex({ tableName: 'proveedores', schema }, ['razon_social'], { name: 'idx_proveedores_razon_social' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'proveedores', schema });
  },
};
