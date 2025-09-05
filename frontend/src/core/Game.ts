// Game.ts
import { Application, Assets, Container, Sprite } from "pixi.js";
import { Sound } from "@pixi/sound";
import { PhysicsEngine } from "./PhysicsEngine";
import { InputManager } from "./InputManager";
import { Player } from "../entities/Player";
import { Platform } from "../entities/Platform";
import { PlayerConfig, GameSounds } from "../types";
import Matter from "matter-js";

export class Game {
  public app: Application;
  public physics: PhysicsEngine;
  public input: InputManager;
  public gameWorld: Container;
  public background: Sprite | null = null;
  public player: Player | null = null;
  public platform: Platform | null = null;
  public sounds: GameSounds;

  private playerConfig: PlayerConfig = {
    speed: 1.5,
    jumpForwardUpForce: 6,
    jumpBackwardUpForce: 8,
    jumpForwardForce: 3,
    jumpBackwardForce: 2,
  };

  constructor() {
    this.app = new Application();
    this.physics = new PhysicsEngine();
    this.input = new InputManager();
    this.gameWorld = new Container();
    this.sounds = {} as GameSounds;
  }

  async initialize(): Promise<void> {
    await this.app.init({
      background: "#1099bb",
      resizeTo: window,
    });

    document.getElementById("pixi-container")!.appendChild(this.app.canvas);
    this.app.stage.addChild(this.gameWorld);

    // Загружаем текстуры с обработкой ошибок
    try {
      const playerTexture = await Assets.load("/assets/player.png");
      const platformTexture = await Assets.load("/assets/platform.png");
      const backgroundTexture = await Assets.load("/assets/background.png");
      const bulletTexture = await Assets.load("/assets/bullet.png");

      // Загружаем текстуру винтовки или создаем заглушку если файла нет
      let sniperRifleTexture;
      try {
        sniperRifleTexture = await Assets.load("/assets/sniper_rifle.png");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.warn("Текстура sniper_rifle.png не найдена");
      }

      // Загружаем звуки через Assets
      try {
        const jumpSound = await Assets.load("/assets/sounds/jump.wav");
        const shootSound = await Assets.load("/assets/sounds/shoot.wav");

        this.sounds = {
          jump: jumpSound,
          shoot: shootSound,
        };

        // Настраиваем громкость
        this.sounds.jump.volume = 0.3;
        this.sounds.shoot.volume = 0.5;
      } catch (error) {
        console.warn("Не удалось загрузить звуковые файлы:", error);
        // Создаем заглушки для звуков
        this.sounds = {
          jump: Sound.from({}),
          shoot: Sound.from({}),
        };
      }

      this.background = new Sprite(backgroundTexture);
      this.background.width = this.app.screen.width;
      this.background.height = this.app.screen.height;
      this.background.anchor.set(0);
      this.gameWorld.addChildAt(this.background, 0);

      this.player = new Player(
        this.app.screen.width / 2,
        this.app.screen.height / 2,
        playerTexture,
        this.playerConfig,
        sniperRifleTexture,
        bulletTexture,
        this.gameWorld,
        this.physics,
        this.sounds, // Передаем звуки игроку
      );

      const platformWidth = this.app.screen.width * 0.8;
      const platformHeight = 30;
      const platformX = this.app.screen.width / 2;
      const platformY = this.app.screen.height - 100;

      this.platform = new Platform(
        platformX,
        platformY,
        platformWidth,
        platformHeight,
        platformTexture,
      );

      this.gameWorld.addChild(this.player.sprite);
      this.gameWorld.addChild(this.platform.graphics);
      this.physics.addBody(this.player.body);
      this.physics.addBody(this.platform.body);

      window.addEventListener("resize", this.handleResize.bind(this));
      this.app.ticker.add(this.update.bind(this));
    } catch (error) {
      console.error("Ошибка загрузки ресурсов:", error);
    }
  }

  private handleResize(): void {
    if (this.background) {
      this.background.width = this.app.screen.width;
      this.background.height = this.app.screen.height;
    }

    if (this.platform) {
      const platformY = this.app.screen.height - 100;
      Matter.Body.setPosition(this.platform.body, {
        x: this.app.screen.width / 2,
        y: platformY,
      });
      this.platform.graphics.position.set(this.app.screen.width / 2, platformY);
    }
  }

  private update(): void {
    this.physics.update(1000 / 60);

    if (!this.player || !this.platform) return;

    this.player.update(
      this.platform.body,
      this.platform.height,
      this.platform.width,
    );

    this.handleInput();
    this.player.updateFlipAnimation();
    this.player.constrainMovement(
      this.app.screen.width,
      this.player.sprite.width,
    );
    this.player.updateBullets();
    this.platform.update();
  }

  private handleInput(): void {
    if (!this.player) return;

    // Обработка Q для инвентаря
    if (this.input.keys.q) {
      this.player.toggleInventory();
      this.input.keys.q = false;
    }

    // Обработка прицеливания
    if (this.input.keys.w && this.player.currentWeapon) {
      this.player.aimUp();
    }

    if (this.input.keys.s && this.player.currentWeapon) {
      this.player.aimDown();
    }

    if (!this.player.isJumping) {
      if (this.input.keys.a) {
        this.player.moveLeft();
      }

      if (this.input.keys.d) {
        this.player.moveRight();
      }

      if (!this.input.keys.a && !this.input.keys.d && this.player.isOnGround) {
        this.player.stopHorizontalMovement();
      }

      if (this.input.keys.enter && this.player.isOnGround) {
        this.player.jumpForward();
      }

      if (this.input.keys.backspace && this.player.isOnGround) {
        this.player.jumpBackward();
      }
    }

    // Для выстрела - только пробел
    if (this.input.keys.space && this.player.currentWeapon) {
      this.player.shoot();
      this.input.keys.space = false;
    }

    // Для инвентаря - только ЛКМ
    if (this.input.keys.leftMouse) {
      this.player.handleLeftClick();
      this.input.keys.leftMouse = false;
    }

    if (this.input.keys.rightMouse) {
      this.player.handleRightClick();
      this.input.keys.rightMouse = false;
    }
  }

  destroy(): void {
    window.removeEventListener("resize", this.handleResize.bind(this));
    this.input.destroy();
    this.app.destroy();
  }
}
