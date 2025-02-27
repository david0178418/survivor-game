import { Application } from 'pixi.js';
import type { GameState } from '../types';

/**
 * Sets up all input handlers for the game
 * @param gameState Reference to the game state to update
 * @param app PIXI Application instance (for window resize handling)
 */
export function setupInputHandlers(gameState: GameState, app: Application): void {
	// Keyboard handling
	window.addEventListener('keydown', (e: KeyboardEvent): void => {
		switch (e.key.toLowerCase()) {
			case 'w':
			case 'arrowup':
				gameState.input.up = true;
				break;
			case 's':
			case 'arrowdown':
				gameState.input.down = true;
				break;
			case 'a':
			case 'arrowleft':
				gameState.input.left = true;
				break;
			case 'd':
			case 'arrowright':
				gameState.input.right = true;
				break;
			case ' ': // Spacebar for shooting
				gameState.input.shoot = true;
				break;
			case 'p': // Add pause toggle
				gameState.paused = !gameState.paused;
				break;
		}
	});

	window.addEventListener('keyup', (e: KeyboardEvent): void => {
		switch (e.key.toLowerCase()) {
			case 'w':
			case 'arrowup':
				gameState.input.up = false;
				break;
			case 's':
			case 'arrowdown':
				gameState.input.down = false;
				break;
			case 'a':
			case 'arrowleft':
				gameState.input.left = false;
				break;
			case 'd':
			case 'arrowright':
				gameState.input.right = false;
				break;
			case ' ': // Spacebar for shooting
				gameState.input.shoot = false;
				break;
		}
	});

	// Handle window resize
	window.addEventListener('resize', (): void => {
		app.renderer.resize(window.innerWidth, window.innerHeight);
	});
}

/**
 * Process input for the current frame (currently just a stub)
 * This could be used for more complex input processing in the future
 *
 * @param gameState The game state to process input for
 * @returns The updated game state
 */
export function inputSystem(gameState: GameState): GameState {
	// For now, there's nothing more to do here as we directly update gameState
	// But in the future we could add more logic (like input buffering, combos, etc.)
	return gameState;
}
