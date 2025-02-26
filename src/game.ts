import { Application, Graphics, Ticker } from 'pixi.js';
import { createWorld, defineQuery } from 'bitecs';
import { createPlayer } from './entities/player';
import { movementSystem } from './systems/movement';
import { cameraSystem } from './systems/camera';
import { boundarySystem } from './systems/boundary';
import { renderSystem } from './systems/render';
import { spawnSystem } from './systems/spawn';
import { enemyAISystem } from './systems/enemyAI';
import { shootingSystem } from './systems/shooting';
import { collisionSystem } from './systems/collision';
import { Enemy } from './entities/enemy';
import { Projectile } from './components';

// Create the ECS world
const world = createWorld();

// Game state
const gameState = {
  input: {
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false
  },
  camera: {
    x: 0,
    y: 0
  },
  mapSize: {
    width: 2000,
    height: 2000
  }
};

// Define queries to count entities
const enemyQuery = defineQuery([Enemy]);
const projectileQuery = defineQuery([Projectile]);

// Initialize PIXI Application
const app = new Application();

// Game initialization
async function init() {
  // Initialize PIXI app
  await app.init({
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    backgroundColor: 0xdddddd // Light gray
  });

  // Add the canvas to the document
  document.body.appendChild(app.canvas);
  
  // Create game entities
  createPlayer(world);
  
  // Create boundary walls
  createBoundaries(world, gameState.mapSize);
  
  // Setup input handlers
  setupInputHandlers();
  
  // Start the game loop
  app.ticker.add(gameLoop);
}

// Create boundary walls
function createBoundaries(world: any, mapSize: { width: number, height: number }) {
  const { width, height } = mapSize;
  const wallThickness = 20;
  
  // Create the container for all walls
  const wallsContainer = new Graphics();
  app.stage.addChild(wallsContainer);
  
  wallsContainer.beginFill(0x000000); // Black walls
  
  // Top wall
  wallsContainer.drawRect(0, 0, width, wallThickness);
  
  // Bottom wall
  wallsContainer.drawRect(0, height - wallThickness, width, wallThickness);
  
  // Left wall
  wallsContainer.drawRect(0, 0, wallThickness, height);
  
  // Right wall
  wallsContainer.drawRect(width - wallThickness, 0, wallThickness, height);
  
  wallsContainer.endFill();
  
  return wallsContainer;
}

// Setup input handlers
function setupInputHandlers() {
  // Keyboard handling
  window.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        gameState.input.up = true;
        break;
      case 's':
      case 'arrowdown':
        gameState.input.down = true;
        break;
      case 'a':
      case 'arrowleft':
        gameState.input.left = true;
        break;
      case 'd':
      case 'arrowright':
        gameState.input.right = true;
        break;
      case ' ': // Spacebar for shooting
        gameState.input.shoot = true;
        break;
    }
  });

  window.addEventListener('keyup', (e) => {
    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        gameState.input.up = false;
        break;
      case 's':
      case 'arrowdown':
        gameState.input.down = false;
        break;
      case 'a':
      case 'arrowleft':
        gameState.input.left = false;
        break;
      case 'd':
      case 'arrowright':
        gameState.input.right = false;
        break;
      case ' ': // Spacebar for shooting
        gameState.input.shoot = false;
        break;
    }
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
  });
}

// Main game loop
function gameLoop(ticker: Ticker) {
  const delta = ticker.deltaMS;
  
  // Get current entity counts
  const enemyCount = enemyQuery(world).length;
  const projectileCount = projectileQuery(world).length;
  
  // Run systems
  movementSystem(world, gameState, delta);
  shootingSystem(world, gameState, delta, true);
  spawnSystem(world, delta, enemyCount);
  enemyAISystem(world, delta);
  collisionSystem(world);
  boundarySystem(world, gameState.mapSize);
  cameraSystem(world, gameState, app);
  renderSystem(world, app);
}

// Start the game
init().catch(console.error);
