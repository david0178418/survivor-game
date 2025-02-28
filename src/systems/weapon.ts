import { defineQuery, removeEntity, defineSystem } from 'bitecs';
import { Position, Player, Projectile, Sword, Experience, Velocity } from '../components';
import { Enemy } from '../entities/enemy';
import { createProjectile } from '../entities/projectile';
import { createSword } from '../weapons/sword';
import { WeaponType, WEAPON_LEVEL_REQUIREMENTS, WEAPONS } from '../constants';
import type { World } from '../types';

// Define queries for entities
const playerQuery = defineQuery([Player, Position, Experience]);
const enemyQuery = defineQuery([Enemy, Position]);
const projectileQuery = defineQuery([Projectile, Position, Velocity]);
const swordQuery = defineQuery([Sword, Position]);

// Track weapon cooldowns
let projectileCooldown = 0;
let swordCooldown = 0;

// Debugging - track last logged player level
let lastLoggedLevel = 0;

/**
 * Gets the available weapons at the current player level
 * 
 * @param playerLevel Current player level
 * @returns Array of weapon types available at this level
 */
function getAvailableWeapons(playerLevel: number): WeaponType[] {
	return Object.values(WeaponType)
		.filter(type => typeof type === 'number')
		.filter(type => playerLevel >= WEAPON_LEVEL_REQUIREMENTS[type as WeaponType]) as WeaponType[];
}

/**
 * Weapon system handles creating and managing weapon entities
 * 
 * @param world The ECS world
 * @param delta Time since last frame in milliseconds
 * @returns The updated world
 */
export const weaponSystem = defineSystem((world: World, { delta }: { delta: number }) => {
	// Update cooldowns
	if (projectileCooldown > 0) {
		projectileCooldown -= delta;
	}
	if (swordCooldown > 0) {
		swordCooldown -= delta;
	}

	// Find the player entity first (we need it for swords)
	const playerEntities = playerQuery(world);
	if (playerEntities.length === 0) {
		return world; // No player found
	}

	// Get player position and level
	const playerId = playerEntities[0];
	const playerX = Position.x[playerId];
	const playerY = Position.y[playerId];
	const playerLevel = Experience.level[playerId];

	// Debug: Log player level when it changes
	if (playerLevel !== lastLoggedLevel) {
		console.log('Player reached level:', playerLevel);
		console.log('Available weapons:', getAvailableWeapons(playerLevel).map(w => WeaponType[w]));
		lastLoggedLevel = playerLevel;
	}

	// Process projectile lifetime and movement
	const projectiles = projectileQuery(world);
	for (const projectile of projectiles) {
		// Update lifetime
		Projectile.lifeTime[projectile] -= delta;

		// Remove projectiles that have expired
		if (Projectile.lifeTime[projectile] <= 0) {
			removeEntity(world, projectile);
			continue; // Skip further processing for removed entities
		}

		// Move projectiles according to their velocity
		Position.x[projectile] += Velocity.x[projectile] * Velocity.speed[projectile] * delta;
		Position.y[projectile] += Velocity.y[projectile] * Velocity.speed[projectile] * delta;
	}

	// Process sword swings
	const swords = swordQuery(world);
	if (swords.length > 0) {
		// Debug: Log active swords count
		console.log(`Active swords: ${swords.length}`);
	}
	
	for (const sword of swords) {
		// Update sword position and angle for swing animation
		if (Sword.active[sword] === 1) {
			// Update lifetime
			Sword.lifeTime[sword] -= delta;
			
			// Update angle based on swing speed
			Sword.angle[sword] += Sword.swingSpeed[sword] * delta * 0.05;
			
			// Update sword position to match player position (sword follows the player)
			Position.x[sword] = playerX;
			Position.y[sword] = playerY;
			
			// Get the initial angle minus half the swing arc
			const startAngle = Sword.angle[sword] - (Sword.swingArc[sword] / 2);
			const maxAngle = startAngle + Sword.swingArc[sword];
			
			// Check if the swing is complete
			if (Sword.lifeTime[sword] <= 0 || Sword.angle[sword] >= maxAngle) {
				// Debug: Log sword removal
				console.log('Removing sword:', sword, 'Lifetime:', Sword.lifeTime[sword], 'Angle:', Sword.angle[sword], 'Max:', maxAngle);
				removeEntity(world, sword);
			}
		}
	}

	// Get available weapons for this player level
	const availableWeapons = getAvailableWeapons(playerLevel);

	// Get all enemies
	const enemies = enemyQuery(world);
	if (enemies.length === 0) {
		return world; // No enemies to target
	}

	// Find the closest enemy
	let closestEnemy = null;
	let closestDistance = 450; // Using projectile range as default max distance

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

	// If we found a close enough enemy, attack with the appropriate weapon
	if (closestEnemy !== null) {
		const targetX = Position.x[closestEnemy];
		const targetY = Position.y[closestEnemy];
		
		// Use sword if available and in range and off cooldown
		if (
			availableWeapons.includes(WeaponType.SWORD) && 
			swordCooldown <= 0 && 
			closestDistance <= WEAPONS[WeaponType.SWORD].RANGE
		) {
				// Debug: Log sword creation
				console.log('Attempting to create sword, distance to enemy:', closestDistance);
			
			// Create a sword swing
			createSword(world, playerX, playerY, targetX, targetY);
			
			// Set cooldown
			swordCooldown = WEAPONS[WeaponType.SWORD].COOLDOWN;
		} 
		// Otherwise use projectile if off cooldown
		else if (projectileCooldown <= 0) {
			// Create a projectile
			createProjectile(world, playerX, playerY, targetX, targetY);
			
			// Set cooldown
			projectileCooldown = WEAPONS[WeaponType.PROJECTILE].COOLDOWN;
		}
	}

	return world;
});