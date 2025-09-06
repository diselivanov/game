/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/utils/AssetLoader.ts
import { Assets, Sprite, Texture } from "pixi.js";
import { IMediaInstance, Sound } from "@pixi/sound";
import { GameSounds } from "../types";

/**
 * Класс для загрузки и управления всеми ресурсами игры
 * Централизованное управление текстурами, звуками и другими ассетами
 */
export class AssetLoader {
  private textures: Map<string, Texture> = new Map(); // Коллекция текстур
  private sounds: GameSounds = {} as GameSounds; // Коллекция звуков
  private soundsLoaded: boolean = false; // Флаг загрузки звуков

  /**
   * Загрузка всех ресурсов игры
   */
  async loadAllAssets(): Promise<void> {
    await this.loadTextures(); // Загрузка текстур
    await this.loadSounds(); // Загрузка звуков
  }

  /**
   * Загрузка всех текстур игры
   */
  async loadTextures(): Promise<void> {
    const textureDefinitions = [
      { key: "player", path: "/assets/player.png" },
      { key: "platform", path: "/assets/platform.png" },
      { key: "background", path: "/assets/background.png" },
      { key: "bullet", path: "/assets/bullet.png" },
      { key: "sniperRifle", path: "/assets/sniper_rifle.png" },
    ];

    // Последовательная загрузка каждой текстуры
    for (const { key, path } of textureDefinitions) {
      try {
        const texture = await Assets.load(path);
        this.textures.set(key, texture);
        console.log(`Текстура загружена: ${key}`);
      } catch (error) {
        console.warn(`Текстура не найдена: ${key} (${path})`);
        this.textures.set(key, Texture.EMPTY); // Запасная пустая текстура
      }
    }
  }

  /**
   * Загрузка всех звуков игры (без автоматического воспроизведения)
   */
  async loadSounds(): Promise<void> {
    const soundDefinitions = [
      { key: "jump", path: "/assets/sounds/jump.wav" },
      { key: "shoot", path: "/assets/sounds/shoot.wav" },
      { key: "hover", path: "/assets/sounds/hover.wav" },
    ];

    // Последовательная загрузка каждого звука
    for (const { key, path } of soundDefinitions) {
      try {
        const sound = await Assets.load(path);

        // Устанавливаем автопаузу для избежания ошибок автовоспроизведения
        sound.autoPlay = false;

        this.sounds[key as keyof GameSounds] = sound;
        console.log(`Звук загружен: ${key}`);
      } catch (error) {
        console.warn(`Звук не найден: ${key} (${path})`, error);
        // Создание пустого звука для избежания ошибок
        const emptySound = Sound.from({});
        emptySound.autoPlay = false;
        this.sounds[key as keyof GameSounds] = emptySound;
      }
    }

    // Настройка громкости звуков
    this.sounds.jump.volume = 0.5; // Средняя громкость прыжка
    this.sounds.shoot.volume = 0.5; // Средняя громкость выстрела
    this.sounds.hover.volume = 0.2; // Тихая громкость наведения

    this.soundsLoaded = true;
  }

  /**
   * Безопасное воспроизведение звука с проверкой жеста пользователя
   * @param soundKey - Ключ звука для воспроизведения
   */
  playSound(soundKey: keyof GameSounds): void {
    if (!this.soundsLoaded) return;

    const sound = this.sounds[soundKey];
    if (sound) {
      try {
        // Попытка воспроизведения с обработкой возможных ошибок
        (sound.play() as Promise<IMediaInstance>).catch((error: any) => {
          console.warn(`Не удалось воспроизвести звук ${soundKey}:`, error);
        });
      } catch (error) {
        console.warn(`Ошибка воспроизведения звука ${soundKey}:`, error);
      }
    }
  }

  /**
   * Получение текстуры по ключу
   * @param key - Ключ текстуры
   * @returns Объект текстуры или пустая текстура если не найдена
   */
  getTexture(key: string): Texture {
    return this.textures.get(key) || Texture.EMPTY;
  }

  /**
   * Получение всех звуков игры
   * @returns Объект со всеми звуками
   */
  getSounds(): GameSounds {
    return this.sounds;
  }

  /**
   * Создание спрайта фона с правильными размерами
   * @param width - Ширина фона
   * @param height - Высота фона
   * @returns Спрайт фона
   */
  createBackground(width: number, height: number): Sprite {
    const background = new Sprite(this.getTexture("background"));
    background.width = width;
    background.height = height;
    background.anchor.set(0); // Якорь в левом верхнем углу
    return background;
  }

  /**
   * Проверка наличия текстуры
   * @param key - Ключ текстуры
   * @returns true если текстура существует и не пустая
   */
  hasTexture(key: string): boolean {
    const texture = this.textures.get(key);
    return texture !== undefined && texture !== Texture.EMPTY;
  }

  /**
   * Очистка всех загруженных ресурсов
   */
  destroy(): void {
    this.textures.clear();
    // Звуки автоматически управляются Pixi.js
  }
}
