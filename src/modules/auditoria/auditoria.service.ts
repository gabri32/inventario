import { Auditoria } from './auditoria.model';
import { buildPagination } from '../../utils/response';
import { Op, WhereOptions } from 'sequelize';
import { AuditoriaAttributes } from './auditoria.model';

export interface RegistrarAuditoriaDto {
  id_usuario?: string;
  accion: string;
  modulo: string;
  entidad?: string;
  id_entidad?: string;
  datos_anteriores?: object;
  datos_nuevos?: object;
  ip?: string;
  user_agent?: string;
}

export const AuditoriaService = {
  async registrar(dto: RegistrarAuditoriaDto): Promise<void> {
    await Auditoria.create(dto).catch(() => {
      // Audit failures must never break the main operation
    });
  },

  async listar(query: Record<string, unknown>) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 50);
    const offset = (page - 1) * limit;
    const where: WhereOptions<AuditoriaAttributes> = {};

    if (query.id_usuario) where.id_usuario = String(query.id_usuario);
    if (query.accion) where.accion = String(query.accion);
    if (query.modulo) where.modulo = String(query.modulo);
    if (query.fecha_desde || query.fecha_hasta) {
      const fw: Record<string, unknown> = {};
      if (query.fecha_desde) fw[Op.gte as unknown as string] = new Date(String(query.fecha_desde));
      if (query.fecha_hasta) fw[Op.lte as unknown as string] = new Date(String(query.fecha_hasta));
      (where as Record<string, unknown>)['fecha_creacion'] = fw;
    }

    const { rows, count } = await Auditoria.findAndCountAll({
      where, limit, offset,
      order: [['fecha_creacion', 'DESC']],
    });
    return { registros: rows, pagination: buildPagination(page, limit, count) };
  },
};
