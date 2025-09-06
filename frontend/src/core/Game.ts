// src/core/Game.ts
import { Application, Container, Sprite, Graphics, Rectangle } from "pixi.js";
import { PhysicsEngine } from "./PhysicsEngine";
import { InputManager } from "./InputManager";
import { Player } from "../entities/Player";
import { Platform } from "../entities/Platform";
import { AssetLoader } from "../utils/AssetLoader";
import { PlayerConfig, GameSounds } from "../types";
import { PlatformEditor } from "../editor/PlatformEditor";

/**
 * Главный класс игры - управляет всеми системами и игровым циклом
 */
export class Game {
  public app: Application;
  public physics: PhysicsEngine;
  public input: InputManager;
  public gameWorld: Container;
  public player: Player | null = null;
  public platform: Platform | null = null;
  public sounds: GameSounds;
  public background: Sprite | null = null;
  public debugGraphics: Graphics;
  public platformEditor: PlatformEditor;

  private assetLoader: AssetLoader;
  private playerConfig: PlayerConfig;
  private isPlatformEditorEnabled: boolean = false;

  constructor() {
    this.app = new Application();
    this.physics = new PhysicsEngine();
    this.input = new InputManager();
    this.gameWorld = new Container();
    this.sounds = {} as GameSounds;
    this.assetLoader = new AssetLoader();
    this.debugGraphics = new Graphics();
    this.platformEditor = new PlatformEditor();

    this.playerConfig = {
      speed: 1.5,
      jumpForwardUpForce: 6,
      jumpBackwardUpForce: 8,
      jumpForwardForce: 3,
      jumpBackwardForce: 2,
    };
  }

  async initialize(): Promise<void> {
    await this.initializePixi();
    await this.loadResources();
    this.createGameWorld();
    this.setupEventListeners();
  }

  private async initializePixi(): Promise<void> {
    await this.app.init({
      background: "#1099bb",
      resizeTo: window,
      antialias: true,
    });

    const container = document.getElementById("pixi-container");
    if (container) {
      container.appendChild(this.app.canvas);
      this.app.stage.addChild(this.gameWorld);
      this.app.stage.addChild(this.platformEditor.container);

      this.debugGraphics = new Graphics();
      this.debugGraphics.eventMode = "static";
      this.debugGraphics.zIndex = 1000;
      this.app.stage.addChild(this.debugGraphics);
    } else {
      throw new Error("Контейнер для Pixi не найден!");
    }
  }

  private async loadResources(): Promise<void> {
    await this.assetLoader.loadAllAssets();
    this.sounds = this.assetLoader.getSounds();
  }

  private createGameWorld(): void {
    this.createBackground();
    this.createPlatform();
    this.createPlayer();
    this.drawPlatformVertices();
  }

  private createBackground(): void {
    this.background = this.assetLoader.createBackground(
      this.app.screen.width,
      this.app.screen.height,
    );
    this.gameWorld.addChildAt(this.background, 0);
  }

  private createPlayer(): void {
    const playerTexture = this.assetLoader.getTexture("player");
    const sniperTexture = this.assetLoader.getTexture("sniperRifle");
    const bulletTexture = this.assetLoader.getTexture("bullet");

    this.player = new Player(
      this.app.screen.width / 2,
      this.app.screen.height / 2,
      playerTexture,
      this.playerConfig,
      sniperTexture,
      bulletTexture,
      this.gameWorld,
      this.physics,
      this.sounds,
    );

    this.gameWorld.addChild(this.player.sprite);
    this.physics.addBody(this.player.body);
  }

  private createPlatform(): void {
    const platformTexture = this.assetLoader.getTexture("platform");
    const platformWidth = platformTexture.width;
    const platformHeight = platformTexture.height;
    const platformX = this.app.screen.width / 2;
    const platformY = this.app.screen.height - 90;

    // Используем специальные вершины для сложной формы
    const platformVertices = this.createPlatformVertices();

    this.platform = new Platform(
      platformX,
      platformY,
      platformWidth,
      platformHeight,
      platformTexture,
      platformVertices,
    );

    this.gameWorld.addChild(this.platform.graphics);
    this.physics.addBody(this.platform.body);
  }

  private createPlatformVertices(): Matter.Vector[] {
    // Абсолютные координаты экрана
    const absoluteVertices = [
      { x: 207, y: 573 },
      { x: 256, y: 544 },
      { x: 327, y: 521 },
      { x: 419, y: 485 },
      { x: 583, y: 423 },
      { x: 722, y: 442 },
      { x: 794, y: 456 },
      { x: 919, y: 513 },
      { x: 1041, y: 568 },
    ];

    // Центр платформы
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height - 90;

    // Преобразуем абсолютные координаты в относительные
    return absoluteVertices.map((vertex) => ({
      x: vertex.x - centerX,
      y: vertex.y - centerY,
    }));
  }

