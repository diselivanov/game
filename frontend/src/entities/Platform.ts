// Представляет платформу с графическим и физическим телом, обрабатывает синхронизацию между ними

import { Sprite } from "pixi.js";
import Matter from "matter-js";

export class Platform {
  public graphics: Sprite; // Графическое представление
  public body: Matter.Body; // Физическое тело
  public width: number; // Ширина платформы
  public height: number; // Высота платформы

  constructor(x: number, y: number, width: number, height: number) {
    this.width = width;
    this.height = height;

    // Создание статического физического тела (неподвижного)
    this.body = Matter.Bodies.rectangle(x, y, width, height, {
      isStatic: true, // Неподвижное тело
    });

    // Создание графического представления
    this.graphics = new Sprite();
    this.graphics.width = width;
    this.graphics.height = height;
    this.graphics.tint = 0x00ff00; // Зеленый цвет
    this.graphics.anchor.set(0.5); // Центрирование
    this.graphics.position.set(x, y); // Начальная позиция
  }

  update(): void {
    // Синхронизация графики с физикой
    this.graphics.position.set(this.body.position.x, this.body.position.y);
  }
}
