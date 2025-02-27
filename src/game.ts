import { Application, Ticker } from 'pixi.js';
import { createWorld, defineQuery, deleteWorld } from 'bitecs';
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
import { createUI, uiSystem } from './systems/ui';
import { setupInputHandlers, inputSystem } from './systems/input';
import { createBoundaries } from './systems/map';
import { Enemy } from './entities/enemy';
import { Projectile, Player, Health, Collectible } from './components';
import type { World, GameState, Entity } from './types';
import { MAP } from './constants';

// Create the ECS world
let world = createWorld() as World;

// Game state
const gameState: GameState = {
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
		width: MAP.WIDTH,
		height: MAP.HEIGHT
	},
	paused: false
};

// Define queries to count entities
const enemyQuery = defineQuery([Enemy]);
const projectileQuery = defineQuery([Projectile]);
const playerQuery = defineQuery([Player, Health]);
const collectibleQuery = defineQuery([Collectible]);

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
		backgroundColor: MAP.BACKGROUND_COLOR
	});

	// Add the canvas to the document
	document.body.appendChild(app.canvas);

	// Initialize the game world
	initializeGame();

	// Setup input handlers
	setupInputHandlers(gameState, app);

	// Create UI elements
	createUI(app);

	// Start the game loop
	app.ticker.add(gameLoop);
}

// Initialize a new game
function initializeGame() {
	// Create game entities
	createPlayer(world);

	// Create boundary walls
	createBoundaries(world, app, gameState.mapSize);
}

// Reset the game
function resetGame() {
	// Clear the old world and create a new one
	deleteWorld(world);
	world = createWorld() as World;

	// Reset game state (keep input state)
	gameState.camera.x = 0;
	gameState.camera.y = 0;

	// Initialize the new game
	initializeGame();

	console.log("Game reset: Player died");
}

// Main game loop
function gameLoop(ticker: Ticker) {
	const delta = ticker.deltaMS;

	// Process inputs
	inputSystem(gameState);

	// If game is paused, skip remaining updates
	if (gameState.paused) {
		return;
	}

	// Get current entity counts
	const enemyCount = enemyQuery(world).length;
	const collectibleCount = collectibleQuery(world).length;

	// Check if player is dead
	if (isPlayerDead(world)) {
		resetGame();
		return;
	}

	// Run systems
	movementSystem(world, gameState, delta);
	shootingSystem(world, gameState, delta, true);
	spawnSystem(world, delta, enemyCount);
	enemyAISystem(world, delta);
	collectibleSystem(world, delta);
	collisionSystem(world);
	boundarySystem(world, gameState.mapSize);
	uiSystem(world, gameState);
	cameraSystem(world, gameState, app);
	renderSystem(world, app);
}

// Start the game
init().catch(console.error);
