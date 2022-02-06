export class Player {
  static playerLength = 3;
  public score: number;

  constructor(public x: number, public y: number) {
    this.x = x;
    this.y = y;
    this.score = 0;
  }

  public movePlayer(direction: string) {
    direction === 'up' ? (this.y -= 1) : (this.y += 1);
    this.playerSpace();
  }

  public increaseScore() {
    this.score += 1;
  }

  public playerSpace = () => ({
    x: [this.x - 1, this.x, this.x + 1],
    y: [this.y],
  });
}
