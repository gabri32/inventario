import { hashPassword, comparePassword } from '../../../utils/bcrypt';

describe('Bcrypt Utilities', () => {
  const plainPassword = 'Admin1234!';

  describe('hashPassword', () => {
    it('debe generar un hash diferente al texto plano', async () => {
      const hash = await hashPassword(plainPassword);
      expect(hash).not.toBe(plainPassword);
      expect(hash).toMatch(/^\$2[ab]\$/);
    });

    it('debe generar hashes distintos para la misma contraseña (salt)', async () => {
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('debe retornar true con contraseña correcta', async () => {
      const hash = await hashPassword(plainPassword);
      const result = await comparePassword(plainPassword, hash);
      expect(result).toBe(true);
    });

    it('debe retornar false con contraseña incorrecta', async () => {
      const hash = await hashPassword(plainPassword);
      const result = await comparePassword('ContraseñaWrong!', hash);
      expect(result).toBe(false);
    });
  });
});
