import chalk from 'chalk';
import { Socket } from 'socket.io';

import { IAllRooms, IDirectEnterRoom, ILobbyCreateRoom } from '../interfaces';
import { log, randomID } from '../utils';
import { config } from '../utils/env';

import { Game } from './game';
import { Player } from './player';

const { BALL_SPEED, TICK_RATE } = config;

export class Lobby {
  private rooms: IAllRooms;

  constructor(private maxRooms: number = 50) {
    this.rooms = {};
  }

  private log = (message?: any): void =>
    log(
      chalk`[{blue LOBBY}] [{blue ${this.roomsLength()}/${
        this.maxRooms
      }}] ${message}`
    );

  public getAllRooms = (): IAllRooms => this.rooms;

  private getRoom = (id: string): Game | undefined => this.rooms[id];

  private getRoomsIds = (): Array<string> => Object.keys(this.rooms);

  public roomsLength = (): number => this.getRoomsIds().length;

  public createRoom(
    ballSpeed = BALL_SPEED || 5,
    tickRate = TICK_RATE || 60
  ): ILobbyCreateRoom {
    const roomsIds = this.getRoomsIds();
    if (roomsIds.length === this.maxRooms) return;

    const id = randomID();
    const game = new Game(id, ballSpeed, tickRate);
    this.rooms[id] = game;

    this.log(
      chalk`Created room: {blue ${id}} [{blue BS:${ballSpeed}}|{blue TR:${tickRate}}]`
    );

    return id;
  }

  //private deleteRoom(): void {}

  public getAvaliableRooms(): Array<Game> {
    const rooms = Object.values(this.getAllRooms());
    const avaliableRooms = rooms.filter((room: Game) => room.avaliable());
    return avaliableRooms;
  }

  public directEnterRoom(socket: Socket, roomId: string): IDirectEnterRoom {
    const room = this.getRoom(roomId);
    if (!room) return { joined: false, msg: 'Room not found' };

    const avaliable = room?.avaliable();
    if (!avaliable) return { joined: false, msg: 'No rooms available' };

    const player = new Player(socket);
    room.addPlayer(player);

    return { joined: true };
  }

  public quickJoin(socket: Socket): void {
    const { id } = socket;
    this.log(chalk`{cyan ${id}} matchmaking...`);

    const rooms = this.getAvaliableRooms();

    const roomId = rooms.length > 0 ? rooms[0].id : this.createRoom();
    if (!roomId) return;

    this.directEnterRoom(socket, roomId);
  }
}
