'use strict';

require('dotenv').config();

const schema = process.env.DB_SCHEMA || 'administracion';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const bcrypt = require('bcryptjs');
    const crypto = require('crypto');
    const now = new Date();

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234!';
    const password_hash = await bcrypt.hash(adminPassword, saltRounds);

    const idUsuarioAdmin = crypto.randomUUID();

    // Insert admin user
    await queryInterface.bulkInsert({ tableName: 'usuarios', schema }, [
      {
        id_usuario: idUsuarioAdmin,
        nombre: process.env.ADMIN_NOMBRE || 'Administrador',
        apellido: process.env.ADMIN_APELLIDO || 'Sistema',
        username: process.env.ADMIN_USERNAME || 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@inventario.com',
        password_hash,
        activo: true,
        fecha_creacion: now,
        fecha_actualizacion: now,
      },
    ]);

    // Find ADMINISTRADOR role ID
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id_rol FROM "${schema}"."roles" WHERE nombre = 'ADMINISTRADOR' LIMIT 1`,
    );

    if (!roles || roles.length === 0) {
      throw new Error(
        'Rol ADMINISTRADOR no encontrado. Ejecuta el seeder de roles primero.',
      );
    }

    const idRolAdmin = roles[0].id_rol;

    // Assign ADMINISTRADOR role to admin user
    await queryInterface.bulkInsert({ tableName: 'usuario_roles', schema }, [
      {
        id_usuario: idUsuarioAdmin,
        id_rol: idRolAdmin,
        fecha_creacion: now,
        fecha_actualizacion: now,
      },
    ]);

    console.log(`✅ Usuario admin creado: ${process.env.ADMIN_USERNAME || 'admin'}`);
    console.log(`📧 Email: ${process.env.ADMIN_EMAIL || 'admin@inventario.com'}`);
  },

  async down(queryInterface) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    await queryInterface.bulkDelete(
      { tableName: 'usuario_roles', schema },
      {
        id_usuario: queryInterface.sequelize.literal(
          `(SELECT id_usuario FROM "${schema}"."usuarios" WHERE username = '${username}')`,
        ),
      },
      {},
    );
    await queryInterface.bulkDelete(
      { tableName: 'usuarios', schema },
      { username },
      {},
    );
  },
};
