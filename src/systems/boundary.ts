import { defineQuery, removeEntity } from 'bitecs';
import { Position, Player, Render, Projectile } from '../components';
import { Enemy } from '../entities/enemy';
import { getMapBoundaries } from './map';
import type { World, MapSize } from '../types';

// Define queries for entities that need boundary constraints
const playerQuery = defineQuery([Position, Player, Render]);
const enemyQuery = defineQuery([Position, Enemy, Render]);
const projectileQuery = defineQuery([Position, Projectile, Render]);

export function boundarySystem(world: World, mapSize: MapSize) {
	// Get the map boundaries
	const { minX, minY, maxX, maxY } = getMapBoundaries(mapSize);

	// Process all entities that need boundary constraints
	const processEntity = (entity: number, destroy: boolean = false) => {
		const width = Render.width[entity];
		const height = Render.height[entity];

		// Check if entity is outside boundaries
		const outsideX = Position.x[entity] < minX + width / 2 || Position.x[entity] > maxX - width / 2;
		const outsideY = Position.y[entity] < minY + height / 2 || Position.y[entity] > maxY - height / 2;

		if (destroy && (outsideX || outsideY)) {
		// Destroy entities that should be removed when hitting boundaries
			removeEntity(world, entity);
			return;
		}

		// Constrain entity position to stay within map boundaries
		// Account for entity size
		if (Position.x[entity] < minX + width / 2) {
			Position.x[entity] = minX + width / 2;
		} else if (Position.x[entity] > maxX - width / 2) {
			Position.x[entity] = maxX - width / 2;
		}

		if (Position.y[entity] < minY + height / 2) {
			Position.y[entity] = minY + height / 2;
		} else if (Position.y[entity] > maxY - height / 2) {
			Position.y[entity] = maxY - height / 2;
		}
	};

	// Apply to player entities
	const players = playerQuery(world);
	for (const entity of players) {
		processEntity(entity);
	}

	// Apply to enemy entities
	const enemies = enemyQuery(world);
	for (const entity of enemies) {
		processEntity(entity);
	}

	// For projectiles, destroy them if they hit the boundaries
	const projectiles = projectileQuery(world);
	for (const entity of projectiles) {
		processEntity(entity, true);
	}

	return world;
}
