import { ProductoRepository } from './producto.repository';
import { ConflictError, NotFoundError } from '../../utils/errors';
import { CreateProductoDto, UpdateProductoDto } from './producto.validation';
import { buildPagination } from '../../utils/response';

export const ProductoService = {
  async listar(query: Record<string, unknown>) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const search = query.search ? String(query.search) : undefined;
    const id_categoria = query.id_categoria ? String(query.id_categoria) : undefined;
    const activo = query.activo === 'true' ? true : query.activo === 'false' ? false : undefined;

    const { rows, count } = await ProductoRepository.findAll({ page, limit, search, id_categoria, activo });
    return { productos: rows, pagination: buildPagination(page, limit, count) };
  },

  async obtenerPorId(id: string) {
    const prod = await ProductoRepository.findById(id);
    if (!prod) throw new NotFoundError('Producto');
    return prod;
  },

  async crear(dto: CreateProductoDto, idUsuario: string) {
    if (dto.codigo_producto) {
      const existe = await ProductoRepository.findByCodigo(dto.codigo_producto);
      if (existe) throw new ConflictError(`El código '${dto.codigo_producto}' ya está en uso`);
    }
    return ProductoRepository.create({ ...dto, activo: true, usuario_creacion: idUsuario });
  },

  async actualizar(id: string, dto: UpdateProductoDto, idUsuario: string) {
    const existe = await ProductoRepository.findById(id);
    if (!existe) throw new NotFoundError('Producto');

    if (dto.codigo_producto) {
      const dup = await ProductoRepository.findByCodigo(dto.codigo_producto, id);
      if (dup) throw new ConflictError(`El código '${dto.codigo_producto}' ya está en uso`);
    }
    return ProductoRepository.update(id, { ...dto, usuario_actualizacion: idUsuario });
  },

  async cambiarEstado(id: string, activo: boolean) {
    const existe = await ProductoRepository.findById(id);
    if (!existe) throw new NotFoundError('Producto');
    return ProductoRepository.update(id, { activo });
  },
};
