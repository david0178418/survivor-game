import { Application, Ticker, Container } from 'pixi.js';
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
import { setupInputHandlers } from './systems/input';
import { createBoundaries } from './systems/map';
import { Enemy } from './entities/enemy';
import type { World, GameState } from './types';
import { MAP } from './constants';

// Create the ECS world
let world: World = createWorld();

// Create separate containers for game and UI
const gameStage = new Container();
gameStage.sortableChildren = true;
const uiStage = new Container();
uiStage.sortableChildren = true;

// Game state
const gameState: GameState = {
	input: {
		up: false,
		down: false,
		left: false,
		right: false,
		shoot: false,
		mouseX: 0,
		mouseY: 0
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

// Initialize PIXI Application
const app = new Application();

/**
 * Game initialization
 */
async function init(): Promise<void> {
	// Initialize PIXI app
	await app.init({
		width: window.innerWidth,
		height: window.innerHeight,
		backgroundColor: MAP.BACKGROUND_COLOR,
		resolution: window.devicePixelRatio || 1
	});
	document.body.appendChild(app.view as HTMLCanvasElement);

	// Set up stage containers (UI stage added last to be on top)
	app.stage.sortableChildren = true;
	app.stage.addChild(gameStage);
	app.stage.addChild(uiStage);
	uiStage.zIndex = 1; // Ensure UI is always on top

	// Create player
	createPlayer(world);

	// Create map boundaries
	createBoundaries(gameStage, gameState.mapSize);

	// Create UI elements
	createUI(uiStage);

	// Set up input handlers
	setupInputHandlers(gameState, app);

	// Start game loop
	app.ticker.add(gameLoop);
}

/**
 * Reset the game state
 */
function resetGame() {
	// Delete the current world
	deleteWorld(world);

	// Create a new world
	world = createWorld();

	// Reset game state
	gameState.input = {
		up: false,
		down: false,
		left: false,
		right: false,
		shoot: false,
		mouseX: 0,
		mouseY: 0
	};
	gameState.camera = { x: 0, y: 0 };
	gameState.paused = false;

	// Clear stages
	gameStage.removeChildren();
	uiStage.removeChildren();

	// Create a new player
	createPlayer(world);

	// Create map boundaries
	createBoundaries(gameStage, gameState.mapSize);

	// Recreate UI elements
	createUI(uiStage);
}

/**
 * Main game loop
 */
function gameLoop(ticker: Ticker) {
	if (gameState.paused) return;

	const delta = ticker.deltaMS;

	// Get current entity counts
	const enemyCount = enemyQuery(world).length;

	// Check if player is dead
	if (isPlayerDead(world)) {
		resetGame();
		return;
	}

	// Run systems with their required parameters
	movementSystem(world, { gameState, delta });
	shootingSystem(world, { delta });
	spawnSystem(world, { delta, enemyCount });
	enemyAISystem(world, { delta });
	collectibleSystem(world, { delta });
	collisionSystem(world);
	boundarySystem(world, { mapSize: gameState.mapSize });
	uiSystem(world, { app });
	cameraSystem(world, { gameState, app, gameStage });
	renderSystem(world, { app: { ...app, stage: gameStage } as Application & { stage: Container } });
}

// Start the game
init().catch((error: Error) => console.error(error));
