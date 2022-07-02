import { Socket } from 'socket.io';
import { IPlayerSpace } from '../interfaces';

export class Player {
  static playerLength = 3;
  public id: string;
  public x: number;
  public y: number;
  public score: number;
  public ready: boolean;

  constructor(public socket: Socket) {
    this.socket = socket;
    this.id = socket.id;
    this.score = 0;
    this.ready = false;
  }

  public setCoords(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  public playerSpace = (): IPlayerSpace => ({
    x: [this.x - 1, this.x, this.x + 1],
    y: [this.y],
  });

  public movePlayer(direction: string): void {
    direction === 'up' ? (this.y -= 1) : (this.y += 1);
  }

  public increaseScore(): void {
    this.score += 1;
  }

  public switchReady(): void {
    this.ready = !this.ready;
  }
}
