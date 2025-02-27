import { defineQuery, defineSystem } from 'bitecs';
import { Player, Position, Experience } from '../components';
import { createEnemy, EnemyType, ENEMY_LEVEL_REQUIREMENTS } from '../entities/enemy';
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
 * Gets all available enemy types that can spawn at the current player level
 * 
 * @param playerLevel Current player level
 * @returns Array of enemy types available at this level
 */
function getAvailableEnemyTypes(playerLevel: number): EnemyType[] {
  return Object.values(EnemyType).filter(
    type => playerLevel >= ENEMY_LEVEL_REQUIREMENTS[type]
  );
}

/**
 * Randomly selects an enemy type from the available types
 * 
 * @param availableTypes Array of available enemy types
 * @returns Selected enemy type
 */
function selectRandomEnemyType(availableTypes: EnemyType[]): EnemyType {
  const index = Math.floor(Math.random() * availableTypes.length);
  return availableTypes[index];
}

/**
 * System for spawning enemies based on player level
 *
 * @param world The game world
 * @param delta Time since last frame in milliseconds
 * @param enemyCount Current number of enemies in the world
 * @returns The updated world
 */
export const spawnSystem = defineSystem((world: any, { delta, enemyCount }: { delta: number; enemyCount: number }): any => {
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
			// Get all enemy types available at current player level
		const availableEnemyTypes = getAvailableEnemyTypes(playerLevel);
		
		// Randomly select an enemy type from available types
		const selectedEnemyType = selectRandomEnemyType(availableEnemyTypes);
		
		// Spawn the selected enemy type
		createEnemy(world, playerX, playerY, playerLevel, selectedEnemyType);

		// Reset spawn timer
		timeSinceLastSpawn = 0;
		
		// Calculate next spawn time using base values and level multiplier
		nextSpawnTime = (SPAWN_CONFIG.BASE_MIN_TIME + Math.random() * SPAWN_CONFIG.BASE_RANDOM_VARIANCE) * 1000 * spawnFrequencyMultiplier;
	}

	return world;
});
