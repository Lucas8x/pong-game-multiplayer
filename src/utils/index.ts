import { enableMonitor } from './env';

export const log = !enableMonitor ? console.log : () => {};

export const randomID = (size = 6) =>
  Math.random()
    .toString(36)
    .slice(2, size + 2);
