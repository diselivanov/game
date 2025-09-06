/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/WeaponSystem.ts
import { Sprite, Texture, Container } from "pixi.js";
import { GameSounds, InventoryItem } from "../types";
import { PhysicsEngine } from "../core/PhysicsEngine";
import { Bullet } from "../entities/Bullet";

/**
 * Система управления оружием и стрельбой
 * Отвечает за экипировку, прицеливание и стрельбу
 */
export class WeaponSystem {
  public weaponSprite: Sprite; // Спрайт оружия на игроке
  public currentWeapon: InventoryItem | null = null; // Текущее оружие
  public aimAngle: number = 0; // Угол прицеливания
  public bullets: Bullet[] = []; // Массив активных пуль

  private player: any; // Ссылка на игрока
  private bulletTexture: Texture; // Текстура пули
  private sounds: GameSounds; // Звуки оружия
  private gameWorld: Container; // Игровой мир для добавления пуль
  private physics: PhysicsEngine; // Физический движок

  constructor(
    player: any,
    bulletTexture: Texture,
    sounds: GameSounds,
    gameWorld: Container,
    physics: PhysicsEngine,
  ) {
    this.player = player;
    this.bulletTexture = bulletTexture;
    this.sounds = sounds;
    this.gameWorld = gameWorld;
    this.physics = physics;

    // Инициализация спрайта оружия
    this.weaponSprite = new Sprite();
    this.weaponSprite.anchor.set(0.5, 0.5);
    this.weaponSprite.visible = false;
    this.player.sprite.addChild(this.weaponSprite);
  }

  /**
   * Экипировка оружия
   * @param weapon - Предмет оружия для экипировки
   */
  equipWeapon(weapon: InventoryItem): void {
    this.unequipWeapon(); // Сначала снимаем текущее оружие

    this.currentWeapon = weapon;
    weapon.equipped = true;

    if (weapon.texture) {
      this.weaponSprite.texture = weapon.texture;
      this.weaponSprite.visible = true;
      this.weaponSprite.scale.set(1);
      this.aimAngle = 0; // Сброс угла прицеливания
      this.updateWeaponPosition();
    }
  }

  /**
   * Снятие текущего оружия
   */
  unequipWeapon(): void {
    if (this.currentWeapon) {
      this.currentWeapon.equipped = false;
      this.currentWeapon = null;
      this.weaponSprite.visible = false;
      this.weaponSprite.texture = Texture.EMPTY;
      this.aimAngle = 0;
    }
  }

  /**
   * Прицеливание вверх
   */
  aimUp(): void {
    if (this.currentWeapon) {
      this.aimAngle = Math.max(this.aimAngle - 0.05, -Math.PI / 4);
      this.updateWeaponPosition();
    }
  }

  /**
   * Прицеливание вниз
   */
  aimDown(): void {
    if (this.currentWeapon) {
      this.aimAngle = Math.min(this.aimAngle + 0.05, Math.PI / 4);
      this.updateWeaponPosition();
    }
  }

  /**
   * Выстрел из текущего оружия
   */
  shoot(): void {
    if (!this.currentWeapon) return;

    // Расчет угла выстрела с учетом направления и прицеливания
    const baseAngle = this.player.direction === 1 ? 0 : Math.PI;
    const finalAngle =
      baseAngle +
      (this.player.direction === 1 ? this.aimAngle : -this.aimAngle);

    // Позиция вылета пули (дульный срез)
    const bulletX = this.player.sprite.x + Math.cos(finalAngle) * 40;
    const bulletY = this.player.sprite.y + Math.sin(finalAngle) * 40;
    const bulletSpeed = 50; // Скорость пули

    // Создание новой пули
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

    // Воспроизведение звука выстрела
    try {
      this.sounds.shoot.play();
    } catch (error) {
      console.warn("Ошибка воспроизведения звука выстрела:", error);
    }
  }

  /**
   * Обновление позиции и поворота оружия
   */
  updateWeaponPosition(): void {
    if (!this.currentWeapon || !this.weaponSprite.visible) return;

    // Смещение оружия относительно игрока
    const offsetX = this.player.direction === 1 ? 30 : -30;
    const offsetY = 20;

    this.weaponSprite.position.set(offsetX, offsetY);

    // Поворот оружия в зависимости от направления и прицеливания
    if (this.player.direction === 1) {
      this.weaponSprite.rotation = -this.aimAngle;
      this.weaponSprite.scale.x = 1;
    } else {
      this.weaponSprite.rotation = -this.aimAngle;
      this.weaponSprite.scale.x = 1;
    }
    this.weaponSprite.scale.y = 1;
  }

  /**
   * Обновление состояния всех пуль
   */
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
}
