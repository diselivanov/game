/* eslint-disable @typescript-eslint/no-unused-vars */
// Player.ts
import { Sprite, Texture, Graphics, Text, Container } from "pixi.js";
import Matter from "matter-js";
import {
  PlayerConfig,
  InventoryItem,
  GameSounds,
  InventoryCell,
} from "../types";
import { PhysicsEngine } from "../core/PhysicsEngine";

export class Bullet {
  public sprite: Sprite;
  public velocity: { x: number; y: number };
  public lifetime: number = 2000;
  public createdAt: number;
  public angle: number;

  constructor(
    x: number,
    y: number,
    angle: number,
    speed: number,
    texture: Texture,
    _physics: PhysicsEngine,
  ) {
    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5);
    this.sprite.position.set(x, y);
    this.sprite.scale.set(0.5);
    this.sprite.rotation = angle;
    this.angle = angle;

    this.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    };

    this.createdAt = Date.now();
  }

  update(): boolean {
    if (Date.now() - this.createdAt > this.lifetime) {
      return true;
    }

    this.sprite.x += this.velocity.x;
    this.sprite.y += this.velocity.y;

    return false;
  }

  destroy(_physics: PhysicsEngine): void {}
}

export class Player {
  public sprite: Sprite;
  public body: Matter.Body;
  public isOnGround: boolean = false;
  public isJumping: boolean = false;
  public isFlipping: boolean = false;
  public jumpType: string | null = null;
  public direction: number = 1;
  public flipRotation: number = 0;
  public flipDirection: number = 1;
  public inventory: InventoryItem[] = [];
  public currentWeapon: InventoryItem | null = null;
  public weaponSprite: Sprite;
  public isInventoryOpen: boolean = false;
  public inventoryUI: Container;
  public gameWorld: Container;
  public aimAngle: number = 0;
  public bullets: Bullet[] = [];
  public physics: PhysicsEngine;
  public inventoryCells: InventoryCell[] = [];
  public itemNameText: Text;
  public equippedIndicator: Graphics | null = null;

  private config: PlayerConfig;
  private bulletTexture: Texture;
  private sounds: GameSounds;
  private cellSize: number = 80;
  private cellsPerRow: number = 12;
  private cellsPerColumn: number = 6;

  constructor(
    x: number,
    y: number,
    texture: Texture,
    config: PlayerConfig,
    sniperRifleTexture: Texture,
    bulletTexture: Texture,
    gameWorld: Container,
    physics: PhysicsEngine,
    sounds: GameSounds,
  ) {
    this.config = config;
    this.gameWorld = gameWorld;
    this.physics = physics;
    this.bulletTexture = bulletTexture;
    this.sounds = sounds;

    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5);
    this.sprite.position.set(x, y);
    this.sprite.scale.set(0.2);

    this.body = Matter.Bodies.rectangle(
      x,
      y,
      this.sprite.width * 0.7,
      this.sprite.height,
      { inertia: Infinity },
    );

    this.weaponSprite = new Sprite();
    this.weaponSprite.anchor.set(0.5, 0.5);
    this.weaponSprite.visible = false;
    this.sprite.addChild(this.weaponSprite);

    this.inventoryUI = new Container();
    this.inventoryUI.visible = false;
    this.gameWorld.addChild(this.inventoryUI);

    this.itemNameText = new Text("", {
      fontSize: 14,
      fill: 0xffffff,
      fontWeight: "bold",
    });
    this.itemNameText.visible = false;
    this.inventoryUI.addChild(this.itemNameText);

    this.inventory.push({
      name: "Снайперская винтовка",
      texture: sniperRifleTexture,
      equipped: false,
    });

