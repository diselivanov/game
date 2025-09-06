/* eslint-disable @typescript-eslint/no-explicit-any */
// src/core/InputManager.ts
import { KeysState } from "../types";

/**
 * Управление вводом с клавиатуры и мыши
 * Отслеживает состояние клавиш и кнопок мыши
 */
export class InputManager {
  public keys: KeysState; // Текущее состояние всех клавиш
  private spacePressed: boolean = false;

  constructor() {
    // Инициализация состояния всех отслеживаемых клавиш
    this.keys = {
      a: false, // Движение влево
      d: false, // Движение вправо
      enter: false, // Прыжок вперед
      backspace: false, // Прыжок назад
      space: false, // Стрельба
      q: false, // Открыть/закрыть инвентарь
      w: false, // Прицеливание вверх
      s: false, // Прицеливание вниз
      leftMouse: false, // Левый клик мыши
      rightMouse: false, // Правый клик мыши
      p: false, // Переключение редактора платформ
    };

    this.init(); // Инициализация обработчиков событий
  }

  /**
   * Настройка обработчиков событий ввода
   */
  private init(): void {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
    window.addEventListener("mousedown", this.handleMouseDown.bind(this));
    window.addEventListener("mouseup", this.handleMouseUp.bind(this));

    // Блокировка контекстного меню на правый клик
    window.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  /**
   * Обработчик нажатия клавиш клавиатуры
   * @param e - Событие клавиатуры
   */
  private handleKeyDown(e: KeyboardEvent): void {
    switch (e.code) {
      case "KeyA":
        this.keys.a = true;
        break;
      case "KeyD":
        this.keys.d = true;
        break;
      case "Enter":
        this.keys.enter = true;
        break;
      case "Backspace":
        this.keys.backspace = true;
        break;
      case "Space":
        this.keys.space = true;
        break;
      case "KeyQ":
        this.keys.q = true;
        break;
      case "KeyW":
        this.keys.w = true;
        break;
      case "KeyS":
        this.keys.s = true;
        break;
      case "KeyP":
        this.keys.p = true;
        break;
    }
  }

  /**
   * Обработчик отпускания клавиш клавиатуры
   * @param e - Событие клавиатуры
   */
  private handleKeyUp(e: KeyboardEvent): void {
    switch (e.code) {
      case "KeyA":
        this.keys.a = false;
        break;
      case "KeyD":
        this.keys.d = false;
        break;
      case "Enter":
        this.keys.enter = false;
        break;
      case "Backspace":
        this.keys.backspace = false;
        break;
      case "Space":
        this.keys.space = false;
        break;
      case "KeyQ":
        this.keys.q = false;
        break;
      case "KeyW":
        this.keys.w = false;
        break;
      case "KeyS":
        this.keys.s = false;
        break;
      case "KeyP":
        this.keys.p = false;
        break;
    }
  }

  /**
   * Обработчик нажатия кнопок мыши
   * @param e - Событие мыши
   */
  private handleMouseDown(e: MouseEvent): void {
    if (e.button === 0) this.keys.leftMouse = true; // Левая кнопка
    if (e.button === 2) this.keys.rightMouse = true; // Правая кнопка
  }

  /**
   * Обработчик отпускания кнопок мыши
   * @param e - Событие мыши
   */
  private handleMouseUp(e: MouseEvent): void {
    if (e.button === 0) this.keys.leftMouse = false; // Левая кнопка
    if (e.button === 2) this.keys.rightMouse = false; // Правая кнопка
  }

  /**
   * Основной метод обработки ввода для игрока
   */
  handlePlayerInput(player: any): void {
    // Управление инвентарем
    if (this.keys.q) {
      player.toggleInventory();
      this.keys.q = false;
    }

    // Прицеливание
    if (this.keys.w && player.currentWeapon) {
      player.aimUp();
    }
    if (this.keys.s && player.currentWeapon) {
      player.aimDown();
    }

    // Движение (только на земле)
    if (!player.isJumping) {
      if (this.keys.a) player.moveLeft();
      if (this.keys.d) player.moveRight();

      if (!this.keys.a && !this.keys.d && player.isOnGround) {
        player.stopHorizontalMovement();
      }

      // Прыжки
      if (this.keys.enter && player.isOnGround) {
        player.jumpForward();
      }
      if (this.keys.backspace && player.isOnGround) {
        player.jumpBackward();
      }
    }

    // Стрельба
    if (this.keys.space && player.currentWeapon && !this.spacePressed) {
      player.shoot();
      this.spacePressed = true;
    }
    if (!this.keys.space) {
      this.spacePressed = false;
    }

    // Клики мыши - убираем обработку левого клика для экипировки
    if (this.keys.leftMouse) {
      player.handleLeftClick();
      this.keys.leftMouse = false;
    }
    if (this.keys.rightMouse) {
      player.handleRightClick();
      this.keys.rightMouse = false;
    }
  }

  /**
   * Очистка обработчиков событий
   */
  destroy(): void {
    window.removeEventListener("keydown", this.handleKeyDown.bind(this));
    window.removeEventListener("keyup", this.handleKeyUp.bind(this));
    window.removeEventListener("mousedown", this.handleMouseDown.bind(this));
    window.removeEventListener("mouseup", this.handleMouseUp.bind(this));
  }
}
