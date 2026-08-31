'use strict';

const schema = process.env.DB_SCHEMA || 'administracion';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      { tableName: 'roles', schema },
      {
        id_rol: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          allowNull: false,
        },
        nombre: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true,
        },
        descripcion: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        activo: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        fecha_creacion: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('NOW()'),
        },
        fecha_actualizacion: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('NOW()'),
        },
      },
    );

    await queryInterface.addIndex({ tableName: 'roles', schema }, ['nombre'], {
      name: 'idx_roles_nombre',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'roles', schema });
  },
};
