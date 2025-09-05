/* eslint-disable @typescript-eslint/no-unused-vars */
// Player.ts
import { Sprite, Texture, Graphics, Text, Container } from "pixi.js";
import Matter from "matter-js";
import { PlayerConfig, InventoryItem, GameSounds } from "../types";
import { PhysicsEngine } from "../core/PhysicsEngine";

export class Bullet {
  public sprite: Sprite;
  public velocity: { x: number; y: number };
  public lifetime: number = 2000; // 2 секунды
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
    // Проверяем время жизни пули
    if (Date.now() - this.createdAt > this.lifetime) {
      return true; // Пуля должна быть удалена
    }

    // Двигаем пулю по прямой
    this.sprite.x += this.velocity.x;
    this.sprite.y += this.velocity.y;

    return false;
  }

  destroy(_physics: PhysicsEngine): void {
    // Больше не нужно удалять физическое тело
  }
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

  private config: PlayerConfig;
  private bulletTexture: Texture;
  private sounds: GameSounds;

  constructor(
    x: number,
    y: number,
    texture: Texture,
    config: PlayerConfig,
    sniperRifleTexture: Texture,
    bulletTexture: Texture,
    gameWorld: Container,
    physics: PhysicsEngine,
    sounds: GameSounds, // Добавляем звуки
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

    // Создаем спрайт для оружия
    this.weaponSprite = new Sprite();
    this.weaponSprite.anchor.set(0.5, 0.5);
    this.weaponSprite.visible = false;

    // Добавляем оружие как дочерний элемент к спрайту игрока
    this.sprite.addChild(this.weaponSprite);

    // Создаем UI инвентаря
    this.inventoryUI = new Container();
    this.inventoryUI.visible = false;
    this.gameWorld.addChild(this.inventoryUI);

    // Добавляем снайперскую винтовку в инвентарь
    this.inventory.push({
      name: "Снайперская винтовка",
      texture: sniperRifleTexture,
      equipped: false,
    });

    this.createInventoryUI();
  }

  private createInventoryUI(): void {
    const background = new Graphics();
    background.beginFill(0x000000, 0.8);
    background.drawRect(0, 0, 300, 100);
    background.endFill();
    this.inventoryUI.addChild(background);

    const title = new Text("ИНВЕНТАРЬ", {
      fontSize: 16,
      fill: 0xffffff,
      fontWeight: "bold",
    });
    title.position.set(10, 10);
    this.inventoryUI.addChild(title);

    const instruction = new Text("ЛКМ - взять, ПКМ - снять, Q - закрыть", {
      fontSize: 12,
      fill: 0xcccccc,
    });
    instruction.position.set(10, 80);
    this.inventoryUI.addChild(instruction);
  }

  private updateInventoryUI(): void {
    // Очищаем старые элементы (кроме фона, заголовка и инструкции)
    while (this.inventoryUI.children.length > 3) {
      this.inventoryUI.removeChildAt(3);
    }

    let yPos = 35;
    this.inventory.forEach((item, index) => {
      const itemText = new Text(
        `${index + 1}. ${item.name} ${item.equipped ? "✓" : ""}`,
        {
          fontSize: 14,
          fill: item.equipped ? 0x00ff00 : 0xffffff,
        },
      );
      itemText.position.set(20, yPos);
      this.inventoryUI.addChild(itemText);
      yPos += 20;
    });

    // Центрируем инвентарь
    this.inventoryUI.position.set(
      (this.gameWorld.width - this.inventoryUI.width) / 2,
      50,
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

    // Обновление позиции оружия
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
      this.updateInventoryUI();
    }
  }

  handleLeftClick(): void {
    if (this.isInventoryOpen) {
      // Выбор снайперской винтовки из инвентаря
      const sniperRifle = this.inventory.find(
        (item) => item.name === "Снайперская винтовка",
      );
      if (sniperRifle) {
        this.equipWeapon(sniperRifle);
        this.isInventoryOpen = false;
        this.inventoryUI.visible = false;
      }
    }
  }

  handleRightClick(): void {
    if (this.currentWeapon) {
      this.unequipWeapon();
      console.log("Винтовка снята");
    }
  }

  equipWeapon(weapon: InventoryItem): void {
    // Снимаем текущее оружие
    this.unequipWeapon();

    // Экипируем новое оружие
    this.currentWeapon = weapon;
    weapon.equipped = true;

    if (weapon.texture) {
      this.weaponSprite.texture = weapon.texture;
      this.weaponSprite.visible = true;
      this.weaponSprite.scale.set(1);

      // Сбрасываем угол прицеливания
      this.aimAngle = 0;

      // Принудительно обновляем позицию
      this.updateWeaponPosition();
    }
  }

  unequipWeapon(): void {
    if (this.currentWeapon) {
      this.currentWeapon.equipped = false;
      this.currentWeapon = null;
      this.weaponSprite.visible = false;
      this.weaponSprite.texture = Texture.EMPTY;
      this.aimAngle = 0;
    }
  }

  aimUp(): void {
    if (this.currentWeapon) {
      // W поднимает прицел вверх
      this.aimAngle = Math.max(this.aimAngle - 0.05, -Math.PI / 4);
      this.updateWeaponPosition();
    }
  }

  aimDown(): void {
    if (this.currentWeapon) {
      // S опускает прицел вниз
      this.aimAngle = Math.min(this.aimAngle + 0.05, Math.PI / 4);
      this.updateWeaponPosition();
    }
  }

  shoot(): void {
    if (!this.currentWeapon) return;

    // Правильное вычисление угла стрельбы с учетом направления игрока
    const baseAngle = this.direction === 1 ? 0 : Math.PI;
    const finalAngle =
      baseAngle + (this.direction === 1 ? this.aimAngle : -this.aimAngle);

    // Создаем пулю
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

    // Воспроизводим звук выстрела через Pixi.js Sound
    try {
      this.sounds.shoot.play();
    } catch (error) {
      console.warn("Ошибка воспроизведения звука выстрела:", error);
    }

    console.log("Выстрел из снайперской винтовки!");
  }

  updateWeaponPosition(): void {
    if (!this.currentWeapon || !this.weaponSprite.visible) return;

    // Позиционирование оружия относительно игрока
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

    // Воспроизводим звук прыжка
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

    // Воспроизводим звук прыжка
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
