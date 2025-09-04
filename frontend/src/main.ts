// Точка входа, асинхронно инициализирует и запускает игру

import { Game } from "./core/Game";

(async () => {
  // Асинхронная инициализация игры
  const game = new Game();
  await game.initialize(); // Ожидание загрузки ресурсов
})();
