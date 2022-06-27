import 'dotenv/config';
const env = process.env.NODE_ENV;

const isDevelopment = env === 'development';
const isProduction = env === 'production';

const enableMonitor = process.env.ENABLE_MONITOR === 'true';

const config = {
  PORT: parseInt(process.env.PORT) || 3333,
  TICK_RATE: parseInt(process.env.TICK_RATE) || 30,
  MAX_ROOMS: parseInt(process.env.MAX_ROOMS) || 10,
  BALL_SPEED: parseInt(process.env.BALL_SPEED) || 5,
};

export { isDevelopment, isProduction, enableMonitor, config };
