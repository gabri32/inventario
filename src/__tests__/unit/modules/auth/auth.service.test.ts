import { AuthService } from '../../../../modules/auth/auth.service';
import { UsuarioRepository } from '../../../../modules/usuarios/usuario.repository';
import * as bcryptUtils from '../../../../utils/bcrypt';
import * as jwtUtils from '../../../../utils/jwt';
import { AuthenticationError } from '../../../../utils/errors';

// Mock the repository
jest.mock('../../../../modules/usuarios/usuario.repository');
jest.mock('../../../../utils/bcrypt');
jest.mock('../../../../utils/jwt');

const mockUsuarioWithPassword = {
  id_usuario: '550e8400-e29b-41d4-a716-446655440000',
  nombre: 'Test',
  apellido: 'User',
  username: 'testuser',
  email: 'test@example.com',
  password_hash: '$2a$12$hashedpassword',
  activo: true,
  toJSON: () => ({
    id_usuario: '550e8400-e29b-41d4-a716-446655440000',
    nombre: 'Test',
    apellido: 'User',
    username: 'testuser',
    email: 'test@example.com',
    password_hash: '$2a$12$hashedpassword',
    activo: true,
  }),
  dataValues: {
    id_usuario: '550e8400-e29b-41d4-a716-446655440000',
    nombre: 'Test',
    apellido: 'User',
    username: 'testuser',
    email: 'test@example.com',
    password_hash: '$2a$12$hashedpassword',
    activo: true,
  },
};

const mockUsuarioWithRoles = {
  ...mockUsuarioWithPassword,
  roles: [
    {
      nombre: 'ADMINISTRADOR',
      permisos: [
        { nombre: 'USUARIO_LISTAR' },
        { nombre: 'USUARIO_CREAR' },
      ],
    },
  ],
};

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('debe retornar token y datos del usuario con credenciales válidas', async () => {
      (UsuarioRepository.findByUsernameOrEmail as jest.Mock).mockResolvedValue(
        mockUsuarioWithPassword,
      );
      (bcryptUtils.comparePassword as jest.Mock).mockResolvedValue(true);
      (UsuarioRepository.updateLastAccess as jest.Mock).mockResolvedValue(undefined);
      (UsuarioRepository.findByIdWithRolesAndPermissions as jest.Mock).mockResolvedValue(
        mockUsuarioWithRoles,
      );
      (jwtUtils.signToken as jest.Mock).mockReturnValue('mock.jwt.token');

      const result = await AuthService.login({
        identifier: 'testuser',
        password: 'Admin1234!',
      });

      expect(result.token).toBe('mock.jwt.token');
      expect(result.usuario).not.toHaveProperty('password_hash');
      expect(result.roles).toContain('ADMINISTRADOR');
      expect(result.permisos).toContain('USUARIO_LISTAR');
    });

    it('debe lanzar AuthenticationError si el usuario no existe', async () => {
      (UsuarioRepository.findByUsernameOrEmail as jest.Mock).mockResolvedValue(null);
      (bcryptUtils.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(
        AuthService.login({ identifier: 'noexiste', password: 'cualquier' }),
      ).rejects.toThrow(AuthenticationError);
    });

    it('debe lanzar AuthenticationError si la contraseña es incorrecta', async () => {
      (UsuarioRepository.findByUsernameOrEmail as jest.Mock).mockResolvedValue(
        mockUsuarioWithPassword,
      );
      (bcryptUtils.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(
        AuthService.login({ identifier: 'testuser', password: 'wrong' }),
      ).rejects.toThrow(AuthenticationError);
    });

    it('debe lanzar AuthenticationError si el usuario está inactivo', async () => {
      (UsuarioRepository.findByUsernameOrEmail as jest.Mock).mockResolvedValue({
        ...mockUsuarioWithPassword,
        activo: false,
      });
      (bcryptUtils.comparePassword as jest.Mock).mockResolvedValue(true);

      await expect(
        AuthService.login({ identifier: 'testuser', password: 'Admin1234!' }),
      ).rejects.toThrow(AuthenticationError);
    });

    it('no debe exponer password_hash en la respuesta', async () => {
      (UsuarioRepository.findByUsernameOrEmail as jest.Mock).mockResolvedValue(
        mockUsuarioWithPassword,
      );
      (bcryptUtils.comparePassword as jest.Mock).mockResolvedValue(true);
      (UsuarioRepository.updateLastAccess as jest.Mock).mockResolvedValue(undefined);
      (UsuarioRepository.findByIdWithRolesAndPermissions as jest.Mock).mockResolvedValue(
        mockUsuarioWithRoles,
      );
      (jwtUtils.signToken as jest.Mock).mockReturnValue('mock.jwt.token');

      const result = await AuthService.login({
        identifier: 'testuser',
        password: 'Admin1234!',
      });

      expect(result.usuario).not.toHaveProperty('password_hash');
    });
  });
});
