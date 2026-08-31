import { sequelize } from '../../database/models';
import { VentaRepository } from './venta.repository';
import { BienRepository } from '../bienes/bien.repository';
import { EstadoRepository } from '../estados/estado.repository';
import { MovimientoRepository } from '../movimientos/movimiento.repository';
import { NotFoundError, BusinessRuleError } from '../../utils/errors';
import { CreateVentaDto, UpdateVentaDto } from './venta.validation';
import { buildPagination } from '../../utils/response';

export const VentaService = {
  async listar(query: Record<string, unknown>) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const { rows, count } = await VentaRepository.findAll({
      page, limit,
      id_estado: query.id_estado as string,
      fecha_desde: query.fecha_desde as string,
      fecha_hasta: query.fecha_hasta as string,
    });
    return { ventas: rows, pagination: buildPagination(page, limit, count) };
  },

  async obtenerPorId(id: string) {
    const v = await VentaRepository.findById(id);
    if (!v) throw new NotFoundError('Venta');
    return v;
  },

  async crear(dto: CreateVentaDto, idUsuario: string) {
    const estadoBorrador = await EstadoRepository.findByCodigo('VENTA_BORRADOR');
    if (!estadoBorrador) throw new BusinessRuleError('Estado VENTA_BORRADOR no configurado');

    const t = await sequelize.transaction();
    try {
      let subtotal = 0, impuesto = 0, descuento = 0;
      for (const d of dto.detalle) {
        subtotal += d.cantidad * d.precio_unitario;
        descuento += d.descuento ?? 0;
        impuesto += d.impuesto ?? 0;
      }
      const total = subtotal + impuesto - descuento;

      const venta = await VentaRepository.create({
        cliente: dto.cliente,
        fecha_venta: dto.fecha_venta ? new Date(dto.fecha_venta) : new Date(),
        subtotal, impuesto, descuento, total,
        id_estado: estadoBorrador.id_estado,
        observaciones: dto.observaciones,
        usuario_creacion: idUsuario,
      }, t);

      for (const d of dto.detalle) {
        const sub = d.cantidad * d.precio_unitario;
        await VentaRepository.createDetalle({
          id_venta: venta.id_venta,
          id_producto: d.id_producto,
          id_bien: d.id_bien,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
          descuento: d.descuento ?? 0,
          impuesto: d.impuesto ?? 0,
          subtotal: sub,
          total: sub + (d.impuesto ?? 0) - (d.descuento ?? 0),
        }, t);
      }

      await t.commit();
      return VentaRepository.findById(venta.id_venta);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async confirmar(id: string, idUsuario: string) {
    const venta = await VentaRepository.findById(id);
    if (!venta) throw new NotFoundError('Venta');

    const estadoActual = (venta as unknown as { estado?: { codigo?: string } }).estado;
    if (estadoActual?.codigo !== 'VENTA_BORRADOR') {
      throw new BusinessRuleError('Solo se pueden confirmar ventas en estado BORRADOR');
    }

    const estadoConfirmada = await EstadoRepository.findByCodigo('VENTA_CONFIRMADA');
    if (!estadoConfirmada) throw new BusinessRuleError('Estado VENTA_CONFIRMADA no configurado');
    const estadoVendido = await EstadoRepository.findByCodigo('VENDIDO');
    if (!estadoVendido) throw new BusinessRuleError('Estado VENDIDO no configurado');

    const t = await sequelize.transaction();
    try {
      const detalle = (venta as unknown as { detalle?: Array<{ id_producto: string; id_bien?: number; cantidad: number }> }).detalle ?? [];

      for (const d of detalle) {
        if (d.id_bien) {
          // Lock bien for concurrency control
          const [rows] = await sequelize.query(
            `SELECT id_bien, id_estado FROM "${process.env.DB_SCHEMA ?? 'administracion'}"."bienes" WHERE id_bien = ${d.id_bien} FOR UPDATE`,
            { transaction: t },
          );
          const bienRow = (rows as Array<{ id_bien: number; id_estado: string }>)[0];
          if (!bienRow) throw new NotFoundError(`Bien #${d.id_bien}`);

          const estadoBien = await EstadoRepository.findById(bienRow.id_estado);
          if (estadoBien?.codigo === 'VENDIDO') throw new BusinessRuleError(`El bien #${d.id_bien} ya fue vendido`);
          if (estadoBien?.codigo === 'BAJA') throw new BusinessRuleError(`El bien #${d.id_bien} está dado de baja`);
          if (estadoBien?.codigo === 'PRESTADO') throw new BusinessRuleError(`El bien #${d.id_bien} está prestado`);

          await BienRepository.updateEstado(d.id_bien, estadoVendido.id_estado, undefined, idUsuario);
        }

        await MovimientoRepository.create({
          id_producto: d.id_producto,
          id_bien: d.id_bien,
          tipo_movimiento: 'SALIDA_VENTA',
          cantidad: d.cantidad,
          stock_anterior: d.cantidad,
          stock_nuevo: 0,
          referencia_tipo: 'VENTA',
          referencia_id: venta.id_venta,
          usuario_creacion: idUsuario,
          observaciones: `Venta a: ${venta.cliente ?? 'cliente no especificado'}`,
        }, t);
      }

      await VentaRepository.updateEstado(id, estadoConfirmada.id_estado, { usuario_actualizacion: idUsuario }, t);
      await t.commit();
      return VentaRepository.findById(id);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async anular(id: string, idUsuario: string) {
    const venta = await VentaRepository.findById(id);
    if (!venta) throw new NotFoundError('Venta');
    const estadoActual = (venta as unknown as { estado?: { codigo?: string } }).estado;
    if (estadoActual?.codigo === 'VENTA_ANULADA') throw new BusinessRuleError('La venta ya está anulada');

    const estadoAnulada = await EstadoRepository.findByCodigo('VENTA_ANULADA');
    if (!estadoAnulada) throw new BusinessRuleError('Estado VENTA_ANULADA no configurado');

    await VentaRepository.updateEstado(id, estadoAnulada.id_estado, { usuario_actualizacion: idUsuario });
    return VentaRepository.findById(id);
  },

  async actualizar(id: string, dto: UpdateVentaDto, idUsuario: string) {
    const venta = await VentaRepository.findById(id);
    if (!venta) throw new NotFoundError('Venta');
    const estadoActual = (venta as unknown as { estado?: { codigo?: string } }).estado;
    if (estadoActual?.codigo !== 'VENTA_BORRADOR') throw new BusinessRuleError('Solo se pueden editar ventas en BORRADOR');

    const t = await sequelize.transaction();
    try {
      if (dto.detalle) {
        await VentaRepository.deleteDetalle(id, t);
        let subtotal = 0, impuesto = 0, descuento = 0;
        for (const d of dto.detalle) {
          const sub = d.cantidad * d.precio_unitario;
          subtotal += sub; descuento += d.descuento ?? 0; impuesto += d.impuesto ?? 0;
          await VentaRepository.createDetalle({
            id_venta: id, id_producto: d.id_producto, id_bien: d.id_bien,
            cantidad: d.cantidad, precio_unitario: d.precio_unitario,
            descuento: d.descuento ?? 0, impuesto: d.impuesto ?? 0,
            subtotal: sub, total: sub + (d.impuesto ?? 0) - (d.descuento ?? 0),
          }, t);
        }
        await VentaRepository.updateEstado(id, venta.id_estado, {
          cliente: dto.cliente ?? venta.cliente,
          observaciones: dto.observaciones,
          subtotal, impuesto, descuento, total: subtotal + impuesto - descuento,
          usuario_actualizacion: idUsuario,
        }, t);
      }
      await t.commit();
      return VentaRepository.findById(id);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },
};
