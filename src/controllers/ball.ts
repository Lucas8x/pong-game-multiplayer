export class Ball {
  private chanceToInvertDirection = 0.5;
  public directions: {
    x: 'left' | 'right';
    y: 'up' | 'down';
  };
  private initialPos: { x: number; y: number };

  constructor(public x: number, public y: number /* , public limit: number */) {
    this.x = x;
    this.y = y;
    this.directions = { x: 'left', y: 'up' };
    //this.limit = limit;
    this.initialPos = { x, y };
  }

  public randomBallDirection(): void {
    this.directions.x =
      Math.random() > this.chanceToInvertDirection ? 'left' : 'right';
    this.directions.y =
      Math.random() > this.chanceToInvertDirection ? 'up' : 'down';
  }

  public invertBallDirection(direction: string): void {
    if (direction === 'x') {
      this.directions.x = this.directions.x === 'left' ? 'right' : 'left';
    } else {
      this.directions.y = this.directions.y === 'up' ? 'down' : 'up';
    }
  }

  public moveBall(): void {
    this.directions.x === 'left' ? (this.x -= 1) : (this.x += 1);
    this.directions.y === 'up' ? (this.y -= 1) : (this.y += 1);
  }

  public reset(): void {
    this.x = this.initialPos.x;
    this.y = this.initialPos.y;
  }
}
