import 'dotenv/config';

export const log = console.log;

export const config = {
  PORT: parseInt(process.env.PORT) || 3333,
  TICK_RATE: parseInt(process.env.TICK_RATE) || 30,
  MAX_ROOMS: parseInt(process.env.MAX_ROOMS) || 10,
  BALL_SPEED: parseInt(process.env.BALL_SPEED) || 5,
};
