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

/**
 * Create a collectible at the given position with the given type
 *
 * @param world The game world
 * @param x The x position
 * @param y The y position
 * @param type The collectible type
 * @param isLarge Whether this is a large collectible (grants more XP)
 * @returns The collectible entity ID
 */
export function createCollectible(world: any, x: number, y: number, type: CollectibleType, isLarge: boolean = false) {
	// Create a new entity
	const collectible = addEntity(world);

	// Add Position component
	addComponent(world, Position, collectible);
	Position.x[collectible] = x;
	Position.y[collectible] = y;

	// Add Collectible component
	addComponent(world, Collectible, collectible);
	Collectible.type[collectible] = type;
	Collectible.isLarge[collectible] = isLarge ? 1 : 0;

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
	Collectible.lifeTime[collectible] = COLLECTIBLE.LIFETIME;

	// Add Render component
	addComponent(world, Render, collectible);

	// Set size based on whether it's a large collectible
	const radius = isLarge ? COLLECTIBLE.LARGE_RADIUS : COLLECTIBLE.RADIUS;
	Render.width[collectible] = radius * 2;
	Render.height[collectible] = radius * 2;

	// Set color based on type
	switch(type) {
		case CollectibleType.HEALTH:
			Render.color[collectible] = COLLECTIBLE.HEALTH_COLOR;
			break;
		case CollectibleType.SPEED:
			Render.color[collectible] = COLLECTIBLE.SPEED_COLOR;
			break;
		case CollectibleType.DAMAGE:
			Render.color[collectible] = COLLECTIBLE.DAMAGE_COLOR;
			break;
		case CollectibleType.RANGE:
			Render.color[collectible] = COLLECTIBLE.PICKUP_COLOR;
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

/**
 * Returns whether a collectible should be large (5 XP) or small (1 XP)
 * Base chance is 20%, but increases with player level
 *
 * @param playerLevel The current player level
 * @returns true if the collectible should be large
 */
export function shouldBeLargeCollectible(playerLevel: number = 0): boolean {
	// Base chance of 20%, but increases by 2% per player level, capped at 60%
	const baseChance = 0.2;
	const levelBonus = Math.min(0.4, playerLevel * 0.02); // Cap at 40% bonus (total 60%)
	return Math.random() < (baseChance + levelBonus);
}
