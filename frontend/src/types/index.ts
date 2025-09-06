/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/index.ts
import { Sound } from "@pixi/sound";
import { Sprite, Texture } from "pixi.js";

/**
 * Состояние всех отслеживаемых клавиш и кнопок мыши
 */
export interface KeysState {
  a: boolean; // Движение влево
  d: boolean; // Движение вправо
  enter: boolean; // Прыжок вперед
  backspace: boolean; // Прыжок назад
  space: boolean; // Стрельба
  q: boolean; // Открыть/закрыть инвентарь
  w: boolean; // Прицеливание вверх
  s: boolean; // Прицеливание вниз
  leftMouse: boolean; // Левый клик мыши
  rightMouse: boolean; // Правый клик мыши
  p: boolean; // Переключение редактора платформ
}

/**
 * Конфигурационные параметры движения игрока
 */
export interface PlayerConfig {
  speed: number; // Базовая скорость горизонтального движения
  jumpForwardUpForce: number; // Вертикальная сила прыжка вперед
  jumpBackwardUpForce: number; // Вертикальная сила прыжка назад
  jumpForwardForce: number; // Горизонтальная сила прыжка вперед
  jumpBackwardForce: number; // Горизонтальная сила прыжка назад
}

/**
 * Предмет инвентаря игрока
 */
export interface InventoryItem {
  name: string; // Название предмета
  texture: Texture; // Текстура для отображения
  equipped: boolean; // Экипирован ли предмет
}

/**
 * Коллекция звуков игры
 */
export interface GameSounds {
  hover: Sound; // Звук наведения на элемент UI
  jump: Sound; // Звук прыжка
  shoot: Sound; // Звук выстрела
}

/**
 * Ячейка инвентаря в UI
 */
export interface InventoryCell {
  graphics: any; // Графическое представление ячейки
  x: number; // Позиция X в сетке
  y: number; // Позиция Y в сетке
  item: InventoryItem | null; // Предмет в ячейке (если есть)
  sprite: Sprite | null; // Спрайт предмета (если есть)
  hover: boolean; // Наведена ли мышь на ячейку
}

/**
 * Направления движения
 */
export enum Direction {
  RIGHT = 1, // Движение/взгляд вправо
  LEFT = -1, // Движение/взгляд влево
}

/**
 * Типы прыжков
 */
export enum JumpType {
  FORWARD = "forward", // Прыжок вперед
  BACKWARD = "backward", // Прыжок назад с переворотом
}

/**
 * Состояние игрока
 */
export interface PlayerState {
  isOnGround: boolean; // Стоит ли на поверхности
  isJumping: boolean; // В процессе прыжка
  isFlipping: boolean; // В процессе переворота
  direction: Direction; // Направление взгляда
}

/**
 * Позиция в двумерном пространстве
 */
export interface Position {
  x: number; // Координата X
  y: number; // Координата Y
}

/**
 * Размер объекта
 */
export interface Size {
  width: number; // Ширина
  height: number; // Высота
}

/**
 * Режимы редактора платформ
 */
export enum PlatformEditorMode {
  DISABLED = "disabled",
  DRAWING = "drawing",
  EDITING = "editing",
  COMPLETED = "completed",
}
