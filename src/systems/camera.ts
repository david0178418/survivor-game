import { defineQuery, defineSystem } from 'bitecs';
import { Position, CameraTarget } from '../components';
import { Application, Container } from 'pixi.js';
import type { GameState } from '../types';

// Define a query to get entities that the camera should follow
const cameraTargetQuery = defineQuery([Position, CameraTarget]);

export const cameraSystem = defineSystem((world: any, { gameState, app, gameStage }: { gameState: GameState; app: Application; gameStage: Container }): any => {
	// Get camera target entities
	const entities = cameraTargetQuery(world);

	if (entities.length === 0) return world;

	// Get the first camera target (usually the player)
	const entity = entities[0];

	// Get the position of the entity
	const targetX = Position.x[entity];
	const targetY = Position.y[entity];

	// Get screen center
	const screenCenterX = app.screen.width / 2;
	const screenCenterY = app.screen.height / 2;

	// Get the dead zone radius (the "give" in the camera)
	const deadZoneRadius = CameraTarget.deadZoneRadius[entity];

	// Calculate distance from target to camera
	const dx = targetX - (gameState.camera.x + screenCenterX);
	const dy = targetY - (gameState.camera.y + screenCenterY);
	const distance = Math.sqrt(dx * dx + dy * dy);

	// Only move camera if target is outside dead zone
	if (distance > deadZoneRadius) {
		// Calculate how far outside the dead zone the target is
		const excess = distance - deadZoneRadius;
		const angle = Math.atan2(dy, dx);

		// Move camera toward target
		gameState.camera.x += Math.cos(angle) * excess;
		gameState.camera.y += Math.sin(angle) * excess;
	}

	// Update game stage position for camera movement
	gameStage.position.set(-gameState.camera.x, -gameState.camera.y);

	return world;
});
