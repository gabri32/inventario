import { sequelize } from '../../database/models';
import { CompraRepository } from './compra.repository';
import { MovimientoRepository } from '../movimientos/movimiento.repository';
import { EstadoRepository } from '../estados/estado.repository';
import { BienRepository } from '../bienes/bien.repository';
import { NotFoundError, BusinessRuleError } from '../../utils/errors';
import { CreateCompraDto, UpdateCompraDto } from './compra.validation';
import { buildPagination } from '../../utils/response';

export const CompraService = {
  async listar(query: Record<string, unknown>) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const { rows, count } = await CompraRepository.findAll({
      page, limit,
      id_proveedor: query.id_proveedor as string,
      id_estado: query.id_estado as string,
      fecha_desde: query.fecha_desde as string,
      fecha_hasta: query.fecha_hasta as string,
    });
    return { compras: rows, pagination: buildPagination(page, limit, count) };
  },

  async obtenerPorId(id: string) {
    const c = await CompraRepository.findById(id);
    if (!c) throw new NotFoundError('Compra');
    return c;
  },

  async crear(dto: CreateCompraDto, idUsuario: string) {
    const estadoBorrador = await EstadoRepository.findByCodigo('BORRADOR');
    if (!estadoBorrador) throw new BusinessRuleError('Estado BORRADOR no configurado');

    const t = await sequelize.transaction();
    try {
      let subtotal = 0, impuesto = 0, descuento = 0;
      for (const d of dto.detalle) {
        const sub = d.cantidad * d.precio_unitario;
        subtotal += sub;
        descuento += d.descuento ?? 0;
        impuesto += d.impuesto ?? 0;
      }
      const total = subtotal + impuesto - descuento;

      const compra = await CompraRepository.create({
        id_proveedor: dto.id_proveedor,
        numero_factura: dto.numero_factura,
        fecha_compra: dto.fecha_compra ? new Date(dto.fecha_compra) : new Date(),
        subtotal, impuesto, descuento, total,
        id_estado: estadoBorrador.id_estado,
        observaciones: dto.observaciones,
        usuario_creacion: idUsuario,
      }, t);

      for (const d of dto.detalle) {
        const sub = d.cantidad * d.precio_unitario;
        const tot = sub + (d.impuesto ?? 0) - (d.descuento ?? 0);
        await CompraRepository.createDetalle({
          id_compra: compra.id_compra,
          id_producto: d.id_producto,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
          descuento: d.descuento ?? 0,
          impuesto: d.impuesto ?? 0,
          subtotal: sub,
          total: tot,
        }, t);
      }

      await t.commit();
      return CompraRepository.findById(compra.id_compra);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async confirmar(id: string, idUsuario: string) {
    const compra = await CompraRepository.findById(id);
    if (!compra) throw new NotFoundError('Compra');

    const estadoActual = (compra as unknown as { estado?: { codigo?: string } }).estado;
    if (estadoActual?.codigo !== 'BORRADOR') {
      throw new BusinessRuleError('Solo se pueden confirmar compras en estado BORRADOR');
    }

    const estadoConfirmada = await EstadoRepository.findByCodigo('CONFIRMADA');
    if (!estadoConfirmada) throw new BusinessRuleError('Estado CONFIRMADA no configurado');
    const estadoDisponible = await EstadoRepository.findByCodigo('DISPONIBLE');
    if (!estadoDisponible) throw new BusinessRuleError('Estado DISPONIBLE no configurado');

    const t = await sequelize.transaction();
    try {
      // Generate inventory movements for each detail line
      const detalle = (compra as unknown as { detalle?: Array<{ id_producto: string; cantidad: number; precio_unitario: number }> }).detalle ?? [];
      for (const d of detalle) {
        await MovimientoRepository.create({
          id_producto: d.id_producto,
          tipo_movimiento: 'ENTRADA_COMPRA',
          cantidad: d.cantidad,
          stock_anterior: 0,
          stock_nuevo: d.cantidad,
          referencia_tipo: 'COMPRA',
          referencia_id: compra.id_compra,
          usuario_creacion: idUsuario,
          observaciones: `Entrada por compra ${compra.numero_factura ?? compra.id_compra}`,
        }, t);
      }

      await CompraRepository.updateEstado(id, estadoConfirmada.id_estado, { usuario_actualizacion: idUsuario }, t);
      await t.commit();
      return CompraRepository.findById(id);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async anular(id: string, idUsuario: string) {
    const compra = await CompraRepository.findById(id);
    if (!compra) throw new NotFoundError('Compra');

    const estadoActual = (compra as unknown as { estado?: { codigo?: string } }).estado;
    if (estadoActual?.codigo === 'ANULADA') {
      throw new BusinessRuleError('La compra ya está anulada');
    }
    if (estadoActual?.codigo === 'BORRADOR') {
      // Borrador can be directly cancelled
      const estadoAnulada = await EstadoRepository.findByCodigo('ANULADA');
      if (!estadoAnulada) throw new BusinessRuleError('Estado ANULADA no configurado');
      await CompraRepository.updateEstado(id, estadoAnulada.id_estado, { usuario_actualizacion: idUsuario });
      return CompraRepository.findById(id);
    }

    const estadoAnulada = await EstadoRepository.findByCodigo('ANULADA');
    if (!estadoAnulada) throw new BusinessRuleError('Estado ANULADA no configurado');

    const t = await sequelize.transaction();
    try {
      const detalle = (compra as unknown as { detalle?: Array<{ id_producto: string; cantidad: number }> }).detalle ?? [];
      for (const d of detalle) {
        await MovimientoRepository.create({
          id_producto: d.id_producto,
          tipo_movimiento: 'AJUSTE_SALIDA',
          cantidad: d.cantidad,
          stock_anterior: d.cantidad,
          stock_nuevo: 0,
          referencia_tipo: 'COMPRA',
          referencia_id: compra.id_compra,
          usuario_creacion: idUsuario,
          observaciones: `Anulación compra ${compra.numero_factura ?? compra.id_compra}`,
        }, t);
      }
      await CompraRepository.updateEstado(id, estadoAnulada.id_estado, { usuario_actualizacion: idUsuario }, t);
      await t.commit();
      return CompraRepository.findById(id);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async actualizar(id: string, dto: UpdateCompraDto, idUsuario: string) {
    const compra = await CompraRepository.findById(id);
    if (!compra) throw new NotFoundError('Compra');
    const estadoActual = (compra as unknown as { estado?: { codigo?: string } }).estado;
    if (estadoActual?.codigo !== 'BORRADOR') {
      throw new BusinessRuleError('Solo se pueden editar compras en estado BORRADOR');
    }

    const t = await sequelize.transaction();
    try {
      if (dto.detalle) {
        await CompraRepository.deleteDetalle(id, t);
        let subtotal = 0, impuesto = 0, descuento = 0;
        for (const d of dto.detalle) {
          const sub = d.cantidad * d.precio_unitario;
          subtotal += sub;
          descuento += d.descuento ?? 0;
          impuesto += d.impuesto ?? 0;
          await CompraRepository.createDetalle({
            id_compra: id, id_producto: d.id_producto,
            cantidad: d.cantidad, precio_unitario: d.precio_unitario,
            descuento: d.descuento ?? 0, impuesto: d.impuesto ?? 0,
            subtotal: sub, total: sub + (d.impuesto ?? 0) - (d.descuento ?? 0),
          }, t);
        }
        const total = subtotal + impuesto - descuento;
        await CompraRepository.updateEstado(id, compra.id_estado, {
          id_proveedor: dto.id_proveedor ?? compra.id_proveedor,
          numero_factura: dto.numero_factura,
          fecha_compra: dto.fecha_compra ? new Date(dto.fecha_compra) : compra.fecha_compra,
          observaciones: dto.observaciones,
          subtotal, impuesto, descuento, total,
          usuario_actualizacion: idUsuario,
        }, t);
      }
      await t.commit();
      return CompraRepository.findById(id);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },
};
