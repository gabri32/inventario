'use strict';
const schema = process.env.DB_SCHEMA || 'administracion';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable({ tableName: 'prestatarios', schema }, {
      id_prestatario: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      tipo: { type: Sequelize.STRING(50), allowNull: false, defaultValue: 'EXTERNO' },
      nombre: { type: Sequelize.STRING(200), allowNull: false },
      apellido: { type: Sequelize.STRING(200), allowNull: true },
      identificacion: { type: Sequelize.STRING(50), allowNull: true },
      cargo: { type: Sequelize.STRING(100), allowNull: true },
      dependencia: { type: Sequelize.STRING(200), allowNull: true },
      telefono: { type: Sequelize.STRING(20), allowNull: true },
      email: { type: Sequelize.STRING(255), allowNull: true },
      observaciones: { type: Sequelize.TEXT, allowNull: true },
      activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      usuario_creacion: { type: Sequelize.UUID, allowNull: true },
      fecha_creacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      fecha_actualizacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.createTable({ tableName: 'prestamos', schema }, {
      id_prestamo: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      id_prestatario: { type: Sequelize.UUID, allowNull: false, references: { model: { tableName: 'prestatarios', schema }, key: 'id_prestatario' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      fecha_prestamo: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      fecha_vencimiento: { type: Sequelize.DATE, allowNull: false },
      fecha_devolucion: { type: Sequelize.DATE, allowNull: true },
      id_estado: { type: Sequelize.UUID, allowNull: false, references: { model: { tableName: 'estados', schema }, key: 'id_estado' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      observaciones: { type: Sequelize.TEXT, allowNull: true },
      usuario_responsable: { type: Sequelize.UUID, allowNull: true },
      usuario_creacion: { type: Sequelize.UUID, allowNull: true },
      usuario_actualizacion: { type: Sequelize.UUID, allowNull: true },
      fecha_creacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      fecha_actualizacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.createTable({ tableName: 'prestamos_detalle', schema }, {
      id_detalle: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      id_prestamo: { type: Sequelize.UUID, allowNull: false, references: { model: { tableName: 'prestamos', schema }, key: 'id_prestamo' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      id_bien: { type: Sequelize.BIGINT, allowNull: false, references: { model: { tableName: 'bienes', schema }, key: 'id_bien' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      fecha_devolucion: { type: Sequelize.DATE, allowNull: true },
      estado_devolucion: { type: Sequelize.STRING(50), allowNull: true },
      observaciones: { type: Sequelize.TEXT, allowNull: true },
      usuario_devolucion: { type: Sequelize.UUID, allowNull: true },
      fecha_creacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      fecha_actualizacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.addIndex({ tableName: 'prestamos', schema }, ['id_prestatario'], { name: 'idx_prestamos_prestatario' });
    await queryInterface.addIndex({ tableName: 'prestamos', schema }, ['id_estado'], { name: 'idx_prestamos_estado' });
    await queryInterface.addIndex({ tableName: 'prestamos', schema }, ['fecha_vencimiento'], { name: 'idx_prestamos_vencimiento' });
    await queryInterface.addIndex({ tableName: 'prestamos_detalle', schema }, ['id_prestamo'], { name: 'idx_prestamos_detalle_prestamo' });
    await queryInterface.addIndex({ tableName: 'prestamos_detalle', schema }, ['id_bien'], { name: 'idx_prestamos_detalle_bien' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'prestamos_detalle', schema });
    await queryInterface.dropTable({ tableName: 'prestamos', schema });
    await queryInterface.dropTable({ tableName: 'prestatarios', schema });
  },
};
