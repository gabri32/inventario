import request from 'supertest';
import createApp from '../../app';
import { env } from '../../config/env';

// Mock database connection for integration tests
jest.mock('../../database/connection', () => ({
  connectDatabase: jest.fn().mockResolvedValue(undefined),
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(undefined),
    define: jest.fn(),
    query: jest.fn(),
  },
}));

jest.mock('../../database/models', () => ({
  sequelize: {
    authenticate: jest.fn(),
    define: jest.fn(),
    query: jest.fn(),
  },
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
  Rol: {
    init: jest.fn(),
    belongsToMany: jest.fn(),
    findByPk: jest.fn(),
  },
  Permiso: {
    init: jest.fn(),
    belongsToMany: jest.fn(),
  },
}));

describe('GET /api/health', () => {
  const app = createApp();

  it('debe retornar 200 con estado ok', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data).toHaveProperty('timestamp');
    expect(res.body.data).toHaveProperty('uptime');
    expect(res.body.data).toHaveProperty('environment');
  });

  it('debe permitir CORS desde el frontend de Netlify', async () => {
    const previousOrigin = env.cors.origin;
    env.cors.origin = 'https://inventariou.netlify.app,http://localhost:4200';

    const res = await request(createApp())
      .get('/api/health')
      .set('Origin', 'https://inventariou.netlify.app');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('https://inventariou.netlify.app');
    expect(res.headers['access-control-allow-credentials']).toBe('true');

    env.cors.origin = previousOrigin;
  });

  it('debe retornar 404 para rutas inexistentes', async () => {
    const res = await request(app).get('/api/ruta-que-no-existe');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
