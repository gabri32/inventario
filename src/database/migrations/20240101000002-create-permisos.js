'use strict';

const schema = process.env.DB_SCHEMA || 'administracion';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      { tableName: 'permisos', schema },
      {
        id_permiso: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          allowNull: false,
        },
        nombre: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true,
          comment: 'Ej: USUARIO_CREAR, PRODUCTO_LISTAR',
        },
        descripcion: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        modulo: {
          type: Sequelize.STRING(100),
          allowNull: false,
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

    await queryInterface.addIndex({ tableName: 'permisos', schema }, ['nombre'], {
      name: 'idx_permisos_nombre',
    });
    await queryInterface.addIndex({ tableName: 'permisos', schema }, ['modulo'], {
      name: 'idx_permisos_modulo',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'permisos', schema });
  },
};
