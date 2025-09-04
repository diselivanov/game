//  Основной класс игры, инициализирует движки, управляет игровым циклом и связывает все компоненты

import { Application, Assets, Container } from "pixi.js";
import { PhysicsEngine } from "./PhysicsEngine";
import { InputManager } from "./InputManager";
import { Player } from "../entities/Player";
import { Platform } from "../entities/Platform";
import { PlayerConfig } from "../types";

export class Game {
  public app: Application; // Основной экземпляр Pixi.js приложения
  public physics: PhysicsEngine; // Движок физики Matter.js
  public input: InputManager; // Менеджер обработки ввода
  public gameWorld: Container; // Контейнер для игровых объектов
  public player: Player | null = null; // Объект игрока
  public platform: Platform | null = null; // Платформа

  private playerConfig: PlayerConfig = {
    // Конфигурация игрока
    speed: 1.5, // Базовая скорость движения
    jumpForwardUpForce: 6, // Сила прыжка вперед (вертикальная)
    jumpBackwardUpForce: 8, // Сила прыжка назад (вертикальная)
    jumpForwardForce: 3, // Сила прыжка вперед (горизонтальная)
    jumpBackwardForce: 2, // Сила прыжка назад (горизонтальная)
  };

  constructor() {
    this.app = new Application(); // Инициализация Pixi.js
    this.physics = new PhysicsEngine(); // Создание движка физики
    this.input = new InputManager(); // Создание менеджера ввода
    this.gameWorld = new Container(); // Создание игрового мира
  }

  async initialize(): Promise<void> {
    // Инициализация Pixi.js с настройками
    await this.app.init({
      background: "#1099bb", // Цвет фона
      resizeTo: window, // Автоматическое изменение размера под окно
    });

    // Добавление canvas в DOM
    document.getElementById("pixi-container")!.appendChild(this.app.canvas);
    this.app.stage.addChild(this.gameWorld); // Добавление игрового мира на сцену

    // Загрузка текстуры игрока
    const texture = await Assets.load("/assets/player.png");

    // Создание игрока в центре экрана
    this.player = new Player(
      this.app.screen.width / 2,
      this.app.screen.height / 2,
      texture,
      this.playerConfig,
    );

    // Создание платформы в нижней части экрана
    const platformWidth = this.app.screen.width * 0.8; // Ширина 80% экрана
    const platformHeight = 30; // Высота платформы
    const platformX = this.app.screen.width / 2; // Центр по X
    const platformY = this.app.screen.height - 100; // 100px от нижнего края

    this.platform = new Platform(
      platformX,
      platformY,
      platformWidth,
      platformHeight,
    );

    // Добавление объектов в игровой мир
    this.gameWorld.addChild(this.player.sprite); // Добавление спрайта игрока
    this.gameWorld.addChild(this.platform.graphics); // Добавление графики платформы
    this.physics.addBody(this.player.body); // Добавление физического тела игрока
    this.physics.addBody(this.platform.body); // Добавление физического тела платформы

    // Запуск игрового цикла (60 FPS)
    this.app.ticker.add(this.update.bind(this));
  }

  private update(): void {
    // Обновление физики (шаг 16.67ms для 60 FPS)
    this.physics.update(1000 / 60);

    if (!this.player || !this.platform) return; // Проверка наличия объектов

    // Обновление состояния игрока (позиция, проверка земли и т.д.)
    this.player.update(
      this.platform.body,
      this.platform.height,
      this.platform.width,
    );

    this.handleInput(); // Обработка пользовательского ввода
    this.player.updateFlipAnimation(); // Обновление анимации сальто
    this.player.constrainMovement(
      // Ограничение движения в пределах экрана
      this.app.screen.width,
      this.player.sprite.width,
    );
    this.platform.update(); // Обновление платформы
  }

  private handleInput(): void {
    if (!this.player) return;

    // Обработка движения только если не в прыжке
    if (!this.player.isJumping) {
      if (this.input.keys.a) {
        // Движение влево
        this.player.moveLeft();
      }

      if (this.input.keys.d) {
        // Движение вправо
        this.player.moveRight();
      }

      // Остановка при отсутствии движения на земле
      if (!this.input.keys.a && !this.input.keys.d && this.player.isOnGround) {
        this.player.stopHorizontalMovement();
      }

      // Прыжок вперед (Enter)
      if (this.input.keys.enter && this.player.isOnGround) {
        this.player.jumpForward();
      }

      // Прыжок назад (Backspace)
      if (this.input.keys.backspace && this.player.isOnGround) {
        this.player.jumpBackward();
      }
    }
  }

  destroy(): void {
    // Очистка ресурсов
    this.input.destroy(); // Удаление обработчиков ввода
    this.app.destroy(); // Уничтожение Pixi.js приложения
  }
}
