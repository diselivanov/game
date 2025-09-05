// types.ts
import { Sound } from "@pixi/sound";

export interface KeysState {
  a: boolean;
  d: boolean;
  enter: boolean;
  backspace: boolean;
  space: boolean;
  q: boolean;
  w: boolean;
  s: boolean;
  leftMouse: boolean;
  rightMouse: boolean;
}

export interface PlayerConfig {
  speed: number;
  jumpForwardUpForce: number;
  jumpBackwardUpForce: number;
  jumpForwardForce: number;
  jumpBackwardForce: number;
}

export interface InventoryItem {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  texture: any;
  equipped: boolean;
}

// Обновляем интерфейс для звуков Pixi.js
export interface GameSounds {
  jump: Sound;
  shoot: Sound;
}
