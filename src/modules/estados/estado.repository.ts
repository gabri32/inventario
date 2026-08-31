import { Estado } from './estado.model';

export const EstadoRepository = {
  async findByModulo(modulo: string): Promise<Estado[]> {
    return Estado.findAll({
      where: { modulo, activo: true },
      order: [['orden', 'ASC']],
    });
  },

  async findByCodigo(codigo: string): Promise<Estado | null> {
    return Estado.findOne({ where: { codigo, activo: true } });
  },

  async findById(id: string): Promise<Estado | null> {
    return Estado.findByPk(id);
  },
};
