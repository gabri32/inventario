'use strict';
require('dotenv').config();
const schema = process.env.DB_SCHEMA || 'administracion';

const ESTADOS = [
  // BIENES
  { codigo: 'DISPONIBLE',    nombre: 'Disponible',            modulo: 'BIENES',    orden: 1 },
  { codigo: 'PRESTADO',      nombre: 'Prestado',              modulo: 'BIENES',    orden: 2 },
  { codigo: 'VENDIDO',       nombre: 'Vendido',               modulo: 'BIENES',    orden: 3 },
  { codigo: 'EN_REPARACION', nombre: 'En Reparación',         modulo: 'BIENES',    orden: 4 },
  { codigo: 'DAÑADO',        nombre: 'Dañado',                modulo: 'BIENES',    orden: 5 },
  { codigo: 'PERDIDO',       nombre: 'Perdido',               modulo: 'BIENES',    orden: 6 },
  { codigo: 'BAJA',          nombre: 'Dado de Baja',          modulo: 'BIENES',    orden: 7 },
  // COMPRAS
  { codigo: 'BORRADOR',      nombre: 'Borrador',              modulo: 'COMPRAS',   orden: 1 },
  { codigo: 'CONFIRMADA',    nombre: 'Confirmada',            modulo: 'COMPRAS',   orden: 2 },
  { codigo: 'ANULADA',       nombre: 'Anulada',               modulo: 'COMPRAS',   orden: 3 },
  // VENTAS
  { codigo: 'VENTA_BORRADOR',   nombre: 'Borrador',           modulo: 'VENTAS',    orden: 1 },
  { codigo: 'VENTA_CONFIRMADA', nombre: 'Confirmada',         modulo: 'VENTAS',    orden: 2 },
  { codigo: 'VENTA_ANULADA',    nombre: 'Anulada',            modulo: 'VENTAS',    orden: 3 },
  // PRESTAMOS
  { codigo: 'ACTIVO',                nombre: 'Activo',                modulo: 'PRESTAMOS', orden: 1 },
  { codigo: 'DEVUELTO',              nombre: 'Devuelto',              modulo: 'PRESTAMOS', orden: 2 },
  { codigo: 'VENCIDO',               nombre: 'Vencido',               modulo: 'PRESTAMOS', orden: 3 },
  { codigo: 'PARCIALMENTE_DEVUELTO', nombre: 'Parcialmente Devuelto', modulo: 'PRESTAMOS', orden: 4 },
  { codigo: 'CANCELADO',             nombre: 'Cancelado',             modulo: 'PRESTAMOS', orden: 5 },
];

module.exports = {
  async up(queryInterface) {
    const crypto = require('crypto');
    const now = new Date();
    const rows = ESTADOS.map((e) => ({
      id_estado: crypto.randomUUID(),
      ...e,
      descripcion: null,
      activo: true,
      fecha_creacion: now,
      fecha_actualizacion: now,
    }));
    await queryInterface.bulkInsert({ tableName: 'estados', schema }, rows);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete({ tableName: 'estados', schema }, null, {});
  },
};
