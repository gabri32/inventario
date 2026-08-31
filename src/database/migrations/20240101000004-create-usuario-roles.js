'use strict';

const schema = process.env.DB_SCHEMA || 'administracion';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      { tableName: 'usuario_roles', schema },
      {
        id_usuario: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: { tableName: 'usuarios', schema },
            key: 'id_usuario',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        id_rol: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: { tableName: 'roles', schema },
            key: 'id_rol',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
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

    await queryInterface.addConstraint(
      { tableName: 'usuario_roles', schema },
      {
        fields: ['id_usuario', 'id_rol'],
        type: 'primary key',
        name: 'pk_usuario_roles',
      },
    );

    await queryInterface.addIndex({ tableName: 'usuario_roles', schema }, ['id_usuario'], {
      name: 'idx_usuario_roles_usuario',
    });
    await queryInterface.addIndex({ tableName: 'usuario_roles', schema }, ['id_rol'], {
      name: 'idx_usuario_roles_rol',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'usuario_roles', schema });
  },
};
