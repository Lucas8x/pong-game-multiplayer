interface IPlayerSpace {
  x: [number, number, number];
  y: [number];
}

export class Player {
  static playerLength = 3;
  public score: number;

  constructor(public x: number, public y: number) {
    this.x = x;
    this.y = y;
    this.score = 0;
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
}
