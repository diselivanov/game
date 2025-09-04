// Управляет игроком: движение, прыжки, анимация сальто, проверка земли и ограничение движения

import { Sprite } from "pixi.js";
import Matter from "matter-js";
import { PlayerConfig } from "../types";

export class Player {
  public sprite: Sprite; // Графическое представление
  public body: Matter.Body; // Физическое тело
  public isOnGround: boolean = false; // На земле ли игрок
  public isJumping: boolean = false; // В прыжке ли игрок
  public isFlipping: boolean = false; // Выполняет ли сальто
  public jumpType: string | null = null; // Тип прыжка (forward/backward)
  public direction: number = 1; // Направление взгляда (1: вправо, -1: влево)
  public flipRotation: number = 0; // Текущий угол вращения при сальто
  public flipDirection: number = 1; // Направление вращения при сальто

  private config: PlayerConfig; // Конфигурация игрока

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(x: number, y: number, texture: any, config: PlayerConfig) {
    this.config = config;

    // Создание спрайта игрока
    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5); // Центрирование
    this.sprite.position.set(x, y); // Начальная позиция
    this.sprite.scale.set(0.2); // Масштаб

    // Создание физического тела (80% от размера спрайта)
    this.body = Matter.Bodies.rectangle(
      x,
      y,
      this.sprite.width * 0.8,
      this.sprite.height * 0.8,
      { inertia: Infinity }, // Бесконечная инерция (не вращается от столкновений)
    );
  }

  update(
    platformBody: Matter.Body,
    platformHeight: number,
    platformWidth: number,
  ): void {
    // Синхронизация спрайта с физическим телом
    this.sprite.x = this.body.position.x;
    this.sprite.y = this.body.position.y;

    // Проверка нахождения на платформе
    this.isOnGround = this.checkIsOnGround(
      platformBody,
      platformHeight,
      platformWidth,
    );

    // Сброс состояния прыжка при приземлении
    if (this.isOnGround) {
      if (this.isJumping) {
        this.isJumping = false;
        this.jumpType = null;
      }
      if (this.isFlipping) {
        // Сброс вращения при приземлении
        this.sprite.rotation = 0;
        this.isFlipping = false;
      }
    }
  }

  moveLeft(): void {
    // Движение влево
    Matter.Body.setVelocity(this.body, {
      x: -this.config.speed, // Отрицательная скорость по X
      y: this.body.velocity.y, // Сохранение текущей скорости по Y
    });
    this.sprite.scale.x = Math.abs(this.sprite.scale.x); // Лицом влево
    this.direction = -1; // Установка направления
  }

  moveRight(): void {
    // Движение вправо
    Matter.Body.setVelocity(this.body, {
      x: this.config.speed, // Положительная скорость по X
      y: this.body.velocity.y, // Сохранение текущей скорости по Y
    });
    this.sprite.scale.x = -Math.abs(this.sprite.scale.x); // Лицом вправо (отражение)
    this.direction = 1; // Установка направления
  }

  stopHorizontalMovement(): void {
    // Остановка горизонтального движения
    if (this.isOnGround) {
      // Только на земле
      Matter.Body.setVelocity(this.body, {
        x: 0, // Обнуление горизонтальной скорости
        y: this.body.velocity.y, // Сохранение вертикальной скорости
      });
    }
  }

  jumpForward(): void {
    // Прыжок вперед
    Matter.Body.setVelocity(this.body, {
      x: this.direction * this.config.jumpForwardForce, // Горизонтальная сила в направлении взгляда
      y: -this.config.jumpForwardUpForce, // Вертикальная сила (вверх)
    });
    this.isOnGround = false;
    this.isJumping = true;
    this.jumpType = "forward";
  }

  jumpBackward(): void {
    // Прыжок назад с сальто
    Matter.Body.setVelocity(this.body, {
      x: -this.direction * this.config.jumpBackwardForce, // Горизонтальная сила против направления взгляда
      y: -this.config.jumpBackwardUpForce, // Вертикальная сила (вверх)
    });
    this.isOnGround = false;
    this.isJumping = true;
    this.jumpType = "backward";
    this.isFlipping = true; // Активация анимации сальто
    this.flipRotation = 0; // Сброс угла вращения
    this.flipDirection = this.direction === 1 ? -1 : 1; // Направление вращения
  }

  updateFlipAnimation(): void {
    // Обновление анимации сальто
    if (this.isFlipping && this.jumpType === "backward") {
      this.flipRotation += 0.3; // Увеличение угла вращения
      this.sprite.rotation = this.flipRotation * this.flipDirection; // Применение вращения

      if (this.flipRotation >= Math.PI * 2) {
        // Завершение полного оборота
        this.sprite.rotation = 0;
        this.isFlipping = false;
      }
    }
  }

  constrainMovement(screenWidth: number, playerWidth: number): void {
    // Ограничение движения в пределах экрана
    if (this.body.position.x < playerWidth / 2) {
      // Левый край
      Matter.Body.setPosition(this.body, {
        x: playerWidth / 2, // Минимальная X позиция
        y: this.body.position.y,
      });
    }
    if (this.body.position.x > screenWidth - playerWidth / 2) {
      // Правый край
      Matter.Body.setPosition(this.body, {
        x: screenWidth - playerWidth / 2, // Максимальная X позиция
        y: this.body.position.y,
      });
    }
  }

  private checkIsOnGround(
    // Проверка нахождения на платформе
    platformBody: Matter.Body,
    platformHeight: number,
    platformWidth: number,
  ): boolean {
    return (
      // Проверка по Y: низ игрока на уровне верха платформы
      this.body.position.y + this.sprite.height / 2 >=
        platformBody.position.y - platformHeight / 2 &&
      this.body.position.y + this.sprite.height / 2 <=
        platformBody.position.y &&
      // Проверка по X: игрок в пределах платформы
      this.body.position.x > platformBody.position.x - platformWidth / 2 &&
      this.body.position.x < platformBody.position.x + platformWidth / 2 &&
      // Проверка скорости: почти не движется по Y
      this.body.velocity.y > -0.1 &&
      this.body.velocity.y < 0.1
    );
  }
}