  private drawPlatformVertices(): void {
    if (!this.platform) return;

    this.debugGraphics.clear();

    const vertices = this.platform.body.vertices;
    const vertexCount = vertices.length;

    const primaryColor = 0x4a90e2;

    this.debugGraphics.stroke({
      color: primaryColor,
      width: 1.5,
      alpha: 1,
      cap: "round",
      join: "round",
    });

    this.debugGraphics.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertexCount; i++) {
      this.debugGraphics.lineTo(vertices[i].x, vertices[i].y);
    }

    if (vertexCount > 2) {
      this.debugGraphics.lineTo(vertices[0].x, vertices[0].y);
    }
    this.debugGraphics.stroke();

    for (let i = 0; i < vertexCount; i++) {
      this.debugGraphics.fill({ color: primaryColor, alpha: 0.3 });
      this.debugGraphics.fill();

      this.debugGraphics.fill({ color: primaryColor, alpha: 1 });
      this.debugGraphics.fill();
    }
  }

  public togglePlatformEditor(): void {
    this.isPlatformEditorEnabled = !this.isPlatformEditorEnabled;
    this.platformEditor.setVisible(this.isPlatformEditorEnabled);

    if (this.isPlatformEditorEnabled) {
      this.platformEditor.startEditing();
    } else {
      this.platformEditor.finishEditing();
    }
  }

  public savePlatform(): void {
    if (!this.platformEditor.isValidShape()) {
      console.warn("Невозможно сохранить: форма платформы невалидна");
      return;
    }

    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height - 90;
    const verticesString = this.platformEditor.exportVerticesString(
      centerX,
      centerY,
    );

    navigator.clipboard
      .writeText(verticesString)
      .then(() => {
        console.log("Вершины платформы скопированы в буфер обмена:");
        console.log(verticesString);
      })
      .catch((err) => {
        console.error("Ошибка копирования:", err);
      });
  }

  private setupEventListeners(): void {
    window.addEventListener("resize", this.handleResize.bind(this));

    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = new Rectangle(
      0,
      0,
      this.app.screen.width,
      this.app.screen.height,
    );
    this.app.stage.on("click", this.handleStageClick.bind(this));
    this.app.stage.on("rightclick", this.handleStageRightClick.bind(this));

    // Обработчики для редактора платформ
    window.addEventListener("keydown", this.handleKeyDown.bind(this));

    this.app.ticker.add(this.update.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.isPlatformEditorEnabled) {
      switch (e.code) {
        case "KeyR":
          this.platformEditor.reset();
          break;
      }
    }

    // Глобальные горячие клавиши
    switch (e.code) {
      case "KeyP":
        this.togglePlatformEditor();
        break;
    }
  }

  private handleStageClick(e: MouseEvent): void {
    if (this.isPlatformEditorEnabled) {
      const mousePosition = this.app.renderer.events.pointer.global;
      this.platformEditor.addVertex(mousePosition.x, mousePosition.y);
      e.stopPropagation();
    }
  }

  private handleStageRightClick(e: MouseEvent): void {
    if (this.isPlatformEditorEnabled) {
      this.platformEditor.closeShapeAndCopy();
      e.preventDefault();
      e.stopPropagation();
    }
  }

  private handleResize(): void {
    if (this.background) {
      this.background.width = this.app.screen.width;
      this.background.height = this.app.screen.height;
    }

    if (this.platform) {
      const platformY = this.app.screen.height - 100;
      this.platform.updatePosition(this.app.screen.width / 2, platformY);
      this.drawPlatformVertices();
    }

    // Обновляем hitArea при изменении размера
    this.app.stage.hitArea = new Rectangle(
      0,
      0,
      this.app.screen.width,
      this.app.screen.height,
    );
  }

  private update(): void {
    this.physics.update();
    this.updateGameState();
    this.handleInput();
  }

  private updateGameState(): void {
    if (!this.player || !this.platform) return;

    this.player.update(this.platform);
    this.player.updateBullets();
    this.platform.update();
    this.drawPlatformVertices();
  }

  private handleInput(): void {
    if (!this.player) return;
    this.input.handlePlayerInput(this.player);
  }

  destroy(): void {
    window.removeEventListener("resize", this.handleResize.bind(this));
    window.removeEventListener("keydown", this.handleKeyDown.bind(this));
    this.app.stage.off("click", this.handleStageClick.bind(this));
    this.app.stage.off("rightclick", this.handleStageRightClick.bind(this));
    this.input.destroy();
    this.app.destroy();
    console.log("Игра завершена, ресурсы очищены");
  }
}
