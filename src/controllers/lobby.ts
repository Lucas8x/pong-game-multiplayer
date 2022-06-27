import chalk from 'chalk';
import { Socket } from 'socket.io';

import { IDirectEnterRoom } from '../interfaces';
import { log, randomID } from '../utils';

import { Game } from './game';
import { Player } from './player';

export class Lobby {
  private rooms: {};

  constructor(private maxRooms: number = 50) {
    this.rooms = {};
    this.createRoom();
  }

  public log = (message?: any): void =>
    log(
      chalk`[{blue LOBBY}] [{blue ${this.roomsLength()}/${
        this.maxRooms
      }}] ${message}`
    );

  public getAllRooms = (): { [key: string]: Game } => this.rooms;

  public getRoom = (id: string): Game | undefined => this.rooms[id];

  private getRoomsIds = () => Object.keys(this.rooms);

  public roomsLength = () => this.getRoomsIds().length;

  public createRoom({ ballSpeed = 5, tickRate = 60 }: any = {}):
    | string
    | undefined {
    const roomsIds = this.getRoomsIds();
    if (roomsIds.length === this.maxRooms) return;

    const id = randomID();
    const game = new Game(id, ballSpeed, tickRate);
    this.rooms[id] = game;

    this.log(chalk`Created room: {blue ${id}}`);

    return id;
  }

  private deleteRoom() {}

  private getAvaliableRooms() {
    const rooms = Object.values(this.rooms);
    const avaliableRooms = rooms.filter((room: Game) => room.avaliable());
    return avaliableRooms as Array<Game>;
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

  public quickJoin(socket: Socket) {
    const { id } = socket;
    this.log(chalk`{cyan ${id}} matchmaking...`);

    const rooms = this.getAvaliableRooms();

    const roomId = rooms.length > 0 ? rooms[0].id : this.createRoom();
    if (!roomId) return;

    this.directEnterRoom(socket, roomId);
  }
}
