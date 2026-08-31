import { sequelize } from '../../database/models';
import { BienRepository } from './bien.repository';
import { EstadoRepository } from '../estados/estado.repository';
import { MovimientoRepository } from '../movimientos/movimiento.repository';
import { ConflictError, NotFoundError, BusinessRuleError } from '../../utils/errors';
import { CreateBienDto, UpdateBienDto, CambiarEstadoBienDto, CreateMasivaDto } from './bien.validation';
import { buildPagination } from '../../utils/response';

export const BienService = {
  async listar(query: Record<string, unknown>) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const search = query.search ? String(query.search) : undefined;
    const id_producto = query.id_producto ? String(query.id_producto) : undefined;
    const id_estado = query.id_estado ? String(query.id_estado) : undefined;
    const ubicacion = query.ubicacion ? String(query.ubicacion) : undefined;
    const activo = query.activo === 'true' ? true : query.activo === 'false' ? false : undefined;

    const { rows, count } = await BienRepository.findAll({
      page, limit, search, id_producto, id_estado, ubicacion, activo,
    });
    return { bienes: rows, pagination: buildPagination(page, limit, count) };
  },

  async obtenerPorId(id: number) {
    const bien = await BienRepository.findById(id);
    if (!bien) throw new NotFoundError('Bien');
    return bien;
  },

  async crear(dto: CreateBienDto, idUsuario: string) {
    if (dto.codigo_interno) {
      const existe = await BienRepository.findByCodigoInterno(dto.codigo_interno);
      if (existe) throw new ConflictError(`El código interno '${dto.codigo_interno}' ya está en uso`);
    }

    // Si no se manda id_estado, usar DISPONIBLE por defecto
    let idEstado = dto.id_estado;
    if (!idEstado) {
      const estadoDisponible = await EstadoRepository.findByCodigo('DISPONIBLE');
      if (!estadoDisponible) throw new BusinessRuleError('Estado DISPONIBLE no configurado en la base de datos');
      idEstado = estadoDisponible.id_estado;
    }

    const t = await sequelize.transaction();
    try {
      const bien = await BienRepository.create({
        id_producto: dto.id_producto,
        codigo_interno: dto.codigo_interno,
        numero_serie: dto.numero_serie,
        id_estado: idEstado,
        ubicacion: dto.ubicacion,
        fecha_adquisicion: dto.fecha_adquisicion ? new Date(dto.fecha_adquisicion) : undefined,
        precio_adquisicion: dto.precio_adquisicion,
        observaciones: dto.observaciones,
        activo: true,
        usuario_creacion: idUsuario,
      });

      // Register entry movement
      await MovimientoRepository.create({
        id_producto: dto.id_producto,
        id_bien: bien.id_bien,
        tipo_movimiento: 'ENTRADA_MANUAL',
        cantidad: 1,
        stock_anterior: 0,
        stock_nuevo: 1,
        referencia_tipo: 'BIEN',
        referencia_id: String(bien.id_bien),
        usuario_creacion: idUsuario,
        observaciones: 'Registro inicial de bien',
      }, t);

      await t.commit();
      return BienRepository.findById(bien.id_bien);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async crearMasivo(dto: CreateMasivaDto, idUsuario: string) {
    const t = await sequelize.transaction();
    try {
      const creados = [];
      for (const item of dto.bienes) {
        if (item.codigo_interno) {
          const existe = await BienRepository.findByCodigoInterno(item.codigo_interno);
          if (existe) throw new ConflictError(`El código interno '${item.codigo_interno}' ya está en uso`);
        }

        const bien = await BienRepository.create({
          id_producto: dto.id_producto,
          id_estado: dto.id_estado,
          ubicacion: dto.ubicacion,
          fecha_adquisicion: dto.fecha_adquisicion ? new Date(dto.fecha_adquisicion) : undefined,
          precio_adquisicion: dto.precio_adquisicion,
          codigo_interno: item.codigo_interno,
          numero_serie: item.numero_serie,
          observaciones: item.observaciones,
          activo: true,
          usuario_creacion: idUsuario,
        });

        await MovimientoRepository.create({
          id_producto: dto.id_producto,
          id_bien: bien.id_bien,
          tipo_movimiento: 'ENTRADA_MANUAL',
          cantidad: 1,
          stock_anterior: 0,
          stock_nuevo: 1,
          referencia_tipo: 'BIEN',
          referencia_id: String(bien.id_bien),
          usuario_creacion: idUsuario,
          observaciones: 'Registro inicial masivo',
        }, t);

        creados.push(bien);
      }
      await t.commit();
      return creados;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async actualizar(id: number, dto: UpdateBienDto, idUsuario: string) {
    const bien = await BienRepository.findById(id);
    if (!bien) throw new NotFoundError('Bien');

    if (dto.codigo_interno) {
      const dup = await BienRepository.findByCodigoInterno(dto.codigo_interno, id);
      if (dup) throw new ConflictError(`El código interno '${dto.codigo_interno}' ya está en uso`);
    }

    return BienRepository.update(id, {
      codigo_interno: dto.codigo_interno,
      numero_serie: dto.numero_serie,
      id_estado: dto.id_estado,
      ubicacion: dto.ubicacion,
      fecha_adquisicion: dto.fecha_adquisicion ? new Date(dto.fecha_adquisicion) : undefined,
      precio_adquisicion: dto.precio_adquisicion,
      observaciones: dto.observaciones,
      usuario_actualizacion: idUsuario,
    });
  },

  async cambiarEstado(id: number, dto: CambiarEstadoBienDto, idUsuario: string) {
    const bien = await BienRepository.findById(id);
    if (!bien) throw new NotFoundError('Bien');

    const nuevoEstado = await EstadoRepository.findById(dto.id_estado);
    if (!nuevoEstado) throw new NotFoundError('Estado');

    const estadoActual = bien.estado;

    // Business rules
    if (estadoActual?.codigo === 'VENDIDO') {
      throw new BusinessRuleError('Un bien vendido no puede cambiar de estado');
    }
    if (estadoActual?.codigo === 'BAJA') {
      throw new BusinessRuleError('Un bien dado de baja no puede cambiar de estado');
    }

    const t = await sequelize.transaction();
    try {
      const bienActualizado = await BienRepository.updateEstado(id, dto.id_estado, dto.observaciones, idUsuario);

      await MovimientoRepository.create({
        id_producto: bien.id_producto,
        id_bien: id,
        tipo_movimiento: 'CAMBIO_ESTADO',
        cantidad: 1,
        stock_anterior: 1,
        stock_nuevo: 1,
        referencia_tipo: 'BIEN',
        referencia_id: String(id),
        usuario_creacion: idUsuario,
        observaciones: `Cambio de estado: ${estadoActual?.codigo ?? '?'} → ${nuevoEstado.codigo}. ${dto.observaciones ?? ''}`,
      }, t);

      await t.commit();
      return bienActualizado;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async obtenerHistorial(id: number) {
    const bien = await BienRepository.findById(id);
    if (!bien) throw new NotFoundError('Bien');

    const movimientos = await MovimientoRepository.findByBien(id);
    return { bien, movimientos };
  },

  async buscarPorCodigo(codigo: string) {
    // The barcode is derived from id_bien
    const idBien = parseInt(codigo, 10);
    if (!isNaN(idBien)) {
      const bien = await BienRepository.findById(idBien);
      if (bien) return bien;
    }
    // Fallback: search by codigo_interno
    const bienPorCodigo = await BienRepository.findByCodigoInterno(codigo);
    if (!bienPorCodigo) throw new NotFoundError('Bien');
    return bienPorCodigo;
  },
};
