import { Socket } from 'socket.io';
import chalk from 'chalk';

import { log, config, randomID } from '../utils';
import { Game } from './game';

export class Lobby {
  private rooms: {};

  constructor(private max_rooms: number = 50) {
    this.rooms = {};
  }

  public log = (message?: any): void => log(chalk`[{blue LOBBY}] ${message}`);

  public getAllRooms = () => this.rooms;

  public getRoom = (id: string) => this.rooms[id];

  private getRoomsIds = () => Object.keys(this.rooms);

  private roomsLength = () => this.getRoomsIds().length;

  public createRoom({ ball_speed, tick_rate }) {
    const roomsIds = this.getRoomsIds();
    if (roomsIds.length === this.max_rooms) {
      return null;
    }

    const id = randomID();
    const game = new Game(id, ball_speed, tick_rate);
    this.rooms[id] = game;
    this.log(
      `[${chalk.blue(
        `${this.roomsLength()}/${this.max_rooms}`
      )}] Created room: ${chalk.blue(id)}`
    );
    game.waiting();
    return game;
  }
}
