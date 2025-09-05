// InputManager.ts
import { KeysState } from "../types";

export class InputManager {
  public keys: KeysState;

  constructor() {
    this.keys = {
      a: false,
      d: false,
      enter: false,
      backspace: false,
      space: false,
      q: false,
      w: false,
      s: false,
      leftMouse: false,
      rightMouse: false,
    };

    this.init();
  }

  private init(): void {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
    window.addEventListener("mousedown", this.handleMouseDown.bind(this));
    window.addEventListener("mouseup", this.handleMouseUp.bind(this));

    // Блокируем контекстное меню на правый клик
    window.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.code === "KeyA") this.keys.a = true;
    if (e.code === "KeyD") this.keys.d = true;
    if (e.code === "Enter") this.keys.enter = true;
    if (e.code === "Backspace") this.keys.backspace = true;
    if (e.code === "Space") this.keys.space = true;
    if (e.code === "KeyQ") this.keys.q = true;
    if (e.code === "KeyW") this.keys.w = true;
    if (e.code === "KeyS") this.keys.s = true;
  }

  private handleKeyUp(e: KeyboardEvent): void {
    if (e.code === "KeyA") this.keys.a = false;
    if (e.code === "KeyD") this.keys.d = false;
    if (e.code === "Enter") this.keys.enter = false;
    if (e.code === "Backspace") this.keys.backspace = false;
    if (e.code === "Space") this.keys.space = false;
    if (e.code === "KeyQ") this.keys.q = false;
    if (e.code === "KeyW") this.keys.w = false;
    if (e.code === "KeyS") this.keys.s = false;
  }

  private handleMouseDown(e: MouseEvent): void {
    if (e.button === 0) this.keys.leftMouse = true;
    if (e.button === 2) this.keys.rightMouse = true;
  }

  private handleMouseUp(e: MouseEvent): void {
    if (e.button === 0) this.keys.leftMouse = false;
    if (e.button === 2) this.keys.rightMouse = false;
  }

  destroy(): void {
    window.removeEventListener("keydown", this.handleKeyDown.bind(this));
    window.removeEventListener("keyup", this.handleKeyUp.bind(this));
    window.removeEventListener("mousedown", this.handleMouseDown.bind(this));
    window.removeEventListener("mouseup", this.handleMouseUp.bind(this));
  }
}
