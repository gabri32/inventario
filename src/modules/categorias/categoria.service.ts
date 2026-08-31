import { CategoriaRepository } from './categoria.repository';
import { ConflictError, NotFoundError } from '../../utils/errors';
import { CreateCategoriaDto, UpdateCategoriaDto } from './categoria.validation';
import { CategoriaAttributes } from './categoria.model';

export const CategoriaService = {
  async listar(query: Record<string, unknown>) {
    const search = query.search ? String(query.search) : undefined;
    const activo = query.activo === 'true' ? true : query.activo === 'false' ? false : undefined;
    return CategoriaRepository.findAll({ search, activo });
  },

  async obtenerPorId(id: string) {
    const cat = await CategoriaRepository.findById(id);
    if (!cat) throw new NotFoundError('Categoría');
    return cat;
  },

  async crear(dto: CreateCategoriaDto, idUsuario: string) {
    const existe = await CategoriaRepository.findByNombre(dto.nombre);
    if (existe) throw new ConflictError(`La categoría '${dto.nombre}' ya existe`);
    return CategoriaRepository.create({ ...dto, activo: true, usuario_creacion: idUsuario });
  },

  async actualizar(id: string, dto: UpdateCategoriaDto, idUsuario: string) {
    const existe = await CategoriaRepository.findById(id);
    if (!existe) throw new NotFoundError('Categoría');
    if (dto.nombre) {
      const dup = await CategoriaRepository.findByNombre(dto.nombre, id);
      if (dup) throw new ConflictError(`La categoría '${dto.nombre}' ya existe`);
    }
    const data: Partial<CategoriaAttributes> = { ...dto, usuario_actualizacion: idUsuario };
    return CategoriaRepository.update(id, data);
  },

  async cambiarEstado(id: string, activo: boolean) {
    const existe = await CategoriaRepository.findById(id);
    if (!existe) throw new NotFoundError('Categoría');
    return CategoriaRepository.update(id, { activo });
  },
};
