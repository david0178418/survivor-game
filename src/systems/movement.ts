import { defineQuery, defineSystem } from 'bitecs';
import { Position, Velocity, Player } from '../components';
import type { GameState } from '../types';

// Define a query to get all entities with Position, Velocity, and Player components
const playerQuery = defineQuery([Position, Velocity, Player]);

// Create the movement system
export const movementSystem = defineSystem((world: any, { gameState, delta }: { gameState: GameState; delta: number }): any => {
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

		// Normalize diagonal movement
		const vx = Velocity.x[entity];
		const vy = Velocity.y[entity];
		const magnitude = Math.sqrt(vx * vx + vy * vy);

		// Only normalize if magnitude is not 0 (avoid division by zero)
		if (magnitude !== 0) {
			Velocity.x[entity] = vx / magnitude;
			Velocity.y[entity] = vy / magnitude;
		}

		// Apply velocity to position
		Position.x[entity] += Velocity.x[entity] * Velocity.speed[entity] * delta;
		Position.y[entity] += Velocity.y[entity] * Velocity.speed[entity] * delta;
	}

	return world;
});
