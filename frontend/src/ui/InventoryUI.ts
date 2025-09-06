// src/ui/InventoryUI.ts
import { Container, Graphics, Text, Sprite } from "pixi.js";
import { InventoryItem, InventoryCell, GameSounds } from "../types";

/**
 * UI компонент для отображения и управления инвентарем
 * Отделен от логики инвентаря для чистоты архитектуры
 */
export class InventoryUI {
  public container: Container; // Основной контейнер UI
  public cells: InventoryCell[] = []; // Массив ячеек инвентаря
  public itemNameText: Text; // Текст названия предмета
  public isVisible: boolean = false; // Видимость интерфейса

  private cellSize: number = 80; // Размер одной ячейки
  private cellsPerRow: number = 12; // Количество ячеек в строке
  private cellsPerColumn: number = 6; // Количество ячеек в столбце
  private sounds: GameSounds; // Звуки для UI

  constructor(sounds: GameSounds) {
    this.sounds = sounds;
    this.container = new Container();
    this.container.visible = false;

    this.itemNameText = new Text("", {
      fontSize: 14,
      fill: 0xffffff,
      fontWeight: "bold",
    });
    this.itemNameText.visible = false;
    this.container.addChild(this.itemNameText);

    this.createUI();
  }

  /**
   * Создание основного интерфейса инвентаря
   */
  private createUI(): void {
    this.createBackground();
    this.createGrid();
  }

  /**
   * Создание фона инвентаря
   */
  private createBackground(): void {
    const background = new Graphics();
    background.beginFill(0x000000, 0.7); // Полупрозрачный черный фон
    background.drawRect(
      0,
      0,
      this.cellSize * this.cellsPerRow,
      this.cellSize * this.cellsPerColumn + 60,
    );
    background.endFill();
    this.container.addChild(background);
  }

  /**
   * Создание сетки ячеек инвентаря
   */
  private createGrid(): void {
    const startX = 0;
    const startY = 50;

    for (let row = 0; row < this.cellsPerColumn; row++) {
      for (let col = 0; col < this.cellsPerRow; col++) {
        this.createCell(row, col, startX, startY);
      }
    }
  }

  /**
   * Создание отдельной ячейки инвентаря
   */
  private createCell(
    row: number,
    col: number,
    startX: number,
    startY: number,
  ): void {
    const cellX = startX + col * this.cellSize;
    const cellY = startY + row * this.cellSize;
    const cellIndex = row * this.cellsPerRow + col;

    const cellGraphics = new Graphics();
    cellGraphics.beginFill(0x000000, 0.6);
    cellGraphics.lineStyle(1, 0xffffff, 0.2);
    cellGraphics.drawRect(0, 0, this.cellSize, this.cellSize);
    cellGraphics.endFill();
    cellGraphics.position.set(cellX, cellY);

    cellGraphics.interactive = true;
    cellGraphics.cursor = "pointer";

    // Обработчики событий
    cellGraphics.on("pointerover", () =>
      this.onCellHover(cellGraphics, cellIndex),
    );
    cellGraphics.on("pointerout", () =>
      this.onCellOut(cellGraphics, cellIndex),
    );

    this.container.addChild(cellGraphics);

    this.cells.push({
      x: col,
      y: row,
      item: null,
      sprite: null,
      hover: false,
      graphics: cellGraphics,
    });
  }

  /**
   * Обработчик наведения на ячейку
   */
  private onCellHover(cell: Graphics, cellIndex: number): void {
    const cellData = this.cells[cellIndex];

    try {
      this.sounds.hover.play();
    } catch (error) {
      console.warn("Ошибка воспроизведения звука наведения:", error);
    }

    if (cellData.item) {
      this.highlightCell(cell);
      this.showItemName(cellData.item.name);
      cellData.hover = true;
    }
  }

  /**
   * Подсветка ячейки при наведении
   */
  private highlightCell(cell: Graphics): void {
    cell.clear();
    cell.beginFill(0x222222, 0.6);
    cell.lineStyle(1, 0xffffff, 0.2);
    cell.drawRect(0, 0, this.cellSize, this.cellSize);
    cell.endFill();
  }

  /**
   * Показ названия предмета
   */
  private showItemName(name: string): void {
    this.itemNameText.text = name;
    this.itemNameText.style.fontSize = 20;
    this.itemNameText.position.set(
      (this.container.width - this.itemNameText.width) / 2,
      15,
    );
    this.itemNameText.visible = true;
  }

  /**
   * Обработчик ухода с ячейки
   */
  private onCellOut(cell: Graphics, cellIndex: number): void {
    const cellData = this.cells[cellIndex];

    if (cellData.item) {
      this.resetCellAppearance(cell);
    }

    this.itemNameText.visible = false;
    cellData.hover = false;
  }

  /**
   * Восстановление обычного вида ячейки
   */
  private resetCellAppearance(cell: Graphics): void {
    cell.clear();
    cell.beginFill(0x000000, 0.6);
    cell.lineStyle(1, 0xffffff, 0.2);
    cell.drawRect(0, 0, this.cellSize, this.cellSize);
    cell.endFill();
  }

  /**
   * Обновление отображения предметов в инвентаре
   */
  updateDisplay(items: InventoryItem[]): void {
    this.clearCells();
    this.populateCells(items);
  }

  /**
   * Очистка всех ячеек
   */
  private clearCells(): void {
    this.cells.forEach((cell) => {
      if (cell.sprite && this.container.children.includes(cell.sprite)) {
        this.container.removeChild(cell.sprite);
      }
      cell.sprite = null;
      cell.item = null;
    });
  }

  /**
   * Заполнение ячеек предметами
   */
  private populateCells(items: InventoryItem[]): void {
    items.forEach((item, index) => {
      if (index < this.cells.length) {
        const cell = this.cells[index];
        cell.item = item;
        this.createItemSprite(cell, item);
      }
    });
  }

  /**
   * Создание спрайта предмета в ячейке
   */
  private createItemSprite(cell: InventoryCell, item: InventoryItem): void {
    const itemSprite = new Sprite(item.texture);
    itemSprite.anchor.set(0.5);
    itemSprite.width = this.cellSize * 0.7;
    itemSprite.height = this.cellSize * 0.7;
    itemSprite.position.set(
      cell.graphics.position.x + this.cellSize / 2,
      cell.graphics.position.y + this.cellSize / 2,
    );

    this.container.addChild(itemSprite);
    cell.sprite = itemSprite;
  }

  /**
   * Центрирование интерфейса на экране
   */
  centerOnScreen(screenWidth: number, screenHeight: number): void {
    this.container.position.set(
      (screenWidth - this.container.width) / 2,
      (screenHeight - this.container.height) / 2,
    );
  }

  /**
   * Переключение видимости интерфейса
   */
  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
    this.container.visible = this.isVisible;

    if (!this.isVisible) {
      this.itemNameText.visible = false;
    }
  }

  /**
   * Установка максимального z-index
   */
  bringToFront(parentContainer: Container): void {
    parentContainer.setChildIndex(
      this.container,
      parentContainer.children.length - 1,
    );
  }
}
