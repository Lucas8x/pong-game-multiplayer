import chalk from 'chalk';

import { SocketServer } from '../socketio';
import { config, log } from '../utils';
import { Ball } from './ball';
import { Player } from './player';

export class Game {
  private io = SocketServer.getInstance();
  private intervals: NodeJS.Timeout[];
  public state: {
    players: {
      [playerId: string]: Player;
    };
    ball: Ball;
    screen: {
      width: number;
      height: number;
    };
  };

  constructor() {
    this.state = {
      players: {},
      screen: {
        width: 15,
        height: 15,
      },
      ball: new Ball(7, 7),
    };
    this.intervals = [];
  }

  private playersLength = (): number => Object.keys(this.state.players).length;

  public addPlayer(playerId: string): boolean {
    if (this.state.players[playerId]) return false;

    if (this.playersLength() === 0) {
      this.state.players[playerId] = new Player(1, 1);
      return true;
    }
    this.state.players[playerId] = new Player(
      this.state.screen.width - 2,
      this.state.screen.height - 2
    );
    return true;
  }

  public removePlayer(playerId: string): boolean {
    return delete this.state.players[playerId];
  }

  public movePlayer(playerId: string, direction: string): void {
    const player = this.state.players[playerId];

    if (!player) return;

    if (direction === 'up' && !(player.y - 1 >= 1)) return;
    if (direction === 'down' && !(player.y + 1 < this.state.screen.height - 1))
      return;

    player.movePlayer(direction);
  }

  private increaseScore(side: string): void {
    const index = side === 'left' ? 0 : 1;
    const playerId = Object.keys(this.state.players)[index];
    const player = this.state.players[playerId];
    player.increaseScore();
  }

  private checkBallCollision(): void {
    const ball = this.state.ball;

    const index = ball.directions.x === 'left' ? 0 : 1;
    const player = this.state.players[Object.keys(this.state.players)[index]];
    const playerSpace = player.playerSpace();

    // screen collision
    if (ball.y <= -1 || ball.y === this.state.screen.height) {
      return this.state.ball.invertBallDirection('y');
    }

    // player collision
    if (playerSpace.x.includes(ball.x) && playerSpace.y.includes(ball.y)) {
      return this.state.ball.invertBallDirection('x');
    }

    // after player collision
    if (ball.x <= -1 || ball.x >= this.state.screen.width) {
      this.increaseScore(ball.directions.x);
      this.state.ball.reset();
      this.state.ball.randomBallDirection();
    }
  }

  private hasEnoughPlayers(): void {
    if (this.playersLength() !== 2) {
      this.stop();
      log(chalk`[{yellow GAME}] Stopped, not enough players.`);
    }
  }

  public start(): boolean {
    if (this.intervals.length || this.playersLength() < 2) return;

    log(chalk`[{yellow GAME}] Starting...`);

    this.intervals[0] = setInterval(() => {
      this.state.ball.moveBall();
      this.checkBallCollision();
    }, 1000 / config.BALL_SPEED);

    this.intervals[1] = setInterval(() => {
      this.hasEnoughPlayers();
      this.io.emit('state', this.state);
    }, 1000 / config.TICK_RATE);

    return true;
  }

  public stop(): void {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];
  }
}
