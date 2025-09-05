// PhysicsEngine.ts
import Matter from "matter-js";

export class PhysicsEngine {
  public engine: Matter.Engine;
  public world: Matter.World;

  constructor() {
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.world.gravity.y = 2;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(p0: number): void {
    Matter.Engine.update(this.engine, 1000 / 60);
  }

  addBody(body: Matter.Body): void {
    Matter.World.add(this.world, body);
  }

  removeBody(body: Matter.Body): void {
    Matter.World.remove(this.world, body);
  }
}
