import { addEntity, addComponent } from 'bitecs';
import { Position, Velocity, Render, Projectile, Damage } from '../components';
import { getPlayerDamageBoost } from '../systems/collectible';

export function createProjectile(world: any, startX: number, startY: number, targetX: number, targetY: number) {
	// Create a new entity
	const projectile = addEntity(world);

	// Add Position component (start at player position)
	addComponent(world, Position, projectile);
	Position.x[projectile] = startX;
	Position.y[projectile] = startY;

	// Calculate direction to target
	const dx = targetX - startX;
	const dy = targetY - startY;
	const distance = Math.sqrt(dx * dx + dy * dy);

	// Add Velocity component
	addComponent(world, Velocity, projectile);
	if (distance > 0) {
		Velocity.x[projectile] = dx / distance;
		Velocity.y[projectile] = dy / distance;
	} else {
		// If for some reason the target is at the same position, shoot right
		Velocity.x[projectile] = 1;
		Velocity.y[projectile] = 0;
	}
	Velocity.speed[projectile] = 1.0; // Faster than player

	// Add Projectile component
	addComponent(world, Projectile, projectile);
	Projectile.targetX[projectile] = targetX;
	Projectile.targetY[projectile] = targetY;
	Projectile.lifeTime[projectile] = 2000; // 2 seconds max life time

	// Add Render component
	addComponent(world, Render, projectile);
	Render.width[projectile] = 15;
	Render.height[projectile] = 15;
	Render.color[projectile] = 0x0000FF; // Blue square for projectiles

	// Add Damage component - projectiles deal 1 damage + player's damage boost
	addComponent(world, Damage, projectile);
	Damage.amount[projectile] = 1 + Math.floor(getPlayerDamageBoost());

	return projectile;
}

/**
 * Creates an enemy projectile that travels toward the target
 * 
 * @param world The game world
 * @param startX Starting X position
 * @param startY Starting Y position
 * @param targetX Target X position
 * @param targetY Target Y position
 * @returns The projectile entity ID
 */
export function createEnemyProjectile(world: any, startX: number, startY: number, targetX: number, targetY: number) {
	// Create a new entity
	const projectile = addEntity(world);

	// Add Position component (start at enemy position)
	addComponent(world, Position, projectile);
	Position.x[projectile] = startX;
	Position.y[projectile] = startY;

	// Calculate direction to target
	const dx = targetX - startX;
	const dy = targetY - startY;
	const distance = Math.sqrt(dx * dx + dy * dy);

	// Add Velocity component
	addComponent(world, Velocity, projectile);
	if (distance > 0) {
		Velocity.x[projectile] = dx / distance;
		Velocity.y[projectile] = dy / distance;
	} else {
		// If for some reason the target is at the same position, shoot in a random direction
		const randomAngle = Math.random() * Math.PI * 2;
		Velocity.x[projectile] = Math.cos(randomAngle);
		Velocity.y[projectile] = Math.sin(randomAngle);
	}
	Velocity.speed[projectile] = 0.6; // Slower than player projectiles

	// Add Projectile component
	addComponent(world, Projectile, projectile);
	Projectile.targetX[projectile] = targetX;
	Projectile.targetY[projectile] = targetY;
	Projectile.lifeTime[projectile] = 3000; // 3 seconds max life time (longer than player projectiles)

	// Add Render component
	addComponent(world, Render, projectile);
	Render.width[projectile] = 12;
	Render.height[projectile] = 12;
	Render.color[projectile] = 0xFF6600; // Orange projectile to distinguish from player's blue ones

	// Add Damage component
	addComponent(world, Damage, projectile);
	Damage.amount[projectile] = 1; // Enemy projectiles always do 1 damage

	return projectile;
}
