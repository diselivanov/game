// src/main.ts
/**
 * Точка входа в игру
 * Асинхронно инициализирует и запускает игровой цикл
 */
import { Game } from "./core/Game";

// Асинхронная функция инициализации игры
(async () => {
  try {
    const game = new Game(); // Создание экземпляра игры
    await game.initialize(); // Ожидание загрузки ресурсов и инициализации
    console.log("Игра успешно запущена!");
  } catch (error) {
    console.error("Ошибка запуска игры:", error);
  }
})();
