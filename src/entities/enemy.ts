import { addEntity, addComponent, defineComponent } from 'bitecs';
import { Position, Velocity, Render, Health, Damage } from '../components';
import { ENEMY_SCALING } from '../constants';

// Create a new Enemy component
export const Enemy = defineComponent();

/**
 * Creates an enemy entity with stats scaled to player level
 *
 * @param world The game world
 * @param playerX Player's X position
 * @param playerY Player's Y position
 * @param playerLevel Current player level (0 is default if not provided)
 * @returns The enemy entity ID
 */
export function createEnemy(world: any, playerX: number, playerY: number, playerLevel: number = 0) {
	// Create a new entity
	const enemy = addEntity(world);

	// Add Position component (start at a random position away from player)
	addComponent(world, Position, enemy);

	// Random position between 500-800 pixels away from player
	const distance = 500 + Math.random() * 300;
	const angle = Math.random() * Math.PI * 2; // Random angle

	Position.x[enemy] = playerX + Math.cos(angle) * distance;
	Position.y[enemy] = playerY + Math.sin(angle) * distance;

	// Calculate level scaling factors
	const healthScaling = 1 + (playerLevel * ENEMY_SCALING.HEALTH_SCALING);
	const damageScaling = 1 + (playerLevel * ENEMY_SCALING.DAMAGE_SCALING);
	const speedScaling = 1 + (playerLevel * ENEMY_SCALING.SPEED_SCALING);

	// Add Velocity component with level-based scaling
	addComponent(world, Velocity, enemy);
	Velocity.x[enemy] = 0;
	Velocity.y[enemy] = 0;
	Velocity.speed[enemy] = 0.1 * speedScaling; // Speed decreased by half (was 0.2)

	// Add Enemy marker component
	addComponent(world, Enemy, enemy);

	// Add Render component
	addComponent(world, Render, enemy);
	Render.width[enemy] = 30;
	Render.height[enemy] = 30;

	// Color based on enemy strength (stronger enemies are more red)
	const strengthFactor = Math.min(1, (healthScaling - 1) / 5);  // Cap at 500% health
	const green = Math.floor(0xFF * (1 - strengthFactor));
	Render.color[enemy] = (0xFF << 16) | (green << 8); // Mix of red and green

	// Add Health component with level-based scaling
	addComponent(world, Health, enemy);
	const baseHealth = 2;
	const scaledHealth = Math.ceil(baseHealth * healthScaling);
	Health.current[enemy] = scaledHealth;
	Health.max[enemy] = scaledHealth;

	// Add Damage component with level-based scaling
	addComponent(world, Damage, enemy);
	const baseDamage = 2;
	const scaledDamage = Math.ceil(baseDamage * damageScaling);
	Damage.amount[enemy] = scaledDamage;

	return enemy;
}
