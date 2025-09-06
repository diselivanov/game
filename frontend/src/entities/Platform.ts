// src/entities/Platform.ts
import { Sprite, Texture, Graphics } from "pixi.js";
import Matter from "matter-js";

/**
 * Класс платформы - статическая поверхность для взаимодействия
 * Сочетает графическое представление и физическое тело
 */
export class Platform {
  public graphics: Sprite | Graphics;
  public body: Matter.Body;
  public width: number;
  public height: number;
  public vertices: Matter.Vector[];

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    texture?: Texture,
    vertices?: Matter.Vector[],
  ) {
    this.width = width;
    this.height = height;

    // Используем переданные вершины или создаем прямоугольник по умолчанию
    this.vertices = vertices || this.createDefaultVertices(width, height);

    // Создание физического тела с произвольной формой
    this.body = Matter.Bodies.fromVertices(x, y, [this.vertices], {
      isStatic: true,
      render: {
        fillStyle: "#000000",
        strokeStyle: "#ffffff",
        lineWidth: 1,
      },
    });

    // Создание графического представления
    if (texture) {
      this.graphics = new Sprite(texture);
      this.graphics.width = width;
      this.graphics.height = height;
    } else {
      this.graphics = new Graphics();
      this.graphics.beginFill(0x00ff00);
      this.drawPlatformShape(this.graphics, this.vertices);
      this.graphics.endFill();
    }

    // Установка якоря (центра) для спрайта
    if ("anchor" in this.graphics) {
      this.graphics.anchor.set(0.5);
    }

    this.graphics.position.set(x, y);
  }

  /**
   * Создание вершин по умолчанию (прямоугольник)
   * Используется только если не переданы пользовательские вершины
   */
  private createDefaultVertices(
    width: number,
    height: number,
  ): Matter.Vector[] {
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    return [
      { x: -halfWidth, y: -halfHeight },
      { x: halfWidth, y: -halfHeight },
      { x: halfWidth, y: halfHeight },
      { x: -halfWidth, y: halfHeight },
    ];
  }

  /**
   * Отрисовка формы платформы
   */
  private drawPlatformShape(
    graphics: Graphics,
    vertices: Matter.Vector[],
  ): void {
    if (vertices.length === 0) return;

    graphics.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
      graphics.lineTo(vertices[i].x, vertices[i].y);
    }
    graphics.lineTo(vertices[0].x, vertices[0].y);
  }

  /**
   * Обновление позиции графики в соответствии с физическим телом
   */
  update(): void {
    this.graphics.position.set(this.body.position.x, this.body.position.y);
    this.graphics.rotation = this.body.angle;
  }

  /**
   * Обновление позиции платформы
   */
  updatePosition(x: number, y: number): void {
    Matter.Body.setPosition(this.body, { x, y });
    this.graphics.position.set(x, y);
  }

  /**
   * Удаление платформы из физического мира
   */
  removeFromWorld(world: Matter.World): void {
    Matter.World.remove(world, this.body);
  }
}