    this.createInventoryUI();
  }

  private createInventoryUI(): void {
    const background = new Graphics();
    background.beginFill(0x000000, 0);
    background.drawRect(
      0,
      0,
      this.cellSize * this.cellsPerRow,
      this.cellSize * this.cellsPerColumn + 60,
    );
    background.endFill();
    this.inventoryUI.addChild(background);

    this.createInventoryGrid();
  }

  private createInventoryGrid(): void {
    const startX = 0;
    const startY = 50;

    for (let row = 0; row < this.cellsPerColumn; row++) {
      for (let col = 0; col < this.cellsPerRow; col++) {
        const cellX = startX + col * this.cellSize;
        const cellY = startY + row * this.cellSize;

        const cellGraphics = new Graphics();
        cellGraphics.beginFill(0x000000, 0.6);
        cellGraphics.lineStyle(1, 0xffffff, 0.2); // Белый прозрачный контур
        cellGraphics.drawRect(0, 0, this.cellSize, this.cellSize); // Убрали скругление
        cellGraphics.endFill();
        cellGraphics.position.set(cellX, cellY);
        cellGraphics.interactive = true;
        cellGraphics.cursor = "pointer";

        const cellIndex = row * this.cellsPerRow + col;

        cellGraphics.on("pointerover", () =>
          this.onCellHover(cellGraphics, cellIndex),
        );
        cellGraphics.on("pointerout", () =>
          this.onCellOut(cellGraphics, cellIndex),
        );
        cellGraphics.on("pointerdown", () => this.onCellClick(cellIndex));

        this.inventoryUI.addChild(cellGraphics);

        this.inventoryCells.push({
          x: col,
          y: row,
          item: null,
          sprite: null,
          hover: false,
          graphics: cellGraphics,
        });
      }
    }

    this.updateInventoryDisplay();
  }

  private onCellHover(cell: Graphics, cellIndex: number): void {
    const cellData = this.inventoryCells[cellIndex];

    try {
      this.sounds.hover.play();
    } catch (error) {
      console.warn("Ошибка воспроизведения звука наведения:", error);
    }

    if (cellData.item) {
      cell.clear();
      cell.beginFill(0x222222, 0.6);
      cell.lineStyle(1, 0xffffff, 0.2);
      cell.drawRect(0, 0, this.cellSize, this.cellSize);
      cell.endFill();

      this.itemNameText.text = cellData.item.name; // Показываем название оружия
      this.itemNameText.style.fontSize = 20;
      this.itemNameText.position.set(
        (this.inventoryUI.width - this.itemNameText.width) / 2,
        15, // Позиция
      );
      this.itemNameText.visible = true;

      cellData.hover = true;
    }
  }

  private onCellOut(cell: Graphics, cellIndex: number): void {
    const cellData = this.inventoryCells[cellIndex];

    if (cellData.item) {
      cell.clear();
      cell.beginFill(0x000000, 0.6);
      cell.lineStyle(1, 0xffffff, 0.2);
      cell.drawRect(0, 0, this.cellSize, this.cellSize);
      cell.endFill();
    }

    this.itemNameText.visible = false;
    cellData.hover = false;
  }

  private onCellClick(cellIndex: number): void {
    const cellData = this.inventoryCells[cellIndex];

    if (cellData.item) {
      this.equipWeapon(cellData.item);
      this.isInventoryOpen = false;
      this.inventoryUI.visible = false;
    }
  }

  private updateInventoryDisplay(): void {
    // Очищаем все спрайты предметов
    this.inventoryCells.forEach((cell) => {
      if (cell.sprite && this.inventoryUI.children.includes(cell.sprite)) {
        this.inventoryUI.removeChild(cell.sprite);
      }
      cell.sprite = null;
      cell.item = null;
    });

    // Удаляем старые индикаторы экипировки
    if (
      this.equippedIndicator &&
      this.inventoryUI.children.includes(this.equippedIndicator)
    ) {
      this.inventoryUI.removeChild(this.equippedIndicator);
    }

    // Заполняем ячейки предметами
    this.inventory.forEach((item, index) => {
      if (index < this.inventoryCells.length) {
        const cell = this.inventoryCells[index];
        cell.item = item;

        // Добавляем спрайт предмета
        const itemSprite = new Sprite(item.texture);
        itemSprite.anchor.set(0.5);
        itemSprite.width = this.cellSize * 0.7;
        itemSprite.height = this.cellSize * 0.7;
        itemSprite.position.set(
          cell.graphics.position.x + this.cellSize / 2,
          cell.graphics.position.y + this.cellSize / 2,
        );

        this.inventoryUI.addChild(itemSprite);
        cell.sprite = itemSprite;
      }
    });

    // Центрируем инвентарь
    this.inventoryUI.position.set(
      (this.gameWorld.width - this.inventoryUI.width) / 2,
      (this.gameWorld.height - this.inventoryUI.height) / 2,
    );
  }

  update(
    platformBody: Matter.Body,
    platformHeight: number,
    platformWidth: number,
  ): void {
    this.sprite.x = this.body.position.x;
    this.sprite.y = this.body.position.y;

    this.isOnGround = this.checkIsOnGround(
      platformBody,
      platformHeight,
      platformWidth,
    );

    if (this.isOnGround) {
      if (this.isJumping) {
        this.isJumping = false;
        this.jumpType = null;
      }
      if (this.isFlipping) {
        this.sprite.rotation = 0;
        this.isFlipping = false;
      }
    }

    this.updateWeaponPosition();
  }

  updateBullets(): void {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      const shouldRemove = bullet.update();

      if (shouldRemove) {
        bullet.destroy(this.physics);
        this.gameWorld.removeChild(bullet.sprite);
        this.bullets.splice(i, 1);
      }
    }
  }

  toggleInventory(): void {
    this.isInventoryOpen = !this.isInventoryOpen;
    this.inventoryUI.visible = this.isInventoryOpen;

    if (this.isInventoryOpen) {
      this.updateInventoryDisplay();
      this.inventoryUI.position.set(
        (this.gameWorld.width - this.inventoryUI.width) / 2,
        (this.gameWorld.height - this.inventoryUI.height) / 2,
      );
      // Устанавливаем максимальный zIndex
      this.gameWorld.setChildIndex(
        this.inventoryUI,
        this.gameWorld.children.length - 1,
      );
    } else {
      this.itemNameText.visible = false;
    }
  }

  handleLeftClick(): void {
    if (this.isInventoryOpen) {
      // Обработка клика теперь в onCellClick
      return;
    }

    const sniperRifle = this.inventory.find(
      (item) => item.name === "Снайперская винтовка",
    );
    if (sniperRifle) {
      this.equipWeapon(sniperRifle);
    }
  }

  handleRightClick(): void {
    if (this.currentWeapon) {
      this.unequipWeapon();
    }
  }

  equipWeapon(weapon: InventoryItem): void {
    this.unequipWeapon();

    this.currentWeapon = weapon;
    weapon.equipped = true;

    if (weapon.texture) {
      this.weaponSprite.texture = weapon.texture;
      this.weaponSprite.visible = true;
      this.weaponSprite.scale.set(1);
      this.aimAngle = 0;
      this.updateWeaponPosition();
    }

    this.updateInventoryDisplay();
  }

  unequipWeapon(): void {
    if (this.currentWeapon) {
      this.currentWeapon.equipped = false;
      this.currentWeapon = null;
      this.weaponSprite.visible = false;
      this.weaponSprite.texture = Texture.EMPTY;
      this.aimAngle = 0;
    }

    this.updateInventoryDisplay();
  }

  aimUp(): void {
    if (this.currentWeapon) {
      this.aimAngle = Math.max(this.aimAngle - 0.05, -Math.PI / 4);
      this.updateWeaponPosition();
    }
  }

  aimDown(): void {
    if (this.currentWeapon) {
      this.aimAngle = Math.min(this.aimAngle + 0.05, Math.PI / 4);
      this.updateWeaponPosition();
    }
  }

  shoot(): void {
    if (!this.currentWeapon) return;

    const baseAngle = this.direction === 1 ? 0 : Math.PI;
    const finalAngle =
      baseAngle + (this.direction === 1 ? this.aimAngle : -this.aimAngle);

    const bulletX = this.sprite.x + Math.cos(finalAngle) * 40;
    const bulletY = this.sprite.y + Math.sin(finalAngle) * 40;
    const bulletSpeed = 50;

    const bullet = new Bullet(
      bulletX,
      bulletY,
      finalAngle,
      bulletSpeed,
      this.bulletTexture,
      this.physics,
    );

    this.bullets.push(bullet);
    this.gameWorld.addChild(bullet.sprite);

    try {
      this.sounds.shoot.play();
    } catch (error) {
      console.warn("Ошибка воспроизведения звука выстрела:", error);
    }
  }

  updateWeaponPosition(): void {
    if (!this.currentWeapon || !this.weaponSprite.visible) return;

    const offsetX = this.direction === 1 ? 30 : -30;
    const offsetY = 20;

    this.weaponSprite.position.set(offsetX, offsetY);

    if (this.direction === 1) {
      this.weaponSprite.rotation = -this.aimAngle;
      this.weaponSprite.scale.x = 1;
    } else {
      this.weaponSprite.rotation = -this.aimAngle;
      this.weaponSprite.scale.x = 1;
    }
    this.weaponSprite.scale.y = 1;
  }

  moveLeft(): void {
    Matter.Body.setVelocity(this.body, {
      x: -this.config.speed,
      y: this.body.velocity.y,
    });
    this.sprite.scale.x = Math.abs(this.sprite.scale.x);
    this.direction = -1;
    this.updateWeaponPosition();
  }

  moveRight(): void {
    Matter.Body.setVelocity(this.body, {
      x: this.config.speed,
      y: this.body.velocity.y,
    });
    this.sprite.scale.x = -Math.abs(this.sprite.scale.x);
    this.direction = 1;
    this.updateWeaponPosition();
  }

  stopHorizontalMovement(): void {
    if (this.isOnGround) {
      Matter.Body.setVelocity(this.body, {
        x: 0,
        y: this.body.velocity.y,
      });
    }
  }

  jumpForward(): void {
    Matter.Body.setVelocity(this.body, {
      x: this.direction * this.config.jumpForwardForce,
      y: -this.config.jumpForwardUpForce,
    });
    this.isOnGround = false;
    this.isJumping = true;
    this.jumpType = "forward";
    this.playJumpSound();
  }

  jumpBackward(): void {
    Matter.Body.setVelocity(this.body, {
      x: -this.direction * this.config.jumpBackwardForce,
      y: -this.config.jumpBackwardUpForce,
    });
    this.isOnGround = false;
    this.isJumping = true;
    this.jumpType = "backward";
    this.isFlipping = true;
    this.flipRotation = 0;
    this.flipDirection = this.direction === 1 ? -1 : 1;
    this.playJumpSound();
  }

  private playJumpSound(): void {
    try {
      this.sounds.jump.play();
    } catch (error) {
      console.warn("Ошибка воспроизведения звука прыжка:", error);
    }
  }

  updateFlipAnimation(): void {
    if (this.isFlipping && this.jumpType === "backward") {
      this.flipRotation += 0.3;
      this.sprite.rotation = this.flipRotation * this.flipDirection;

      if (this.flipRotation >= Math.PI * 2) {
        this.sprite.rotation = 0;
        this.isFlipping = false;
      }
    }
  }

  constrainMovement(screenWidth: number, playerWidth: number): void {
    if (this.body.position.x < playerWidth / 2) {
      Matter.Body.setPosition(this.body, {
        x: playerWidth / 2,
        y: this.body.position.y,
      });
    }
    if (this.body.position.x > screenWidth - playerWidth / 2) {
      Matter.Body.setPosition(this.body, {
        x: screenWidth - playerWidth / 2,
        y: this.body.position.y,
      });
    }
  }

  private checkIsOnGround(
    platformBody: Matter.Body,
    platformHeight: number,
    platformWidth: number,
  ): boolean {
    return (
      this.body.position.y + this.sprite.height / 2 >=
        platformBody.position.y - platformHeight / 2 &&
      this.body.position.y + this.sprite.height / 2 <=
        platformBody.position.y &&
      this.body.position.x > platformBody.position.x - platformWidth / 2 &&
      this.body.position.x < platformBody.position.x + platformWidth / 2 &&
      this.body.velocity.y > -0.1 &&
      this.body.velocity.y < 0.1
    );
  }
}
