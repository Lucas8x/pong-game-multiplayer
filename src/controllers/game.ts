import chalk from 'chalk';
import { IReturnGameState } from '../interfaces';

import { SocketServer } from '../socketio';
import { log } from '../utils';

import { Ball } from './ball';
import { Player } from './player';

export class Game {
  private io = SocketServer.getInstance();
  private intervals: NodeJS.Timeout[];
  public id: string;
  public started: boolean;
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
    ballSpeed: number;
    tickRate: number;
  };

  constructor(id: string, ballSpeed: number, tickRate: number) {
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
      ballSpeed,
      tickRate,
    };
  }

  /**
   * Log on console a message with game id prefix .
   * @param message
   */
  private log = (message: any): void =>
    log(chalk`[{yellow GAME}] [{yellow ${this.id}}] ${message}`);

  public playersLength = (): number => Object.keys(this.state.players).length;

  public avaliable = (): boolean => this.playersLength() < 2;

  public addPlayer(player: Player): void {
    const { id } = player;

    if (this.state.players[id] || this.playersLength() >= 2) return;

    player.socket.join(this.id);

    player.socket.on('move', ({ direction }) => {
      this.movePlayer(id, direction);
    });

    player.socket.on('ready', () => {
      if (this.started) return;
      player.switchReady();
      this.log(
        chalk`Player {cyan ${id}} is ${player.ready ? 'ready' : 'unready'}.`
      );
      this.tryStart();
    });

    player.socket.on('disconnect', () => {
      this.removePlayer(id);
    });

    const otherPlayer = this.state.players[Object.keys(this.state.players)[0]];

    if (otherPlayer?.x === 1) {
      player.setCoords(
        this.state.screen.width - 2,
        this.state.screen.height - 2
      );
    } else {
      player.setCoords(1, 1);
    }
    this.state.players[id] = player;

    this.log(
      chalk`[{yellow ${this.playersLength()}/2}] Player ${chalk.cyan(
        id
      )} entered game.`
    );
  }

  private removePlayer(playerId: string): void {
    delete this.state.players[playerId];
    this.log(
      chalk`[{yellow ${this.playersLength()}/2}] Player {cyan ${playerId}} left the game.`
    );
  }

  private movePlayer(playerId: string, direction: string): void {
    const player = this.state.players[playerId];

    if (
      !player ||
      (direction === 'up' && !(player.y - 1 >= 1)) ||
      (direction === 'down' && !(player.y + 1 < this.state.screen.height - 1))
    )
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
    const { x, y } = ball;

    const index = ball.directions.x === 'left' ? 0 : 1;
    const player = this.state.players[Object.keys(this.state.players)[index]];
    const playerSpace = player?.playerSpace();

    // screen collision - top/bottom
    if (y <= -1 || y === this.state.screen.height) {
      this.state.ball.invertBallDirection('y');
      return;
    }

    // player collision
    if (
      playerSpace &&
      playerSpace.x.includes(x + (index ? 1 : -1)) &&
      playerSpace.y.includes(y)
    ) {
      this.state.ball.invertBallDirection('x');
      return;
    }

    // after player collision - left/right side
    if (x <= -1 || x >= this.state.screen.width) {
      this.increaseScore(ball.directions.x);
      this.state.ball.reset();
      this.state.ball.randomBallDirection();
    }
  }

  private reset(): void {
    this.state.ball.reset();
  }

  private hasEnoughPlayers(): void {
    if (this.playersLength() !== 2) {
      this.stop();
      this.reset();
      this.log('Stopped, not enough players.');
    }
  }

  private stateToBeSend(): IReturnGameState {
    const { x, y } = this.state.ball;

    const players = this.state.players;
    const playersData = Object.keys(players).map((key) => {
      const player = players[key];
      const { id, playerSpace } = player;
      return { id, ...playerSpace() };
    });

    const data = {
      ball: { x, y },
      players: playersData,
      screen: { ...this.state.screen },
    };

    return data;
  }

  private isBothPlayersReady(): boolean {
    const players = Object.values(this.state.players);
    const ready1 = players[0]?.ready;
    const ready2 = players[1]?.ready;
    return ready1 && ready2;
  }

  private start(): void {
    if (this.started || this.playersLength() < 2) return;

    clearInterval(this.intervals[2]);
    this.started = true;
    this.log('Starting...');

    this.intervals[0] = setInterval(() => {
      this.state.ball.moveBall();
      this.checkBallCollision();
    }, 1000 / this.settings.ballSpeed);

    this.intervals[1] = setInterval(() => {
      this.hasEnoughPlayers();
      this.io.to(this.id).emit('state', this.stateToBeSend());
    }, 1000 / this.settings.tickRate);
  }

  private tryStart(): void {
    if (this.started || !this.isBothPlayersReady()) return;

    this.log('Both players are ready');
    this.start();
  }

  private stop(): void {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];
    this.started = false;
  }
}
