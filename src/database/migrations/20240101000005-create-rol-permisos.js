'use strict';

const schema = process.env.DB_SCHEMA || 'administracion';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      { tableName: 'rol_permisos', schema },
      {
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
        id_permiso: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: { tableName: 'permisos', schema },
            key: 'id_permiso',
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
      { tableName: 'rol_permisos', schema },
      {
        fields: ['id_rol', 'id_permiso'],
        type: 'primary key',
        name: 'pk_rol_permisos',
      },
    );

    await queryInterface.addIndex({ tableName: 'rol_permisos', schema }, ['id_rol'], {
      name: 'idx_rol_permisos_rol',
    });
    await queryInterface.addIndex({ tableName: 'rol_permisos', schema }, ['id_permiso'], {
      name: 'idx_rol_permisos_permiso',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'rol_permisos', schema });
  },
};
