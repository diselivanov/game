/* eslint-disable @typescript-eslint/no-explicit-any */
// src/entities/Player.ts
import { Sprite, Texture, Container } from "pixi.js";
import Matter from "matter-js";
import { PlayerConfig, GameSounds, InventoryItem } from "../types";
import { PhysicsEngine } from "../core/PhysicsEngine";
import { Inventory } from "../components/Inventory";
import { WeaponSystem } from "../components/WeaponSystem";
import { MovementSystem } from "../components/MovementSystem";

/**
 * Основной класс игрока - объединяет все системы и компоненты
 * Управляет графическим представлением, физикой и поведением
 */
export class Player {
  public sprite: Sprite; // Графическое представление игрока
  public body: Matter.Body; // Физическое тело для коллизий
  public inventory: Inventory; // Система управления инвентарем
  public weaponSystem: WeaponSystem; // Система оружия и стрельбы
  public movementSystem: MovementSystem; // Система движения и прыжков

  // Публичные свойства для внешнего доступа
  public get isOnGround(): boolean {
    return this.movementSystem.isOnGround;
  }
  public get isJumping(): boolean {
    return this.movementSystem.isJumping;
  }
  public get isFlipping(): boolean {
    return this.movementSystem.isFlipping;
  }
  public get direction(): number {
    return this.movementSystem.direction;
  }
  public get currentWeapon(): InventoryItem | null {
    return this.weaponSystem.currentWeapon;
  }

  private physics: PhysicsEngine; // Ссылка на физический движок
  private gameWorld: Container; // Ссылка на игровой мир

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
    this.physics = physics;
    this.gameWorld = gameWorld;

    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5);
    this.sprite.position.set(x, y);
    this.sprite.scale.set(0.2);

    this.body = Matter.Bodies.rectangle(
      x,
      y,
      this.sprite.width * 0.7,
      this.sprite.height,
      {
        inertia: Infinity,
      },
    );

    // Сначала создаем системы
    this.weaponSystem = new WeaponSystem(
      this,
      bulletTexture,
      sounds,
      gameWorld,
      physics,
    );

    this.movementSystem = new MovementSystem(this, config, sounds);

    // Затем создаем инвентарь и настраиваем колбэк
    this.inventory = new Inventory(gameWorld, sounds);
    this.inventory.onEquipWeapon = (weapon: InventoryItem) => {
      this.equipWeapon(weapon);
    };

    // Добавление начального предмета в инвентарь
    this.inventory.addItem({
      name: "Снайперская винтовка",
      texture: sniperRifleTexture,
      equipped: false,
    });
  }

  /**
   * Основное обновление состояния игрока
   * @param platform - Платформа для проверки коллизий
   */
  update(platform: any): void {
    this.movementSystem.update(platform);
    this.weaponSystem.updateWeaponPosition();
  }

  /**
   * Обновление состояния всех пуль
   */
  updateBullets(): void {
    this.weaponSystem.updateBullets();
  }

  // Делегирование методов инвентаря
  toggleInventory(): void {
    this.inventory.toggle();
  }

  // Убираем старый handleLeftClick или изменяем его
  handleLeftClick(): void {
    if (this.inventory.isInventoryOpen) {
      return;
    }
  }

  // Делегирование методов оружия
  handleRightClick(): void {
    this.weaponSystem.unequipWeapon();
  }
  equipWeapon(weapon: any): void {
    this.weaponSystem.equipWeapon(weapon);
  }
  aimUp(): void {
    this.weaponSystem.aimUp();
  }
  aimDown(): void {
    this.weaponSystem.aimDown();
  }
  shoot(): void {
    this.weaponSystem.shoot();
  }

  // Делегирование методов движения
  moveLeft(): void {
    this.movementSystem.moveLeft();
  }
  moveRight(): void {
    this.movementSystem.moveRight();
  }
  stopHorizontalMovement(): void {
    this.movementSystem.stopHorizontalMovement();
  }
  jumpForward(): void {
    this.movementSystem.jumpForward();
  }
  jumpBackward(): void {
    this.movementSystem.jumpBackward();
  }
  updateFlipAnimation(): void {
    this.movementSystem.updateFlipAnimation();
  }
  constrainMovement(screenWidth: number, playerWidth: number): void {
    this.movementSystem.constrainMovement(screenWidth, playerWidth);
  }
}
