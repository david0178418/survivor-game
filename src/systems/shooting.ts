import { defineQuery, removeEntity } from 'bitecs';
import { Position, Player, Projectile, Velocity } from '../components';
import { Enemy } from '../entities/enemy';
import { createProjectile } from '../entities/projectile';

// Define queries to get player, enemy, and projectile entities
const playerQuery = defineQuery([Player, Position]);
const enemyQuery = defineQuery([Enemy, Position]);
const projectileQuery = defineQuery([Projectile, Position]);

// Track shooting cooldown
let shootCooldown = 0;
const SHOOT_COOLDOWN_TIME = 1_250; // 1s between shots

/**
 * System for handling projectile shooting and movement
 *
 * @param world The game world
 * @param delta Time since last frame in milliseconds
 * @returns The updated world
 */
export function shootingSystem(world: any, delta: number): any {
	// Update cooldown
	if (shootCooldown > 0) {
		shootCooldown -= delta;
	}

	// Process projectile movement and lifetime
	const projectiles = projectileQuery(world);
	for (const projectile of projectiles) {
		// Update lifetime
		Projectile.lifeTime[projectile] -= delta;

		// Remove projectiles that have expired
		if (Projectile.lifeTime[projectile] <= 0) {
			removeEntity(world, projectile);
		}

		// Move projectiles according to their velocity
		Position.x[projectile] += Velocity.x[projectile] * Velocity.speed[projectile] * delta;
		Position.y[projectile] += Velocity.y[projectile] * Velocity.speed[projectile] * delta;
	}

	// Only process shooting if the cooldown is ready (no longer require spacebar)
	if (shootCooldown > 0) {
		return world;
	}

	// Find the player entity
	const playerEntities = playerQuery(world);
	if (playerEntities.length === 0) {
		return world; // No player to shoot
	}

	// Get player position
	const playerId = playerEntities[0];
	const playerX = Position.x[playerId];
	const playerY = Position.y[playerId];

	// Get all enemies
	const enemies = enemyQuery(world);
	if (enemies.length === 0) {
		return world; // No enemies to target
	}

	// Find the closest enemy within range
	let closestEnemy = null;
	let closestDistance = 450; // Increased from 150px to 450px (3x)

	for (const enemy of enemies) {
		const enemyX = Position.x[enemy];
		const enemyY = Position.y[enemy];

		// Calculate distance to player
		const dx = enemyX - playerX;
		const dy = enemyY - playerY;
		const distance = Math.sqrt(dx * dx + dy * dy);

		// Check if this enemy is closer than the current closest
		if (distance <= closestDistance) {
			closestEnemy = enemy;
			closestDistance = distance;
		}
	}

	// If we found a close enough enemy, shoot a projectile at it
	if (closestEnemy !== null) {
		const targetX = Position.x[closestEnemy];
		const targetY = Position.y[closestEnemy];

		// Create a projectile
		createProjectile(world, playerX, playerY, targetX, targetY);

		// Set cooldown
		shootCooldown = SHOOT_COOLDOWN_TIME;
	}

	return world;
}
