// Определяет TypeScript-интерфейсы

export interface KeysState {
  // Состояние клавиш управления
  a: boolean; // Движение влево
  d: boolean; // Движение вправо
  enter: boolean; // Прыжок вперед
  backspace: boolean; // Прыжок назад
}

export interface PlayerConfig {
  // Конфигурация игрока
  speed: number; // Базовая скорость движения
  jumpForwardUpForce: number; // Вертикальная сила прыжка вперед
  jumpBackwardUpForce: number; // Вертикальная сила прыжка назад
  jumpForwardForce: number; // Горизонтальная сила прыжка вперед
  jumpBackwardForce: number; // Горизонтальная сила прыжка назад
}
