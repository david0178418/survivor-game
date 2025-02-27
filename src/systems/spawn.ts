import { defineQuery } from 'bitecs';
import { Player, Position, Experience } from '../components';
import { createEnemy } from '../entities/enemy';
import { ENEMY_SCALING } from '../constants';
import { getPlayerLevel } from './collectible';

// Define a query to get the player entity
const playerQuery = defineQuery([Player, Position, Experience]);

// Base spawn rate configuration (easily editable)
const SPAWN_CONFIG = {
  BASE_MIN_TIME: 1, // Minimum spawn time in seconds
  BASE_RANDOM_VARIANCE: 0.75, // Random variance added to min time
  LEVEL_REDUCTION_PERCENT: 0.08, // 8% faster spawn per level
  MIN_MULTIPLIER: 0.4, // Minimum spawn time multiplier (won't go lower than 40% of base)
};

// Track spawn timing
let timeSinceLastSpawn = 0;
// Initialize with base spawn time calculation
let nextSpawnTime = (SPAWN_CONFIG.BASE_MIN_TIME + Math.random() * SPAWN_CONFIG.BASE_RANDOM_VARIANCE) * 1000;

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
	const spawnFrequencyMultiplier = Math.max(
		SPAWN_CONFIG.MIN_MULTIPLIER, 
		1.0 - (playerLevel * SPAWN_CONFIG.LEVEL_REDUCTION_PERCENT)
	);

	// Update timer
	timeSinceLastSpawn += delta;

	// Check if it's time to spawn a new enemy
	if (timeSinceLastSpawn >= nextSpawnTime) {
		// Spawn an enemy with level-based scaling
		createEnemy(world, playerX, playerY, playerLevel);

		// Reset spawn timer
		timeSinceLastSpawn = 0;
		
		// Calculate next spawn time using base values and level multiplier
		nextSpawnTime = (SPAWN_CONFIG.BASE_MIN_TIME + Math.random() * SPAWN_CONFIG.BASE_RANDOM_VARIANCE) * 1000 * spawnFrequencyMultiplier;
	}

	return world;
}
