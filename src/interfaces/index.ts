import { Game } from '../controllers/game';

export interface IDirectEnterRoom {
  joined: boolean;
  msg?: string;
}

export interface IPlayerSpace {
  x: [number];
  y: [number, number, number];
}

export interface IAllRooms {
  [key: string]: Game;
}

export type ILobbyCreateRoom = string | undefined;

export interface IReturnGameState {
  ball: {
    x: number;
    y: number;
  };

  players: {
    id: string;
    x: [number];
    y: [number, number, number];
  }[];

  screen: {
    width: number;
    height: number;
  };
}
