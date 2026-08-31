'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const schema = process.env.DB_SCHEMA || 'administracion';
    await queryInterface.sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);
  },

  async down(queryInterface) {
    const schema = process.env.DB_SCHEMA || 'administracion';
    // Only drop if empty — safety first
    await queryInterface.sequelize.query(
      `DROP SCHEMA IF EXISTS "${schema}" RESTRICT;`,
    );
  },
};
