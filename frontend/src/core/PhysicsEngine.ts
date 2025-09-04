// Обёртка над Matter.js, управляет физическим миром

import Matter from "matter-js";

export class PhysicsEngine {
  public engine: Matter.Engine; // Основной движок Matter.js
  public world: Matter.World; // Физический мир

  constructor() {
    this.engine = Matter.Engine.create(); // Создание движка
    this.world = this.engine.world; // Получение ссылки на мир
    this.world.gravity.y = 2; // Установка гравитации (2 единицы по Y)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(p0: number): void {
    // Обновление физики
    Matter.Engine.update(this.engine, 1000 / 60); // Шаг 16.67ms (60 FPS)
  }

  addBody(body: Matter.Body): void {
    // Добавление тела в мир
    Matter.World.add(this.world, body);
  }

  removeBody(body: Matter.Body): void {
    // Удаление тела из мира
    Matter.World.remove(this.world, body);
  }
}
