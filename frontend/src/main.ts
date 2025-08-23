import { Application, Assets, Sprite, Container } from "pixi.js";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application with larger world size
  await app.init({
    background: "#1099bb",
    resizeTo: window,
  });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // Load the bunny texture (you might want to create a proper character sprite)
  const texture = await Assets.load("/assets/bunny.png");

  // Create player character
  const player = new Sprite(texture);
  player.anchor.set(0.5);
  player.position.set(app.screen.width / 2, app.screen.height / 2);
  player.scale.set(0.5); // Make player smaller

  // Create world container that will hold all game objects
  const world = new Container();
  app.stage.addChild(world);
  world.addChild(player);

  // Player properties
  const playerSpeed = 5;
  const keys = {
    a: false,
    d: false,
  };

  // Keyboard input handling
  window.addEventListener("keydown", (e) => {
    if (e.key === "a" || e.key === "A") keys.a = true;
    if (e.key === "d" || e.key === "D") keys.d = true;
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "a" || e.key === "A") keys.a = false;
    if (e.key === "d" || e.key === "D") keys.d = false;
  });

  // Game loop
  app.ticker.add(() => {
    // Handle player movement
    if (keys.a) {
      player.x -= playerSpeed;
      player.scale.x = -0.5; // Flip sprite when moving left
    }
    if (keys.d) {
      player.x += playerSpeed;
      player.scale.x = 0.5; // Normal scale when moving right
    }

    // Optional: Keep player within world bounds
    player.x = Math.max(
      player.width / 2,
      Math.min(app.screen.width - player.width / 2, player.x),
    );
    player.y = Math.max(
      player.height / 2,
      Math.min(app.screen.height - player.height / 2, player.y),
    );
  });
})();
