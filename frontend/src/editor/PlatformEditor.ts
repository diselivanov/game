// src/editor/PlatformEditor.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Graphics, Container, Text, TextStyle, Rectangle } from "pixi.js";
import Matter from "matter-js";
import { Platform } from "../entities/Platform";

/**
 * Визуальный редактор для создания сложных платформ
 * Позволяет рисовать форму платформы курсором и экспортировать вершины
 */
export class PlatformEditor {
  public container: Container;
  public graphics: Graphics;
  public vertices: Matter.Vector[] = [];
  public isEditing: boolean = false;
  public isClosed: boolean = false;

  private instructionsText: Text;
  private statusText: Text;
  private backgroundOverlay: Graphics;

  private lineColor: number = 0x00ff00; // Зелёный
  private lineThickness: number = 1;
  private fillAlpha: number = 0.1; // Сильная прозрачность

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();

    // Создаем затемнение экрана
    this.backgroundOverlay = new Graphics();
    this.backgroundOverlay.beginFill(0x000000, 0.7);
    this.backgroundOverlay.drawRect(0, 0, 10000, 10000);
    this.backgroundOverlay.endFill();
    this.backgroundOverlay.zIndex = 9998;

    this.container.addChild(this.backgroundOverlay);
    this.container.addChild(this.graphics);

    this.setupInstructions();
    this.setupEventListeners();

    // Устанавливаем высокий z-index для всего редактора
    this.container.zIndex = 9999;
    this.graphics.zIndex = 10000;

