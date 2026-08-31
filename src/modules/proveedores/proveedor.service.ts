import { ProveedorRepository } from './proveedor.repository';
import { ConflictError, NotFoundError } from '../../utils/errors';
import { CreateProveedorDto, UpdateProveedorDto } from './proveedor.validation';
import { buildPagination } from '../../utils/response';

export const ProveedorService = {
  async listar(query: Record<string, unknown>) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const search = query.search ? String(query.search) : undefined;
    const activo = query.activo === 'true' ? true : query.activo === 'false' ? false : undefined;
    const { rows, count } = await ProveedorRepository.findAll({ page, limit, search, activo });
    return { proveedores: rows, pagination: buildPagination(page, limit, count) };
  },

  async obtenerPorId(id: string) {
    const p = await ProveedorRepository.findById(id);
    if (!p) throw new NotFoundError('Proveedor');
    return p;
  },

  async crear(dto: CreateProveedorDto, idUsuario: string) {
    const existe = await ProveedorRepository.findByDocumento(dto.numero_documento);
    if (existe) throw new ConflictError(`El documento '${dto.numero_documento}' ya está registrado`);
    return ProveedorRepository.create({ ...dto, activo: true, usuario_creacion: idUsuario });
  },

  async actualizar(id: string, dto: UpdateProveedorDto, idUsuario: string) {
    const existe = await ProveedorRepository.findById(id);
    if (!existe) throw new NotFoundError('Proveedor');
    if (dto.numero_documento) {
      const dup = await ProveedorRepository.findByDocumento(dto.numero_documento, id);
      if (dup) throw new ConflictError(`El documento '${dto.numero_documento}' ya está registrado`);
    }
    return ProveedorRepository.update(id, { ...dto, usuario_actualizacion: idUsuario });
  },

  async cambiarEstado(id: string, activo: boolean) {
    if (!await ProveedorRepository.findById(id)) throw new NotFoundError('Proveedor');
    return ProveedorRepository.update(id, { activo });
  },
};
