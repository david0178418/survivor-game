import { defineQuery } from 'bitecs';
import { Position, Velocity, Player } from '../components';
import { Enemy, FastEnemy } from '../entities/enemy';

// Define queries to get player and enemy entities
const playerQuery = defineQuery([Player, Position]);
const enemyQuery = defineQuery([Enemy, Position, Velocity]);
const fastEnemyQuery = defineQuery([FastEnemy, Position, Velocity]);

export function enemyAISystem(world: any, delta: number) {
	// Find the player entity
	const playerEntities = playerQuery(world);
	if (playerEntities.length === 0) {
		return world; // No player to target
	}

	// Get player position
	const playerId = playerEntities[0];
	const playerX = Position.x[playerId];
	const playerY = Position.y[playerId];

	// Get all enemies
	const enemies = enemyQuery(world);
	// Get fast enemies (subset of all enemies)
	const fastEnemies = fastEnemyQuery(world);
	const fastEnemySet = new Set(fastEnemies);

	// Update each enemy's movement to target the player
	for (const enemy of enemies) {
		// Calculate direction to player
		const enemyX = Position.x[enemy];
		const enemyY = Position.y[enemy];

		// Vector from enemy to player
		const dx = playerX - enemyX;
		const dy = playerY - enemyY;

		// Normalize the direction vector
		const distance = Math.sqrt(dx * dx + dy * dy);
		
		if (distance > 0) {
			// Check if this is a fast enemy
			if (fastEnemySet.has(enemy)) {
				// Fast enemies have slight randomness in their direction
				// This creates a more erratic movement pattern
				const randomAngle = (Math.random() - 0.5) * 0.5; // -0.25 to 0.25 radians (±15°)
				const cos = Math.cos(randomAngle);
				const sin = Math.sin(randomAngle);
				
				// Apply rotation to direction vector
				const rotatedDx = dx * cos - dy * sin;
				const rotatedDy = dx * sin + dy * cos;
				
				// Normalize and set velocity
				Velocity.x[enemy] = rotatedDx / distance;
				Velocity.y[enemy] = rotatedDy / distance;
			} else {
				// Regular enemies move directly toward the player
				Velocity.x[enemy] = dx / distance;
				Velocity.y[enemy] = dy / distance;
			}
		}

		// Apply velocity to position
		Position.x[enemy] += Velocity.x[enemy] * Velocity.speed[enemy] * delta;
		Position.y[enemy] += Velocity.y[enemy] * Velocity.speed[enemy] * delta;
	}

	return world;
}
