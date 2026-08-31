'use strict';

const schema = process.env.DB_SCHEMA || 'administracion';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      { tableName: 'usuarios', schema },
      {
        id_usuario: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          allowNull: false,
        },
        nombre: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        apellido: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        username: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        password_hash: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        activo: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        fecha_ultimo_acceso: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        fecha_eliminacion: {
          type: Sequelize.DATE,
          allowNull: true,
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

    await queryInterface.addIndex({ tableName: 'usuarios', schema }, ['username'], {
      name: 'idx_usuarios_username',
    });
    await queryInterface.addIndex({ tableName: 'usuarios', schema }, ['email'], {
      name: 'idx_usuarios_email',
    });
    await queryInterface.addIndex({ tableName: 'usuarios', schema }, ['activo'], {
      name: 'idx_usuarios_activo',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'usuarios', schema });
  },
};
