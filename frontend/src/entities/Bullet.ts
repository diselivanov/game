/* eslint-disable @typescript-eslint/no-unused-vars */
// src/entities/Bullet.ts
import { Sprite, Texture } from "pixi.js";
import { PhysicsEngine } from "../core/PhysicsEngine";

/**
 * Класс пули - снаряд, выпускаемый из оружия
 * Управляет движением, временем жизни и визуализацией
 */
export class Bullet {
  public sprite: Sprite; // Графическое представление пули
  public velocity: { x: number; y: number }; // Вектор скорости
  public lifetime: number = 2000; // Время жизни в миллисекундах
  public createdAt: number; // Время создания
  public angle: number; // Угол движения в радианах

  /**
   * Создание пули
   * @param x - Начальная позиция X
   * @param y - Начальная позиция Y
   * @param angle - Угол выстрела в радианах
   * @param speed - Скорость движения
   * @param texture - Текстура пули
   * @param _physics - Физический движок (для расширения функционала)
   */
  constructor(
    x: number,
    y: number,
    angle: number,
    speed: number,
    texture: Texture,
    _physics: PhysicsEngine,
  ) {
    // Создание спрайта пули
    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5); // Центровка
    this.sprite.position.set(x, y); // Начальная позиция
    this.sprite.scale.set(0.5); // Масштаб
    this.sprite.rotation = angle; // Поворот по направлению

    this.angle = angle; // Сохранение угла
    this.createdAt = Date.now(); // Время создания

    // Расчет вектора скорости на основе угла
    this.velocity = {
      x: Math.cos(angle) * speed, // Горизонтальная компонента
      y: Math.sin(angle) * speed, // Вертикальная компонента
    };
  }

  /**
   * Обновление состояния пули
   * @returns true если пулю нужно удалить (истекло время жизни)
   */
  update(): boolean {
    // Проверка истечения времени жизни
    if (Date.now() - this.createdAt > this.lifetime) {
      return true; // Пуля должна быть удалена
    }

    // Обновление позиции на основе скорости
    this.sprite.x += this.velocity.x;
    this.sprite.y += this.velocity.y;

    return false; // Пуля продолжает существовать
  }

  /**
   * Уничтожение пули и очистка ресурсов
   * @param _physics - Физический движок (для расширения функционала)
   */
  destroy(_physics: PhysicsEngine): void {
    // Очистка спрайта
    if (this.sprite.parent) {
      this.sprite.parent.removeChild(this.sprite);
    }
    this.sprite.destroy();
  }
}
