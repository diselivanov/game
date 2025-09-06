// src/ui/UICell.ts
import { Graphics, Sprite } from "pixi.js";
import { InventoryItem } from "../types";

/**
 * Отдельный UI компонент ячейки инвентаря
 * Инкапсулирует логику отдельной ячейки
 */
export class UICell {
  public graphics: Graphics; // Графическое представление
  public item: InventoryItem | null; // Предмет в ячейке
  public sprite: Sprite | null; // Спрайт предмета
  public hover: boolean; // Состояние наведения

  private x: number; // Позиция X в сетке
  private y: number; // Позиция Y в сетке
  private size: number; // Размер ячейки
  private onHover: () => void; // Колбэк наведения
  private onOut: () => void; // Колбэк ухода

  constructor(
    x: number,
    y: number,
    size: number,
    onHover: () => void,
    onOut: () => void,
  ) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.onHover = onHover;
    this.onOut = onOut;
    this.item = null;
    this.sprite = null;
    this.hover = false;

    this.graphics = new Graphics();
    this.setupGraphics();
    this.setupInteractivity();
  }

  /**
   * Настройка графического представления ячейки
   */
  private setupGraphics(): void {
    this.graphics.beginFill(0x000000, 0.6);
    this.graphics.lineStyle(1, 0xffffff, 0.2);
    this.graphics.drawRect(0, 0, this.size, this.size);
    this.graphics.endFill();
    this.graphics.position.set(this.x, this.y);
  }

  /**
   * Настройка интерактивности ячейки
   */
  private setupInteractivity(): void {
    this.graphics.interactive = true;
    this.graphics.cursor = "pointer";

    this.graphics.on("pointerover", () => {
      this.hover = true;
      this.onHover();
    });

    this.graphics.on("pointerout", () => {
      this.hover = false;
      this.onOut();
    });
  }

  /**
   * Установка предмета в ячейку
   */
  setItem(item: InventoryItem): void {
    this.item = item;
  }

  /**
   * Очистка ячейки
   */
  clear(): void {
    this.item = null;
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }

  /**
   * Подсветка ячейки при наведении
   */
  highlight(): void {
    this.graphics.clear();
    this.graphics.beginFill(0x222222, 0.6);
    this.graphics.lineStyle(1, 0xffffff, 0.2);
    this.graphics.drawRect(0, 0, this.size, this.size);
    this.graphics.endFill();
  }

  /**
   * Возврат к обычному виду ячейки
   */
  resetAppearance(): void {
    this.graphics.clear();
    this.graphics.beginFill(0x000000, 0.6);
    this.graphics.lineStyle(1, 0xffffff, 0.2);
    this.graphics.drawRect(0, 0, this.size, this.size);
    this.graphics.endFill();
  }
}
