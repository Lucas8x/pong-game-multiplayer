export class Ball {
  public directions: {
    x: 'left' | 'right';
    y: 'up' | 'down';
  };

  constructor(public x: number, public y: number, public limit: number) {
    this.x = x;
    this.y = y;
    this.directions = { x: 'left', y: 'up' };
    this.limit = limit;
  }

  public randomBallDirection() {
    this.directions.x = Math.random() > 0.5 ? 'left' : 'right';
    this.directions.y = Math.random() > 0.5 ? 'up' : 'down';
  }

  public invertBallDirection(direction: string) {
    if (direction === 'x') {
      this.directions.x = this.directions.x === 'left' ? 'right' : 'left';
    } else {
      this.directions.y = this.directions.y === 'up' ? 'down' : 'up';
    }
  }

  public moveBall() {
    this.directions.x === 'left' ? (this.x -= 1) : (this.x += 1);
    this.directions.y === 'up' ? (this.y -= 1) : (this.y += 1);
  }
}
