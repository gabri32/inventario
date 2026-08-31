'use strict';
const schema = process.env.DB_SCHEMA || 'administracion';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable({ tableName: 'auditoria', schema }, {
      id_auditoria: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      id_usuario: { type: Sequelize.UUID, allowNull: true },
      accion: { type: Sequelize.STRING(50), allowNull: false },
      modulo: { type: Sequelize.STRING(100), allowNull: false },
      entidad: { type: Sequelize.STRING(100), allowNull: true },
      id_entidad: { type: Sequelize.STRING(100), allowNull: true },
      datos_anteriores: { type: Sequelize.JSONB, allowNull: true },
      datos_nuevos: { type: Sequelize.JSONB, allowNull: true },
      ip: { type: Sequelize.STRING(45), allowNull: true },
      user_agent: { type: Sequelize.TEXT, allowNull: true },
      fecha_creacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      fecha_actualizacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex({ tableName: 'auditoria', schema }, ['id_usuario'], { name: 'idx_auditoria_usuario' });
    await queryInterface.addIndex({ tableName: 'auditoria', schema }, ['accion'], { name: 'idx_auditoria_accion' });
    await queryInterface.addIndex({ tableName: 'auditoria', schema }, ['modulo'], { name: 'idx_auditoria_modulo' });
    await queryInterface.addIndex({ tableName: 'auditoria', schema }, ['fecha_creacion'], { name: 'idx_auditoria_fecha' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'auditoria', schema });
  },
};
