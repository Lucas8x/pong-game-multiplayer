import chalk from 'chalk';

import { SocketServer } from '../socketio';
import { log } from '../utils';
import { Ball } from './ball';
import { Player } from './player';

export class Game {
  private io = SocketServer.getInstance();
  private intervals: NodeJS.Timeout[];
  public id: string;
  private started: boolean;
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
  public settings: {
    ball_speed: number;
    tick_rate: number;
  };

  constructor(id: string, ball_speed: number, tick_rate: number) {
    this.intervals = [];
    this.id = id;
    this.started = false;
    this.state = {
      players: {},
      screen: {
        width: 15,
        height: 15,
      },
      ball: new Ball(7, 7),
    };
    this.settings = {
      ball_speed,
      tick_rate,
    };
  }

  public log = (message?: any): void =>
    log(chalk`[{yellow GAME}][{yellow ${this.id}}] ${message}`);

  private playersLength = (): number => Object.keys(this.state.players).length;

  public addPlayer(playerId: string): void {
    if (this.state.players[playerId]) return;

    this.state.players[playerId] =
      this.playersLength() === 0
        ? new Player(1, 1)
        : new Player(this.state.screen.width - 2, this.state.screen.height - 2);
    this.log(`Player ${chalk.cyan(playerId)} entered game.`);
  }

  public removePlayer(playerId: string): void {
    this.log(`Player ${chalk.cyan(playerId)} left the game.`);
    delete this.state.players[playerId];
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

  public switchReady(playerId: string): void {
    const player = this.state.players[playerId];
    if (!player || player.ready) return;

    player.switchReady();
    this.log(`Player ${chalk.cyan(playerId)} is ready`);
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
      this.log('Stopped, not enough players.');
    }
  }

  private stateToBeSend() {
    const { x, y } = this.state.ball;
    return {
      ball: { x, y },
      players: { ...this.state.players },
      screen: { ...this.state.screen },
    };
  }

  private isBothPlayersReady(): boolean {
    const players = Object.values(this.state.players);
    const ready1 = players[0]?.ready;
    const ready2 = players[1]?.ready;
    return ready1 && ready2;
  }

  public start() {
    if (this.started || this.playersLength() < 2) return;

    clearInterval(this.intervals[2]);
    this.started = true;
    this.log('Starting...');

    this.intervals[0] = setInterval(() => {
      this.state.ball.moveBall();
      this.checkBallCollision();
    }, 1000 / this.settings.ball_speed);

    this.intervals[1] = setInterval(() => {
      this.hasEnoughPlayers();
      this.io.emit('state', this.stateToBeSend());
    }, 1000 / this.settings.tick_rate);
  }

  public waiting() {
    this.intervals[2] = setInterval(() => {
      if (this.started) return;

      if (this.isBothPlayersReady()) {
        this.log('Both players are ready');
        this.start();
      }
    }, 1000);
  }

  public stop(): void {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];
    this.started = false;
    this.waiting();
  }
}
