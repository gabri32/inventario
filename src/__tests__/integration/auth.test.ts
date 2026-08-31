import request from 'supertest';
import createApp from '../../app';
import { UsuarioRepository } from '../../modules/usuarios/usuario.repository';
import * as bcryptUtils from '../../utils/bcrypt';

// Mock DB and models
jest.mock('../../database/connection', () => ({
  connectDatabase: jest.fn(),
  sequelize: { authenticate: jest.fn(), define: jest.fn(), query: jest.fn() },
}));

jest.mock('../../database/models', () => ({
  sequelize: { authenticate: jest.fn(), define: jest.fn(), query: jest.fn() },
  Usuario: {
    init: jest.fn(),
    belongsToMany: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    scope: jest.fn().mockReturnThis(),
  },
  Rol: { init: jest.fn(), belongsToMany: jest.fn(), findByPk: jest.fn() },
  Permiso: { init: jest.fn(), belongsToMany: jest.fn() },
}));

jest.mock('../../modules/usuarios/usuario.repository');

const mockUsuario = {
  id_usuario: '550e8400-e29b-41d4-a716-446655440000',
  nombre: 'Test',
  apellido: 'User',
  username: 'admin',
  email: 'admin@test.com',
  password_hash: '$2a$12$fakehashedpassword123',
  activo: true,
  toJSON: function () {
    return { ...this };
  },
  dataValues: {
    id_usuario: '550e8400-e29b-41d4-a716-446655440000',
    nombre: 'Test',
    apellido: 'User',
    username: 'admin',
    email: 'admin@test.com',
    password_hash: '$2a$12$fakehashedpassword123',
    activo: true,
  },
};

const mockUsuarioWithRoles = {
  ...mockUsuario,
  roles: [
    {
      nombre: 'ADMINISTRADOR',
      permisos: [{ nombre: 'USUARIO_LISTAR' }, { nombre: 'USUARIO_CREAR' }],
    },
  ],
};

describe('Auth endpoints', () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('debe retornar 200 y token con credenciales válidas', async () => {
      (UsuarioRepository.findByUsernameOrEmail as jest.Mock).mockResolvedValue(mockUsuario);
      jest.spyOn(bcryptUtils, 'comparePassword').mockResolvedValue(true);
      (UsuarioRepository.updateLastAccess as jest.Mock).mockResolvedValue(undefined);
      (UsuarioRepository.findByIdWithRolesAndPermissions as jest.Mock).mockResolvedValue(
        mockUsuarioWithRoles,
      );

      const res = await request(app).post('/api/auth/login').send({
        identifier: 'admin',
        password: 'Admin1234!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.usuario).not.toHaveProperty('password_hash');
      expect(res.body.data.roles).toContain('ADMINISTRADOR');
    });

    it('debe retornar 401 con credenciales inválidas', async () => {
      (UsuarioRepository.findByUsernameOrEmail as jest.Mock).mockResolvedValue(null);
      jest.spyOn(bcryptUtils, 'comparePassword').mockResolvedValue(false);

      const res = await request(app).post('/api/auth/login').send({
        identifier: 'noexiste',
        password: 'wrong',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('debe retornar 422 si faltan campos requeridos', async () => {
      const res = await request(app).post('/api/auth/login').send({});

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('debe retornar 422 si identifier está vacío', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ identifier: '', password: 'Admin1234!' });

      expect(res.status).toBe(422);
    });

    it('debe retornar 401 si usuario está inactivo', async () => {
      (UsuarioRepository.findByUsernameOrEmail as jest.Mock).mockResolvedValue({
        ...mockUsuario,
        activo: false,
      });
      jest.spyOn(bcryptUtils, 'comparePassword').mockResolvedValue(true);

      const res = await request(app).post('/api/auth/login').send({
        identifier: 'admin',
        password: 'Admin1234!',
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('desactivada');
    });
  });

  describe('GET /api/auth/me', () => {
    it('debe retornar 401 sin token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('debe retornar 401 con token inválido', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token.invalido.aqui');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('debe retornar 401 sin token', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(401);
    });
  });
});