    // Скрываем редактор по умолчанию
    this.setVisible(false);
  }

  /**
   * Настройка текстовых инструкций
   */
  private setupInstructions(): void {
    const textStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 16,
      fill: "#ffffff",
      align: "left",
      lineHeight: 20,
    });

    // Каждая подсказка с новой строки
    this.instructionsText = new Text({
      text: "ЛКМ: добавить вершину\nПКМ: завершить и скопировать\nR: сбросить",
      style: textStyle,
    });
    this.instructionsText.position.set(10, 10);
    this.instructionsText.zIndex = 10001;

    const statusStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 15,
      fill: "#f3f3f3ff",
      align: "left",
    });

    this.statusText = new Text({
      text: "Ожидание",
      style: statusStyle,
    });
    this.statusText.position.set(10, 90);
    this.statusText.zIndex = 10001;

    // Добавляем полупрозрачный фон для лучшей читаемости
    const bgGraphics = new Graphics();
    bgGraphics.beginFill(0x000000, 0.6);
    bgGraphics.drawRoundedRect(5, 5, 250, 120, 0);
    bgGraphics.endFill();
    bgGraphics.zIndex = 10000;

    this.container.addChild(bgGraphics);
    this.container.addChild(this.instructionsText);
    this.container.addChild(this.statusText);
  }

  /**
   * Настройка обработчиков событий
   */
  private setupEventListeners(): void {
    this.container.eventMode = "static";
    this.container.hitArea = new Rectangle(0, 0, 10000, 10000);
  }

  /**
   * Начать редактирование
   */
  startEditing(): void {
    this.isEditing = true;
    this.isClosed = false;
    this.vertices = [];
    this.updateStatus("Ожидание");
    this.clearGraphics();
    this.setVisible(true); // Показываем редактор при начале редактирования
  }

  /**
   * Завершить редактирование
   */
  finishEditing(): void {
    this.updateStatus("✅ Завершено и скопировано");
  }

  /**
   * Добавить вершину
   */
  addVertex(x: number, y: number): void {
    if (!this.isEditing || this.isClosed) return;

    this.vertices.push({ x, y });
    this.drawVertices();
    this.updateStatus(`📐 Вершин: ${this.vertices.length}`);
  }

  /**
   * Закрыть форму (соединить первую и последнюю вершины) и скопировать
   */
  closeShapeAndCopy(): void {
    if (this.vertices.length < 3) {
      this.updateStatus("❌ Нужно минимум 3 вершины");
      return;
    }

    this.isClosed = true;
    this.drawVertices();

    // Копирование вершин в буфер обмена
    const verticesString = this.exportVerticesString(0, 0); // Используем 0,0 для абсолютных координат
    navigator.clipboard
      .writeText(verticesString)
      .then(() => {
        this.updateStatus("✅ Завершено и скопировано");
        this.finishEditing();
      })
      .catch((err) => {
        console.error("Ошибка копирования: ", err);
        this.updateStatus("✅ Завершено (ошибка копирования)");
      });
  }

  /**
   * Сбросить форму
   */
  reset(): void {
    this.vertices = [];
    this.isClosed = false;
    this.clearGraphics();
    this.updateStatus("🔄 Форма сброшена");
  }

  /**
   * Отрисовка вершин и линий
   */
  private drawVertices(): void {
    this.clearGraphics();

    if (this.vertices.length === 0) return;

    // Отрисовка линий между вершинами
    this.graphics.lineStyle(this.lineThickness, this.lineColor, 1);
    this.graphics.moveTo(this.vertices[0].x, this.vertices[0].y);

    for (let i = 1; i < this.vertices.length; i++) {
      this.graphics.lineTo(this.vertices[i].x, this.vertices[i].y);
    }

    // Замыкание формы если нужно
    if (this.isClosed && this.vertices.length > 2) {
      this.graphics.lineTo(this.vertices[0].x, this.vertices[0].y);

      // Заливка формы
      this.graphics.beginFill(this.lineColor, this.fillAlpha);
      this.graphics.moveTo(this.vertices[0].x, this.vertices[0].y);
      for (let i = 1; i < this.vertices.length; i++) {
        this.graphics.lineTo(this.vertices[i].x, this.vertices[i].y);
      }
      this.graphics.lineTo(this.vertices[0].x, this.vertices[0].y);
      this.graphics.endFill();
    }

    // Отрисовка вершин:
    for (const vertex of this.vertices) {
      this.graphics.beginFill(this.lineColor, this.fillAlpha);
      this.graphics.drawRect(vertex.x - 1, vertex.y - 1, 2, 2);
      this.graphics.endFill();
    }
  }

  /**
   * Очистка графики
   */
  private clearGraphics(): void {
    this.graphics.clear();
  }

  /**
   * Обновление статусного текста
   */
  private updateStatus(message: string): void {
    this.statusText.text = message;
  }

  /**
   * Установить видимость редактора
   */
  setVisible(visible: boolean): void {
    this.container.visible = visible;
    this.instructionsText.visible = visible;
    this.statusText.visible = visible;
    this.graphics.visible = visible;
    this.backgroundOverlay.visible = visible;
  }

  /**
   * Получить относительные вершины (относительно центра)
   */
  getRelativeVertices(centerX: number, centerY: number): Matter.Vector[] {
    return this.vertices.map((vertex) => ({
      x: vertex.x - centerX,
      y: vertex.y - centerY,
    }));
  }

  /**
   * Экспорт вершин в виде строки для копирования
   */
  exportVerticesString(centerX: number, centerY: number): string {
    const relativeVertices = this.getRelativeVertices(centerX, centerY);
    const verticesString = relativeVertices
      .map((v) => `{ x: ${Math.round(v.x)}, y: ${Math.round(v.y)} }`)
      .join(",\n  ");

    return `[\n  ${verticesString}\n]`;
  }

  /**
   * Проверить валидность формы
   */
  isValidShape(): boolean {
    return this.isClosed && this.vertices.length >= 3;
  }

  /**
   * Создать платформу на основе текущей формы
   */
  createPlatform(x: number, y: number, texture?: any): Platform {
    if (!this.isValidShape()) {
      throw new Error("Невозможно создать платформу: форма невалидна");
    }

    const relativeVertices = this.getRelativeVertices(x, y);
    return new Platform(x, y, 0, 0, texture, relativeVertices);
  }
}
