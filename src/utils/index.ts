import { enableMonitor } from './env';
import { Lobby } from '../controllers/lobby';
import { IRoomsData } from '../interfaces';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const log = !enableMonitor ? console.log : (): void => {};

export const randomID = (size = 6): string =>
  Math.random()
    .toString(36)
    .slice(2, size + 2);

export function roomsInfo(lobby: Lobby): IRoomsData {
  const rooms = lobby.getAllRooms();
  const keys = Object.keys(rooms);

  const data = keys.map((key) => {
    const room = rooms[key];
    return {
      id: room.id,
      players: room.playersLength(),
      started: room.started,
      ballSpeed: room.settings.ballSpeed,
    };
  });

  return data;
}
