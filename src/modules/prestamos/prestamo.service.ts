import { sequelize } from '../../database/models';
import { PrestamoRepository } from './prestamo.repository';
import { BienRepository } from '../bienes/bien.repository';
import { EstadoRepository } from '../estados/estado.repository';
import { MovimientoRepository } from '../movimientos/movimiento.repository';
import { NotFoundError, BusinessRuleError } from '../../utils/errors';
import { CreatePrestamoDto, DevolucionDto, CreatePrestatarioDto } from './prestamo.validation';
import { buildPagination } from '../../utils/response';

export const PrestamoService = {
  // ── Prestatarios ───────────────────────────────────────────────────────────
  async listarPrestatarios(query: Record<string, unknown>) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const { rows, count } = await PrestamoRepository.findAllPrestatarios({
      page, limit, search: query.search as string,
    });
    return { prestatarios: rows, pagination: buildPagination(page, limit, count) };
  },

  async crearPrestatario(dto: CreatePrestatarioDto, idUsuario: string) {
    return PrestamoRepository.createPrestatario({ ...dto, activo: true, usuario_creacion: idUsuario });
  },

  // ── Préstamos ──────────────────────────────────────────────────────────────
  async listar(query: Record<string, unknown>) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const { rows, count } = await PrestamoRepository.findAll({
      page, limit,
      id_prestatario: query.id_prestatario as string,
      id_estado: query.id_estado as string,
    });
    return { prestamos: rows, pagination: buildPagination(page, limit, count) };
  },

  async obtenerPorId(id: string) {
    const p = await PrestamoRepository.findById(id);
    if (!p) throw new NotFoundError('Préstamo');
    return p;
  },

  async crear(dto: CreatePrestamoDto, idUsuario: string) {
    const prestatario = await PrestamoRepository.findPrestatarioById(dto.id_prestatario);
    if (!prestatario) throw new NotFoundError('Prestatario');

    const estadoActivo = await EstadoRepository.findByCodigo('ACTIVO');
    if (!estadoActivo) throw new BusinessRuleError('Estado ACTIVO no configurado');
    const estadoPrestado = await EstadoRepository.findByCodigo('PRESTADO');
    if (!estadoPrestado) throw new BusinessRuleError('Estado PRESTADO no configurado');
    const estadoDisponible = await EstadoRepository.findByCodigo('DISPONIBLE');
    if (!estadoDisponible) throw new BusinessRuleError('Estado DISPONIBLE no configurado');

    // Validate all bienes are DISPONIBLE — with SELECT FOR UPDATE (concurrency control)
    const t = await sequelize.transaction();
    try {
      for (const idBien of dto.bienes) {
        // Lock the row to prevent concurrent loan of same bien
        const [rows] = await sequelize.query(
          `SELECT id_bien, id_estado FROM "${sequelize.config.database}"."${process.env.DB_SCHEMA ?? 'administracion'}"."bienes" WHERE id_bien = ${idBien} FOR UPDATE`,
          { transaction: t },
        );
        const bienRow = (rows as Array<{ id_bien: number; id_estado: string }>)[0];
        if (!bienRow) throw new NotFoundError(`Bien #${idBien}`);

        const estadoBien = await EstadoRepository.findById(bienRow.id_estado);
        if (estadoBien?.codigo !== 'DISPONIBLE') {
          throw new BusinessRuleError(`El bien #${idBien} no está disponible (estado actual: ${estadoBien?.codigo ?? 'desconocido'})`);
        }
      }

      const prestamo = await PrestamoRepository.create({
        id_prestatario: dto.id_prestatario,
        fecha_prestamo: new Date(),
        fecha_vencimiento: new Date(dto.fecha_vencimiento),
        id_estado: estadoActivo.id_estado,
        observaciones: dto.observaciones,
        usuario_responsable: idUsuario,
        usuario_creacion: idUsuario,
      }, t);

      for (const idBien of dto.bienes) {
        await PrestamoRepository.createDetalle({
          id_prestamo: prestamo.id_prestamo,
          id_bien: idBien,
        }, t);

        // Change bien status to PRESTADO
        await BienRepository.updateEstado(idBien, estadoPrestado.id_estado, undefined, idUsuario);

        // Register movement
        const bien = await BienRepository.findById(idBien);
        if (bien) {
          await MovimientoRepository.create({
            id_producto: bien.id_producto,
            id_bien: idBien,
            tipo_movimiento: 'SALIDA_PRESTAMO',
            cantidad: 1,
            stock_anterior: 1,
            stock_nuevo: 0,
            referencia_tipo: 'PRESTAMO',
            referencia_id: prestamo.id_prestamo,
            usuario_creacion: idUsuario,
            observaciones: `Préstamo a: ${prestatario.nombre} ${prestatario.apellido ?? ''}`.trim(),
          }, t);
        }
      }

      await t.commit();
      return PrestamoRepository.findById(prestamo.id_prestamo);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async devolver(id: string, dto: DevolucionDto, idUsuario: string) {
    const prestamo = await PrestamoRepository.findById(id);
    if (!prestamo) throw new NotFoundError('Préstamo');

    const estadoActual = (prestamo as unknown as { estado?: { codigo?: string } }).estado;
    if (!['ACTIVO', 'PARCIALMENTE_DEVUELTO', 'VENCIDO'].includes(estadoActual?.codigo ?? '')) {
      throw new BusinessRuleError('No se puede devolver un préstamo en estado ' + estadoActual?.codigo);
    }

    const estadoDevuelto = await EstadoRepository.findByCodigo('DEVUELTO');
    const estadoParcial = await EstadoRepository.findByCodigo('PARCIALMENTE_DEVUELTO');
    const estadoDisponible = await EstadoRepository.findByCodigo('DISPONIBLE');
    const estadoDañado = await EstadoRepository.findByCodigo('DAÑADO');
    const estadoPerdido = await EstadoRepository.findByCodigo('PERDIDO');

    if (!estadoDevuelto || !estadoDisponible) {
      throw new BusinessRuleError('Estados de devolución no configurados');
    }

    const t = await sequelize.transaction();
    try {
      const detallePrestamo = await PrestamoRepository.findDetalle(id);
      const idsBienesEnPrestamo = detallePrestamo.map((d) => d.id_bien);

      for (const item of dto.bienes) {
        if (!idsBienesEnPrestamo.includes(item.id_bien)) {
          throw new BusinessRuleError(`El bien #${item.id_bien} no pertenece a este préstamo`);
        }
        const detalleItem = detallePrestamo.find((d) => d.id_bien === item.id_bien);
        if (!detalleItem) continue;
        if (detalleItem.fecha_devolucion) {
          throw new BusinessRuleError(`El bien #${item.id_bien} ya fue devuelto`);
        }

        // Determine new bien state based on return condition
        let nuevoEstadoBienId = estadoDisponible.id_estado;
        if (item.estado_devolucion === 'CON_DAÑOS' && estadoDañado) {
          nuevoEstadoBienId = estadoDañado.id_estado;
        } else if (item.estado_devolucion === 'PERDIDO' && estadoPerdido) {
          nuevoEstadoBienId = estadoPerdido.id_estado;
        }

        await BienRepository.updateEstado(item.id_bien, nuevoEstadoBienId, item.observaciones, idUsuario);

        await PrestamoRepository.updateDetalle(detalleItem.id_detalle, {
          fecha_devolucion: new Date(),
          estado_devolucion: item.estado_devolucion ?? 'BUENO',
          observaciones: item.observaciones,
          usuario_devolucion: idUsuario,
        } as Partial<import('./prestamo.model').PrestamoDetalle>, t);

        const bien = await BienRepository.findById(item.id_bien);
        if (bien) {
          await MovimientoRepository.create({
            id_producto: bien.id_producto,
            id_bien: item.id_bien,
            tipo_movimiento: 'ENTRADA_DEVOLUCION',
            cantidad: 1,
            stock_anterior: 0,
            stock_nuevo: 1,
            referencia_tipo: 'PRESTAMO',
            referencia_id: id,
            usuario_creacion: idUsuario,
            observaciones: `Devolución - estado: ${item.estado_devolucion ?? 'BUENO'}`,
          }, t);
        }
      }

      // Check if all bienes have been returned
      const detalleActualizado = await PrestamoRepository.findDetalle(id);
      const todosDevueltos = detalleActualizado.every((d) => d.fecha_devolucion !== null);
      const nuevoEstadoPrestamo = todosDevueltos ? estadoDevuelto.id_estado : (estadoParcial?.id_estado ?? estadoDevuelto.id_estado);

      await PrestamoRepository.updateEstado(id, nuevoEstadoPrestamo, {
        fecha_devolucion: todosDevueltos ? new Date() : undefined,
        observaciones: dto.observaciones,
        usuario_actualizacion: idUsuario,
      }, t);

      await t.commit();
      return PrestamoRepository.findById(id);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },
};
