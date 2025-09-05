// types.ts
import { Sound } from "@pixi/sound";
import { Sprite, Texture } from "pixi.js";

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
  texture: Texture;
  equipped: boolean;
}

export interface GameSounds {
  hover: Sound;
  jump: Sound;
  shoot: Sound;
}

export interface InventoryCell {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graphics: any;
  x: number;
  y: number;
  item: InventoryItem | null;
  sprite: Sprite | null;
  hover: boolean;
}
