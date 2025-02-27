import { addEntity, addComponent, defineComponent } from 'bitecs';
import { Position, Velocity, Render, Health, Damage } from '../components';

// Create a new Enemy component
export const Enemy = defineComponent();

export function createEnemy(world: any, playerX: number, playerY: number) {
	// Create a new entity
	const enemy = addEntity(world);

	// Add Position component (start at a random position away from player)
	addComponent(world, Position, enemy);

	// Random position between 500-800 pixels away from player
	const distance = 500 + Math.random() * 300;
	const angle = Math.random() * Math.PI * 2; // Random angle

	Position.x[enemy] = playerX + Math.cos(angle) * distance;
	Position.y[enemy] = playerY + Math.sin(angle) * distance;

	// Add Velocity component
	addComponent(world, Velocity, enemy);
	Velocity.x[enemy] = 0;
	Velocity.y[enemy] = 0;
	Velocity.speed[enemy] = 0.2; // Slower than player

	// Add Enemy marker component
	addComponent(world, Enemy, enemy);

	// Add Render component
	addComponent(world, Render, enemy);
	Render.width[enemy] = 30;
	Render.height[enemy] = 30;
	Render.color[enemy] = 0x00FF00; // Green squares for enemies

	// Add Health component
	addComponent(world, Health, enemy);
	Health.current[enemy] = 2;
	Health.max[enemy] = 2;

	// Add Damage component - enemies deal 2 damage on contact
	addComponent(world, Damage, enemy);
	Damage.amount[enemy] = 2;

	return enemy;
}
