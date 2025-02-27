import { Application, Graphics, Ticker, Text } from 'pixi.js';
import { createWorld, defineQuery, deleteWorld, hasComponent } from 'bitecs';
import { createPlayer } from './entities/player';
import { movementSystem } from './systems/movement';
import { cameraSystem } from './systems/camera';
import { boundarySystem } from './systems/boundary';
import { renderSystem } from './systems/render';
import { spawnSystem } from './systems/spawn';
import { enemyAISystem } from './systems/enemyAI';
import { shootingSystem } from './systems/shooting';
import { collisionSystem, isPlayerDead } from './systems/collision';
import { collectibleSystem } from './systems/collectible';
import { Enemy } from './entities/enemy';
import { Projectile, Player, Health, Collectible, Velocity, PickupRange } from './components';

// Create the ECS world
let world = createWorld();

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
const playerQuery = defineQuery([Player, Health]);
const collectibleQuery = defineQuery([Collectible]);

// Initialize PIXI Application
const app = new Application();

// UI elements
let healthText: Text;
let speedText: Text;
let damageText: Text;
let rangeText: Text;
let statsContainer: Graphics;

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

  // Initialize the game world
  initializeGame();

  // Setup input handlers
  setupInputHandlers();

  // Create UI elements
  createUI();

  // Start the game loop
  app.ticker.add(gameLoop);
}

// Initialize a new game
function initializeGame() {
  // Create game entities
  createPlayer(world);

  // Create boundary walls
  createBoundaries(world, gameState.mapSize);
}

// Reset the game
function resetGame() {
  // Clear the old world and create a new one
  deleteWorld(world);
  world = createWorld();

  // Reset game state (keep input state)
  gameState.camera.x = 0;
  gameState.camera.y = 0;

  // Initialize the new game
  initializeGame();

  console.log("Game reset: Player died");
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

// Create UI elements
function createUI() {
  // Create a semi-transparent container for stats
  statsContainer = new Graphics();
  statsContainer.beginFill(0x000000, 0.5);
  statsContainer.drawRect(0, 0, 200, 125); // Made taller to fit new range text
  statsContainer.endFill();
  statsContainer.x = 10;
  statsContainer.y = 10;

  app.stage.addChild(statsContainer);

  // Health display
  healthText = new Text('Health: 10 / 10', {
    fontFamily: 'Arial',
    fontSize: 16,
    fill: 0xFFFFFF,
    align: 'left'
  });

  healthText.x = 20;
  healthText.y = 20;
  healthText.resolution = 2;
  app.stage.addChild(healthText);

  // Speed display
  speedText = new Text('Speed: 0.5', {
    fontFamily: 'Arial',
    fontSize: 16,
    fill: 0xFFFFFF,
    align: 'left'
  });

  speedText.x = 20;
  speedText.y = 45;
  speedText.resolution = 2;
  app.stage.addChild(speedText);

  // Damage display
  damageText = new Text('Damage: 1', {
    fontFamily: 'Arial',
    fontSize: 16,
    fill: 0xFFFFFF,
    align: 'left'
  });

  damageText.x = 20;
  damageText.y = 70;
  damageText.resolution = 2;
  app.stage.addChild(damageText);

  // Range display
  rangeText = new Text('Pickup Range: 150', {
    fontFamily: 'Arial',
    fontSize: 16,
    fill: 0xFFFFFF,
    align: 'left'
  });

  rangeText.x = 20;
  rangeText.y = 95;
  rangeText.resolution = 2;
  app.stage.addChild(rangeText);
}

// Update UI
function updateUI(world: any) {
  const players = playerQuery(world);
  if (players.length === 0) return;

  const player = players[0];

  // Update health display
  const currentHealth = Health.current[player];
  const maxHealth = Health.max[player];
  healthText.text = `Health: ${currentHealth} / ${maxHealth}`;

  // Update speed display
  if (hasComponent(world, Velocity, player)) {
    const speed = Velocity.speed[player].toFixed(1);
    speedText.text = `Speed: ${speed}`;
  }

  // Damage is updated from the collectible system
  // We just need to reflect the current value
  damageText.text = `Damage: ${1 + Math.floor(getPlayerDamageBoost())}`;

  // Update pickup range display
  if (hasComponent(world, PickupRange, player)) {
    const range = Math.round(PickupRange.radius[player]);
    rangeText.text = `Pickup Range: ${range}`;
  }

  // Make sure UI follows camera
  statsContainer.x = gameState.camera.x + 10;
  statsContainer.y = gameState.camera.y + 10;

  healthText.x = gameState.camera.x + 20;
  healthText.y = gameState.camera.y + 20;

  speedText.x = gameState.camera.x + 20;
  speedText.y = gameState.camera.y + 45;

  damageText.x = gameState.camera.x + 20;
  damageText.y = gameState.camera.y + 70;

  rangeText.x = gameState.camera.x + 20;
  rangeText.y = gameState.camera.y + 95;
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
  const collectibleCount = collectibleQuery(world).length;

  // Check if player is dead
  if (isPlayerDead(world)) {
    resetGame();
    return;
  }

  // Update UI
  updateUI(world);

  // Run systems
  movementSystem(world, gameState, delta);
  shootingSystem(world, gameState, delta, true);
  spawnSystem(world, delta, enemyCount);
  enemyAISystem(world, delta);
  collectibleSystem(world, delta);
  collisionSystem(world);
  boundarySystem(world, gameState.mapSize);
  cameraSystem(world, gameState, app);
  renderSystem(world, app);
}

// Import for damage boost function
import { getPlayerDamageBoost } from './systems/collectible';

// Start the game
init().catch(console.error);
