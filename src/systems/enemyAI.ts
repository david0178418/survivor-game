import { defineQuery } from 'bitecs';
import { Position, Velocity, Player } from '../components';
import { Enemy, FastEnemy, ShooterEnemy } from '../entities/enemy';
import { createEnemyProjectile } from '../entities/projectile';

// Define queries to get player and enemy entities
const playerQuery = defineQuery([Player, Position]);
const enemyQuery = defineQuery([Enemy, Position, Velocity]);
const fastEnemyQuery = defineQuery([FastEnemy, Position, Velocity]);
const shooterEnemyQuery = defineQuery([ShooterEnemy, Position, Velocity]);

// Shooter enemy settings
const SHOOTER_ENEMY = {
	SHOOT_RANGE: 350, // Only shoot when player is within this range
	SHOOT_COOLDOWN: 2000, // Cooldown between shots in milliseconds
};

// Track cooldowns for shooter enemies
const shooterCooldowns = new Map<number, number>();

// Cleanup function to remove cooldown entries for destroyed entities
export function cleanupShooterCooldowns(world: any): void {
	// Get current shooter enemies
	const shooterEnemies = new Set(shooterEnemyQuery(world));
	
	// Remove cooldown entries for any enemies that no longer exist
	for (const entityId of shooterCooldowns.keys()) {
		if (!shooterEnemies.has(entityId)) {
			shooterCooldowns.delete(entityId);
		}
	}
}

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
	// Get shooter enemies (subset of all enemies)
	const shooterEnemies = shooterEnemyQuery(world);
	const shooterEnemySet = new Set(shooterEnemies);

	// Clean up cooldowns for destroyed shooter enemies
	cleanupShooterCooldowns(world);

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
			} else if (shooterEnemySet.has(enemy)) {
				// Shooter enemies try to maintain a distance from the player
				
				// Initialize the cooldown if it doesn't exist
				if (!shooterCooldowns.has(enemy)) {
					shooterCooldowns.set(enemy, 0);
				}
				
				// Get the current cooldown
				let cooldown = shooterCooldowns.get(enemy) || 0;
				
				// Reduce cooldown based on delta time
				if (cooldown > 0) {
					cooldown -= delta;
					shooterCooldowns.set(enemy, cooldown);
				}
				
				// If within range and cooldown is ready, shoot at player
				if (distance <= SHOOTER_ENEMY.SHOOT_RANGE && cooldown <= 0) {
					// Create a projectile aiming at the player
					createEnemyProjectile(world, enemyX, enemyY, playerX, playerY);
					
					// Reset cooldown
					shooterCooldowns.set(enemy, SHOOTER_ENEMY.SHOOT_COOLDOWN);
				}
				
				// If too close to player, back away
				// If too far from player, approach
				const optimalDistance = SHOOTER_ENEMY.SHOOT_RANGE * 0.7;
				const moveAwayFactor = distance < optimalDistance ? -1 : 1;
				
				// Normalize and set velocity with backing away factor
				Velocity.x[enemy] = (dx / distance) * moveAwayFactor;
				Velocity.y[enemy] = (dy / distance) * moveAwayFactor;
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
