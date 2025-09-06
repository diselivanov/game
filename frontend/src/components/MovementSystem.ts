/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/MovementSystem.ts
import Matter from "matter-js";
import { PlayerConfig, GameSounds } from "../types";

/**
 * Система управления движением игрока
 * Отвечает за перемещение, прыжки, анимации и ограничения движения
 */
export class MovementSystem {
  // Состояние движения
  public isOnGround: boolean = false; // Находится ли на поверхности
  public isJumping: boolean = false; // В процессе прыжка
  public isFlipping: boolean = false; // В процессе переворота
  public jumpType: string | null = null; // Тип прыжка (forward/backward)
  public direction: number = 1; // Направление взгляда (1: right, -1: left)
  public flipRotation: number = 0; // Текущий угол переворота
  public flipDirection: number = 1; // Направление переворота

  private player: any; // Ссылка на игрока
  private config: PlayerConfig; // Конфигурация движения
  private sounds: GameSounds; // Звуки движения

  constructor(player: any, config: PlayerConfig, sounds: GameSounds) {
    this.player = player;
    this.config = config;
    this.sounds = sounds;
  }

  /**
   * Основное обновление системы движения
   * @param platform - Платформа для проверки коллизий
   */
  update(platform: any): void {
    this.updatePosition(); // Синхронизация спрайта с телом
    this.checkGroundStatus(platform); // Проверка нахождения на земле
    this.resetJumpStateIfNeeded(); // Сброс состояния прыжка
  }

  /**
   * Синхронизация позиции спрайта с физическим телом
   */
  private updatePosition(): void {
    this.player.sprite.x = this.player.body.position.x;
    this.player.sprite.y = this.player.body.position.y;
    this.player.sprite.rotation = this.player.body.angle;
  }

  /**
   * Проверка нахождения игрока на платформе
   * @param platform - Платформа для проверки коллизий
   */
  private checkGroundStatus(platform: any): void {
    this.isOnGround = this.checkIsOnGround(platform);
  }

  /**
   * Сброс состояния прыжка при приземлении
   */
  private resetJumpStateIfNeeded(): void {
    if (this.isOnGround) {
      if (this.isJumping) {
        this.isJumping = false;
        this.jumpType = null;
      }
      if (this.isFlipping) {
        this.player.sprite.rotation = 0;
        this.isFlipping = false;
      }
    }
  }

  /**
   * Движение влево
   */
  moveLeft(): void {
    Matter.Body.setVelocity(this.player.body, {
      x: -this.config.speed, // Отрицательная скорость по X
      y: this.player.body.velocity.y, // Сохранение вертикальной скорости
    });
    this.player.sprite.scale.x = Math.abs(this.player.sprite.scale.x); // Отражение спрайта
    this.direction = -1; // Установка направления влево
  }

  /**
   * Движение вправо
   */
  moveRight(): void {
    Matter.Body.setVelocity(this.player.body, {
      x: this.config.speed, // Положительная скорость по X
      y: this.player.body.velocity.y, // Сохранение вертикальной скорости
    });
    this.player.sprite.scale.x = -Math.abs(this.player.sprite.scale.x); // Отражение спрайта
    this.direction = 1; // Установка направления вправо
  }

  /**
   * Остановка горизонтального движения
   */
  stopHorizontalMovement(): void {
    if (this.isOnGround) {
      Matter.Body.setVelocity(this.player.body, {
        x: 0, // Нулевая горизонтальная скорость
        y: this.player.body.velocity.y, // Сохранение вертикальной скорости
      });
    }
  }

  /**
   * Прыжок вперед (в направлении взгляда)
   */
  jumpForward(): void {
    Matter.Body.setVelocity(this.player.body, {
      x: this.direction * this.config.jumpForwardForce, // Импульс вперед
      y: -this.config.jumpForwardUpForce, // Импульс вверх
    });
    this.isOnGround = false;
    this.isJumping = true;
    this.jumpType = "forward";
    this.playJumpSound();
  }

  /**
   * Прыжок назад (против направления взгляда) с переворотом
   */
  jumpBackward(): void {
    Matter.Body.setVelocity(this.player.body, {
      x: -this.direction * this.config.jumpBackwardForce, // Импульс назад
      y: -this.config.jumpBackwardUpForce, // Импульс вверх
    });
    this.isOnGround = false;
    this.isJumping = true;
    this.jumpType = "backward";
    this.isFlipping = true; // Активация анимации переворота
    this.flipRotation = 0;
    this.flipDirection = this.direction === 1 ? -1 : 1; // Направление переворота
    this.playJumpSound();
  }

  /**
   * Воспроизведение звука прыжка
   */
  private playJumpSound(): void {
    try {
      this.sounds.jump.play();
    } catch (error) {
      console.warn("Ошибка воспроизведения звука прыжка:", error);
    }
  }

  /**
   * Обновление анимации переворота при прыжке назад
   */
  updateFlipAnimation(): void {
    if (this.isFlipping && this.jumpType === "backward") {
      this.flipRotation += 0.3; // Увеличение угла переворота
      this.player.sprite.rotation = this.flipRotation * this.flipDirection;

      // Завершение переворота после полного оборота
      if (this.flipRotation >= Math.PI * 2) {
        this.player.sprite.rotation = 0;
        this.isFlipping = false;
      }
    }
  }

  /**
   * Ограничение движения в пределах экрана
   * @param screenWidth - Ширина игрового экрана
   * @param playerWidth - Ширина игрока
   */
  constrainMovement(screenWidth: number, playerWidth: number): void {
    // Предотвращение выхода за левую границу
    if (this.player.body.position.x < playerWidth / 2) {
      Matter.Body.setPosition(this.player.body, {
        x: playerWidth / 2,
        y: this.player.body.position.y,
      });
    }

    // Предотвращение выхода за правую границу
    if (this.player.body.position.x > screenWidth - playerWidth / 2) {
      Matter.Body.setPosition(this.player.body, {
        x: screenWidth - playerWidth / 2,
        y: this.player.body.position.y,
      });
    }
  }

  /**
   * Проверка нахождения игрока на платформе с произвольной формой
   * @param platform - Платформа для проверки
   * @returns true если игрок стоит на платформе
   */
  private checkIsOnGround(platform: any): boolean {
    if (!platform || !platform.body) return false;

    const playerBottom =
      this.player.body.position.y + this.player.sprite.height / 2;
    const platformTop = platform.body.position.y - platform.height / 2;

    // Проверка вертикального перекрытия
    const isVerticallyAligned =
      playerBottom >= platformTop && playerBottom <= platformTop + 10; // Небольшой допуск

    // Проверка горизонтального перекрытия
    const isHorizontallyAligned =
      this.player.body.position.x >
        platform.body.position.x - platform.width / 2 &&
      this.player.body.position.x <
        platform.body.position.x + platform.width / 2;

    // Проверка скорости (игрок почти не движется вертикально)
    const isSlowVerticalMovement =
      this.player.body.velocity.y > -0.5 && this.player.body.velocity.y < 0.5;

    return (
      isVerticallyAligned && isHorizontallyAligned && isSlowVerticalMovement
    );
  }
}
