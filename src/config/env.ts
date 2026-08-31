import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getEnvNumber = (key: string, fallback: number): number => {
  const value = process.env[key];
  if (value === undefined) return fallback;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) throw new Error(`Environment variable ${key} must be a number`);
  return parsed;
};

export const env = {
  // Server
  port: getEnvNumber('PORT', 3000),
  nodeEnv: getEnv('NODE_ENV', 'development'),
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',

  // Database
  db: {
    host: getEnv('DB_HOST', 'localhost'),
    port: getEnvNumber('DB_PORT', 5432),
    name: getEnv('DB_NAME', 'inventario_db'),
    user: getEnv('DB_USER', 'postgres'),
    password: getEnv('DB_PASSWORD', ''),
    ssl: process.env.DB_SSL === 'true',
    schema: getEnv('DB_SCHEMA', 'administracion'),
  },

  // JWT
  jwt: {
    secret: getEnv('JWT_SECRET'),
    expiresIn: getEnv('JWT_EXPIRES_IN', '8h'),
    refreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  // CORS
  cors: {
    origin: getEnv('CORS_ORIGIN', 'http://localhost:4200,https://inventariou.netlify.app'),
  },

  // Bcrypt
  bcrypt: {
    saltRounds: getEnvNumber('BCRYPT_SALT_ROUNDS', 12),
  },

  // Rate limiting
  rateLimit: {
    windowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000),
    max: getEnvNumber('RATE_LIMIT_MAX', 100),
    authMax: getEnvNumber('AUTH_RATE_LIMIT_MAX', 10),
  },

  // Admin seed
  admin: {
    username: getEnv('ADMIN_USERNAME', 'admin'),
    email: getEnv('ADMIN_EMAIL', 'admin@inventario.com'),
    password: getEnv('ADMIN_PASSWORD', 'Admin1234!'),
    nombre: getEnv('ADMIN_NOMBRE', 'Administrador'),
    apellido: getEnv('ADMIN_APELLIDO', 'Sistema'),
  },
};
