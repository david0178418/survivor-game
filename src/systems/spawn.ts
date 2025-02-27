import { defineQuery } from 'bitecs';
import { Player, Position } from '../components';
import { createEnemy } from '../entities/enemy';

// Define a query to get the player entity
const playerQuery = defineQuery([Player, Position]);

// Track spawn timing
let timeSinceLastSpawn = 0;
// Random spawn interval between 1-3 seconds (faster spawning)
let nextSpawnTime = (1 + Math.random() * 2) * 1000;
// Maximum number of enemies on screen
const MAX_ENEMIES = 30; // Increased from 20

export function spawnSystem(world: any, delta: number, enemyCount: number) {
	// Only spawn up to a maximum number of enemies
	if (enemyCount >= MAX_ENEMIES) {
		return world;
	}

	// Find the player entity
	const playerEntities = playerQuery(world);
	if (playerEntities.length === 0) {
		return world; // No player to target, no spawning
	}

	// Get player position
	const playerId = playerEntities[0];
	const playerX = Position.x[playerId];
	const playerY = Position.y[playerId];

	// Update timer
	timeSinceLastSpawn += delta;

	// Check if it's time to spawn a new enemy
	if (timeSinceLastSpawn >= nextSpawnTime) {
		// Spawn an enemy
		createEnemy(world, playerX, playerY);

		// Reset spawn timer
		timeSinceLastSpawn = 0;
		// Set random interval for next spawn
		nextSpawnTime = (1 + Math.random() * 2) * 1000;
	}

	return world;
}
