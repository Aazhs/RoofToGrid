/** Server entry point with graceful shutdown (NFR-O1). */
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import { disconnectPrisma } from './lib/prisma';

const app = createApp();

// Render Uptime Robot: Keep free-tier instances awake by pinging ourselves every 14 minutes.
const startKeepAlive = () => {
  const url = process.env.RENDER_EXTERNAL_URL; // Provided automatically by Render
  if (url) {
    logger.info(`Starting keep-alive ping for ${url}`);
    setInterval(() => {
      fetch(`${url}/health`)
        .then((res) => logger.debug(`Keep-alive ping status: ${res.status}`))
        .catch((err) => logger.error({ err }, 'Keep-alive ping failed'));
    }, 14 * 60 * 1000); // 14 minutes
  }
};

const server = app.listen(env.PORT, () => {
  logger.info(
    { port: env.PORT, env: env.NODE_ENV, storage: env.STORAGE_DRIVER, yieldEngine: env.YIELD_ENGINE },
    'RoofToGrid API listening',
  );
  startKeepAlive();
});

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'shutting down');
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
  // Do not hang forever if a connection refuses to close.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'unhandled promise rejection');
});
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'uncaught exception');
  process.exit(1);
});
