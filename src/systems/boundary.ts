import { defineQuery, removeEntity, defineSystem } from 'bitecs';
import { Position, Player, Render, Projectile } from '../components';
import { Enemy } from '../entities/enemy';
import { getMapBoundaries } from './map';
import type { World, MapSize } from '../types';

// Define queries for entities that need boundary constraints
const playerQuery = defineQuery([Position, Player, Render]);
const enemyQuery = defineQuery([Position, Enemy, Render]);
const projectileQuery = defineQuery([Position, Projectile, Render]);

/**
 * System for handling entity boundary constraints
 */
export const boundarySystem = defineSystem((world: World, { mapSize }: { mapSize: MapSize }): World => {
	// Get the map boundaries
	const { minX, minY, maxX, maxY } = getMapBoundaries(mapSize);

	// Process player entities (constrain to boundaries)
	const players = playerQuery(world);
	for (const entity of players) {
		const width = Render.width[entity];
		const height = Render.height[entity];

		// Constrain position within boundaries
		if (Position.x[entity] < minX + width / 2) {
			Position.x[entity] = minX + width / 2;
		}
		if (Position.x[entity] > maxX - width / 2) {
			Position.x[entity] = maxX - width / 2;
		}
		if (Position.y[entity] < minY + height / 2) {
			Position.y[entity] = minY + height / 2;
		}
		if (Position.y[entity] > maxY - height / 2) {
			Position.y[entity] = maxY - height / 2;
		}
	}

	// Process enemy entities (constrain to boundaries)
	const enemies = enemyQuery(world);
	for (const entity of enemies) {
		const width = Render.width[entity];
		const height = Render.height[entity];

		// Constrain position within boundaries
		if (Position.x[entity] < minX + width / 2) {
			Position.x[entity] = minX + width / 2;
		}
		if (Position.x[entity] > maxX - width / 2) {
			Position.x[entity] = maxX - width / 2;
		}
		if (Position.y[entity] < minY + height / 2) {
			Position.y[entity] = minY + height / 2;
		}
		if (Position.y[entity] > maxY - height / 2) {
			Position.y[entity] = maxY - height / 2;
		}
	}

	// Process projectile entities (destroy if out of bounds)
	const projectiles = projectileQuery(world);
	for (const entity of projectiles) {
		const width = Render.width[entity];
		const height = Render.height[entity];

		// Check if projectile is out of bounds
		if (Position.x[entity] < minX + width / 2 ||
			Position.x[entity] > maxX - width / 2 ||
			Position.y[entity] < minY + height / 2 ||
			Position.y[entity] > maxY - height / 2) {
			removeEntity(world, entity);
		}
	}

	return world;
});
