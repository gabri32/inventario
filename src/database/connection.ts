import { Sequelize, Options } from 'sequelize';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const sequelizeOptions: Options = {
  host: env.db.host,
  port: env.db.port,
  dialect: 'postgres',
  logging: env.isDevelopment ? (sql: string) => logger.debug(sql) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    schema: env.db.schema,
    underscored: false,
    freezeTableName: true,
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
  },
  ...(env.db.ssl && {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }),
};

export const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, sequelizeOptions);

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info(`Database connected: ${env.db.host}:${env.db.port}/${env.db.name}`);
    logger.info(`Using schema: ${env.db.schema}`);
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};
