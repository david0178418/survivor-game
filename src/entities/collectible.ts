import { addEntity, addComponent } from 'bitecs';
import { Position, Render, Collectible } from '../components';
import { COLLECTIBLE } from '../constants';

// Collectible types
export enum CollectibleType {
	HEALTH = 0,
	SPEED = 1,
	DAMAGE = 2,
	RANGE = 3
}

// Create a collectible at the given position with the given type
export function createCollectible(world: any, x: number, y: number, type: CollectibleType) {
	// Create a new entity
	const collectible = addEntity(world);

	// Add Position component
	addComponent(world, Position, collectible);
	Position.x[collectible] = x;
	Position.y[collectible] = y;

	// Add Collectible component
	addComponent(world, Collectible, collectible);
	Collectible.type[collectible] = type;

	// Set value based on type
	switch(type) {
		case CollectibleType.HEALTH:
			Collectible.value[collectible] = COLLECTIBLE.VALUES.HEALTH;
			break;
		case CollectibleType.SPEED:
			Collectible.value[collectible] = COLLECTIBLE.VALUES.SPEED;
			break;
		case CollectibleType.DAMAGE:
			Collectible.value[collectible] = COLLECTIBLE.VALUES.DAMAGE;
			break;
		case CollectibleType.RANGE:
			Collectible.value[collectible] = COLLECTIBLE.VALUES.RANGE;
			break;
	}

	// Set lifetime for the collectible
	Collectible.lifeTime[collectible] = COLLECTIBLE.LIFETIME_MS;

	// Add Render component
	addComponent(world, Render, collectible);
	Render.width[collectible] = COLLECTIBLE.WIDTH;
	Render.height[collectible] = COLLECTIBLE.HEIGHT;

	// Set color based on type
	switch(type) {
		case CollectibleType.HEALTH:
			Render.color[collectible] = COLLECTIBLE.COLORS.HEALTH;
			break;
		case CollectibleType.SPEED:
			Render.color[collectible] = COLLECTIBLE.COLORS.SPEED;
			break;
		case CollectibleType.DAMAGE:
			Render.color[collectible] = COLLECTIBLE.COLORS.DAMAGE;
			break;
		case CollectibleType.RANGE:
			Render.color[collectible] = COLLECTIBLE.COLORS.RANGE;
			break;
	}

	return collectible;
}

// Randomly pick a collectible type with weighted probabilities
export function getRandomCollectibleType(): CollectibleType {
	const rand = Math.random();
	const { SPAWN_CHANCE } = COLLECTIBLE;

	if (rand < SPAWN_CHANCE.HEALTH) {
		return CollectibleType.HEALTH;
	} else if (rand < SPAWN_CHANCE.HEALTH + SPAWN_CHANCE.SPEED) {
		return CollectibleType.SPEED;
	} else if (rand < SPAWN_CHANCE.HEALTH + SPAWN_CHANCE.SPEED + SPAWN_CHANCE.DAMAGE) {
		return CollectibleType.DAMAGE;
	} else {
		return CollectibleType.RANGE;
	}
}
