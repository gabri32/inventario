export const mockUsuario = {
  id_usuario: '550e8400-e29b-41d4-a716-446655440000',
  nombre: 'Test',
  apellido: 'User',
  username: 'testuser',
  email: 'test@example.com',
  password_hash: '$2a$12$dummyhash',
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
  fecha_actualizacion: new Date('2024-01-01'),
};

export const mockRolAdmin = {
  id_rol: '660e8400-e29b-41d4-a716-446655440001',
  nombre: 'ADMINISTRADOR',
  descripcion: 'Acceso total',
  activo: true,
};

export const mockPermiso = {
  id_permiso: '770e8400-e29b-41d4-a716-446655440002',
  nombre: 'USUARIO_LISTAR',
  modulo: 'USUARIOS',
  descripcion: 'Listar usuarios',
  activo: true,
};

export const validLoginPayload = {
  identifier: 'testuser',
  password: 'Admin1234!',
};

export const invalidLoginPayload = {
  identifier: 'testuser',
  password: 'wrongpassword',
};
