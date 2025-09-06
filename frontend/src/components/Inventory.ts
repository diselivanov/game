/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Inventory.ts
import { Container, Text, Graphics, Sprite } from "pixi.js";
import { GameSounds, InventoryItem, InventoryCell } from "../types";

/**
 * Система управления инвентарем игрока
 * Отвечает за хранение, отображение и взаимодействие с предметами
 */
export class Inventory {
  public inventory: InventoryItem[] = [];
  public inventoryUI: Container;
  public inventoryCells: InventoryCell[] = [];
  public isInventoryOpen: boolean = false;
  public itemNameText: Text;

  // Добавляем колбэк для экипировки оружия
  public onEquipWeapon: ((weapon: InventoryItem) => void) | null = null;

  private gameWorld: Container;
  private sounds: GameSounds;
  private cellSize: number = 80;
  private cellsPerRow: number = 12;
  private cellsPerColumn: number = 6;
  private equippedIndicator: Graphics | null = null;

  constructor(gameWorld: Container, sounds: GameSounds) {
    this.gameWorld = gameWorld;
    this.sounds = sounds;
    this.inventoryUI = new Container();
    this.inventoryUI.visible = false;
    this.gameWorld.addChild(this.inventoryUI);

    this.itemNameText = new Text("", {
      fontSize: 15,
      fill: 0xffffff,
    });
    this.itemNameText.visible = false;
    this.inventoryUI.addChild(this.itemNameText);

    this.createInventoryUI();
  }

  /**
   * Создание основного интерфейса инвентаря
   */
  private createInventoryUI(): void {
    const background = new Graphics();
    background.beginFill(0x000000, 0); // Прозрачный фон
    background.drawRect(
      0,
      0,
      this.cellSize * this.cellsPerRow,
      this.cellSize * this.cellsPerColumn + 60,
    );
    background.endFill();
    this.inventoryUI.addChild(background);

    this.createInventoryGrid(); // Создание сетки ячеек
  }

  /**
   * Создание сетки ячеек инвентаря
   */
  private createInventoryGrid(): void {
    const startX = 0;
    const startY = 50; // Отступ сверху для заголовка

    for (let row = 0; row < this.cellsPerColumn; row++) {
      for (let col = 0; col < this.cellsPerRow; col++) {
        const cellX = startX + col * this.cellSize;
        const cellY = startY + row * this.cellSize;

        // Создание графики ячейки
        const cellGraphics = new Graphics();
        cellGraphics.beginFill(0x000000, 0.6);
        cellGraphics.lineStyle(1, 0xffffff, 0.2);
        cellGraphics.drawRect(0, 0, this.cellSize, this.cellSize);
        cellGraphics.endFill();
        cellGraphics.position.set(cellX, cellY);

        // Настройка интерактивности
        cellGraphics.interactive = true;
        cellGraphics.cursor = "pointer";

        const cellIndex = row * this.cellsPerRow + col;

        // Обработчики событий мыши
        cellGraphics.on("pointerover", () =>
          this.onCellHover(cellGraphics, cellIndex),
        );
        cellGraphics.on("pointerout", () =>
          this.onCellOut(cellGraphics, cellIndex),
        );
        cellGraphics.on("pointerdown", () => this.onCellClick(cellIndex));

        this.inventoryUI.addChild(cellGraphics);

        // Сохранение данных ячейки
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
  }

  /**
   * Обработчик наведения на ячейку
   */
  private onCellHover(cell: Graphics, cellIndex: number): void {
    const cellData = this.inventoryCells[cellIndex];

    try {
      this.sounds.hover.play(); // Воспроизведение звука наведения
    } catch (error) {
      console.warn("Ошибка воспроизведения звука наведения:", error);
    }

    if (cellData.item) {
      // Подсветка ячейки с предметом
      cell.clear();
      cell.beginFill(0x222222, 0.6);
      cell.lineStyle(1, 0xffffff, 0.2);
      cell.drawRect(0, 0, this.cellSize, this.cellSize);
      cell.endFill();

      // Показ названия предмета
      this.itemNameText.text = cellData.item.name;
      this.itemNameText.style.fontSize = 20;
      this.itemNameText.position.set(
        (this.inventoryUI.width - this.itemNameText.width) / 2,
        15,
      );
      this.itemNameText.visible = true;

      cellData.hover = true;
    }
  }

  /**
   * Обработчик ухода с ячейки
   */
  private onCellOut(cell: Graphics, cellIndex: number): void {
    const cellData = this.inventoryCells[cellIndex];

    if (cellData.item) {
      // Возврат к обычному виду
      cell.clear();
      cell.beginFill(0x000000, 0.6);
      cell.lineStyle(1, 0xffffff, 0.2);
      cell.drawRect(0, 0, this.cellSize, this.cellSize);
      cell.endFill();
    }

    this.itemNameText.visible = false;
    cellData.hover = false;
  }

  /**
   * Обработчик клика по ячейке
   */
  private onCellClick(cellIndex: number): void {
    const cellData = this.inventoryCells[cellIndex];

    if (cellData.item) {
      // Экипировка предмета при клике
      if (this.onEquipWeapon) {
        this.onEquipWeapon(cellData.item);
      }

      // Закрытие инвентаря после выбора
      this.toggle();
    }
  }

  /**
   * Добавление предмета в инвентарь
   */
  addItem(item: InventoryItem): void {
    this.inventory.push(item);
    this.updateInventoryDisplay();
  }

  /**
   * Обновление отображения инвентаря
   */
  updateInventoryDisplay(): void {
    // Очистка предыдущих спрайтов
    this.inventoryCells.forEach((cell) => {
      if (cell.sprite && this.inventoryUI.children.includes(cell.sprite)) {
        this.inventoryUI.removeChild(cell.sprite);
      }
      cell.sprite = null;
      cell.item = null;
    });

    // Удаление старого индикатора экипировки
    if (
      this.equippedIndicator &&
      this.inventoryUI.children.includes(this.equippedIndicator)
    ) {
      this.inventoryUI.removeChild(this.equippedIndicator);
    }

    // Заполнение ячеек предметами
    this.inventory.forEach((item, index) => {
      if (index < this.inventoryCells.length) {
        const cell = this.inventoryCells[index];
        cell.item = item;

        // Создание спрайта предмета
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

    // Центрирование инвентаря
    this.centerInventory();
  }

  /**
   * Центрирование интерфейса инвентаря на экране
   */
  private centerInventory(): void {
    this.inventoryUI.position.set(
      (this.gameWorld.width - this.inventoryUI.width) / 2,
      (this.gameWorld.height - this.inventoryUI.height) / 2,
    );
  }

  /**
   * Переключение видимости инвентаря
   */
  toggle(): void {
    this.isInventoryOpen = !this.isInventoryOpen;
    this.inventoryUI.visible = this.isInventoryOpen;

    if (this.isInventoryOpen) {
      this.updateInventoryDisplay();
      this.centerInventory();
      // Установка максимального z-index
      this.gameWorld.setChildIndex(
        this.inventoryUI,
        this.gameWorld.children.length - 1,
      );
    } else {
      this.itemNameText.visible = false;
    }
  }
}
