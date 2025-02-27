import { defineQuery } from 'bitecs';
import { Position, Velocity, Player } from '../components';

// Define a query to get all entities with Position, Velocity, and Player components
const playerQuery = defineQuery([Position, Velocity, Player]);

export function movementSystem(world: any, gameState: any, delta: number) {
	// Get player entities
	const entities = playerQuery(world);

	// Process each player entity (should only be one in this simple game)
	for (const entity of entities) {
		// Reset velocity
		Velocity.x[entity] = 0;
		Velocity.y[entity] = 0;

		// Determine direction from input
		if (gameState.input.up) {
			Velocity.y[entity] -= 1;
		}
		if (gameState.input.down) {
			Velocity.y[entity] += 1;
		}
		if (gameState.input.left) {
			Velocity.x[entity] -= 1;
		}
		if (gameState.input.right) {
			Velocity.x[entity] += 1;
		}

		// Normalize velocity for diagonal movement
		const vx = Velocity.x[entity];
		const vy = Velocity.y[entity];

		if (vx !== 0 || vy !== 0) {
			const magnitude = Math.sqrt(vx * vx + vy * vy);

			// Only normalize if magnitude is not 0 (avoid division by zero)
			if (magnitude !== 0) {
				Velocity.x[entity] = vx / magnitude;
				Velocity.y[entity] = vy / magnitude;
			}
		}

		// Apply velocity to position
		Position.x[entity] += Velocity.x[entity] * Velocity.speed[entity] * delta;
		Position.y[entity] += Velocity.y[entity] * Velocity.speed[entity] * delta;
	}

	return world;
}
