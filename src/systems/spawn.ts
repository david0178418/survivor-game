import { defineQuery } from 'bitecs';
import { Player, Position, Experience } from '../components';
import { createEnemy } from '../entities/enemy';
import { ENEMY_SCALING } from '../constants';
import { getPlayerLevel } from './collectible';

// Define a query to get the player entity
const playerQuery = defineQuery([Player, Position, Experience]);

// Track spawn timing
let timeSinceLastSpawn = 0;
// Faster spawn interval: reduced by half (2x spawn rate)
let nextSpawnTime = (0.4 + Math.random() * 0.75) * 1000; // Was 0.8-2.3 seconds, now 0.4-1.15 seconds
// Base maximum number of enemies on screen
const BASE_MAX_ENEMIES = 30;

/**
 * System for spawning enemies based on player level
 *
 * @param world The game world
 * @param delta Time since last frame in milliseconds
 * @param enemyCount Current number of enemies in the world
 * @returns The updated world
 */
export function spawnSystem(world: any, delta: number, enemyCount: number) {
	// Get the player level
	const playerLevel = getPlayerLevel(world);

	// Calculate max enemies based on player level
	const maxEnemies = BASE_MAX_ENEMIES + (playerLevel * ENEMY_SCALING.SPAWN_INCREASE_PER_LEVEL);

	// Only spawn up to a maximum number of enemies
	if (enemyCount >= maxEnemies) {
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

	// Calculate spawn frequency based on player level (spawn faster at higher levels)
	// Increased rate: 8% faster per level (up from 5%), down to 40% of original time (down from 50%)
	const spawnFrequencyMultiplier = Math.max(0.4, 1.0 - (playerLevel * 0.08));

	// Update timer
	timeSinceLastSpawn += delta;

	// Check if it's time to spawn a new enemy
	if (timeSinceLastSpawn >= nextSpawnTime) {
		// Spawn an enemy with level-based scaling
		createEnemy(world, playerX, playerY, playerLevel);

		// Reset spawn timer
		timeSinceLastSpawn = 0;
		// Set random interval for next spawn, scaled by player level
		nextSpawnTime = (0.4 + Math.random() * 0.75) * 1000 * spawnFrequencyMultiplier;
	}

	return world;
}
