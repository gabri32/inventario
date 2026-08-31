import { connectDatabase } from './database/connection';
import { logger } from './utils/logger';
import { env } from './config/env';
import createApp from './app';

const startServer = async (): Promise<void> => {
  try {
    // Connect to PostgreSQL
    await connectDatabase();

    const app = createApp();

    const server = app.listen(env.port, () => {
      logger.info(`🚀 Servidor iniciado en http://localhost:${env.port}`);
      logger.info(`📘 Documentación API: http://localhost:${env.port}/api/docs`);
      logger.info(`🌍 Entorno: ${env.nodeEnv}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} recibido. Cerrando servidor...`);
      server.close(async () => {
        logger.info('Servidor HTTP cerrado');
        try {
          const { sequelize } = await import('./database/models');
          await sequelize.close();
          logger.info('Conexión a base de datos cerrada');
          process.exit(0);
        } catch (err) {
          logger.error('Error al cerrar conexión DB:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', reason);
      void shutdown('unhandledRejection');
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
