// Обрабатывает пользовательский ввод с клавиатуры, отслеживает состояние клавиш управления

import { KeysState } from "../types";

export class InputManager {
  public keys: KeysState; // Состояние клавиш

  constructor() {
    // Инициализация состояния всех отслеживаемых клавиш
    this.keys = {
      a: false, // Движение влево
      d: false, // Движение вправо
      enter: false, // Прыжок вперед
      backspace: false, // Прыжок назад
    };

    this.init(); // Установка обработчиков событий
  }

  private init(): void {
    // Подписка на события клавиатуры
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Обработка нажатия клавиш по кодам (не зависит от раскладки)
    if (e.code === "KeyA") this.keys.a = true; // Клавиша A
    if (e.code === "KeyD") this.keys.d = true; // Клавиша D
    if (e.code === "Enter") this.keys.enter = true; // Клавиша Enter
    if (e.code === "Backspace") this.keys.backspace = true; // Клавиша Backspace
  }

  private handleKeyUp(e: KeyboardEvent): void {
    // Обработка отпускания клавиш по кодам (не зависит от раскладки)
    if (e.code === "KeyA") this.keys.a = false; // Клавиша A
    if (e.code === "KeyD") this.keys.d = false; // Клавиша D
    if (e.code === "Enter") this.keys.enter = false; // Клавиша Enter
    if (e.code === "Backspace") this.keys.backspace = false; // Клавиша Backspace
  }

  destroy(): void {
    // Очистка обработчиков событий
    window.removeEventListener("keydown", this.handleKeyDown.bind(this));
    window.removeEventListener("keyup", this.handleKeyUp.bind(this));
  }
}
