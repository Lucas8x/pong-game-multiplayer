import { enableMonitor } from './env';
import { Lobby } from '../controllers/lobby';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const log = !enableMonitor ? console.log : (): void => {};

export const randomID = (size = 6): string =>
  Math.random()
    .toString(36)
    .slice(2, size + 2);

type roomsData = Array<{
  id: string;
  players: number;
  started: boolean;
  ballSpeed: number;
}>;

export function roomsInfo(lobby: Lobby): roomsData {
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
