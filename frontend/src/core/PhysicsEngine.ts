// src/core/PhysicsEngine.ts
import Matter from "matter-js";

/**
 * Обертка над Matter.js для управления физикой игры
 * Обеспечивает физическое моделирование тел и collisions
 */
export class PhysicsEngine {
  public engine: Matter.Engine; // Основной движок Matter.js
  public world: Matter.World; // Мир, содержащий все физические тела

  constructor() {
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.world.gravity.y = 2; // Гравитация
  }

  /**
   * Обновление физического движка
   * @param deltaTime - Время с последнего обновления (ms)
   */
  update(deltaTime: number = 1000 / 60): void {
    Matter.Engine.update(this.engine, deltaTime);
  }

  /**
   * Добавление физического тела в мир
   * @param body - Тело Matter.js для добавления
   */
  addBody(body: Matter.Body): void {
    Matter.World.add(this.world, body);
  }

  /**
   * Удаление физического тела из мира
   * @param body - Тело Matter.js для удаления
   */
  removeBody(body: Matter.Body): void {
    Matter.World.remove(this.world, body);
  }

  /**
   * Очистка всех тел из мира
   */
  clearBodies(): void {
    Matter.World.clear(this.world, false);
  }
}
