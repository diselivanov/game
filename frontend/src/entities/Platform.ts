// Platform.ts
import { Sprite, Texture, Graphics } from "pixi.js";
import Matter from "matter-js";

export class Platform {
  public graphics: Sprite | Graphics;
  public body: Matter.Body;
  public width: number;
  public height: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    texture?: Texture,
  ) {
    this.width = width;
    this.height = height;

    // Создание статического физического тела
    this.body = Matter.Bodies.rectangle(x, y, width, height, {
      isStatic: true,
    });

    // Создание графического представления
    if (texture) {
      this.graphics = new Sprite(texture);
      this.graphics.width = width;
      this.graphics.height = height;
    } else {
      this.graphics = new Graphics();
      this.graphics.beginFill(0x00ff00);
      this.graphics.drawRect(0, 0, width, height);
      this.graphics.endFill();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.graphics as any).anchor?.set?.(0.5); // Безопасное использование anchor
    this.graphics.position.set(x, y);
  }

  update(): void {
    // Синхронизация графики с физикой
    this.graphics.position.set(this.body.position.x, this.body.position.y);
  }
}
