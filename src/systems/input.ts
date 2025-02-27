import { Application } from 'pixi.js';
import type { GameState } from '../types';

/**
 * Set up input event handlers for the game
 */
export function setupInputHandlers(gameState: GameState, app: Application) {
	// Handle keydown events
	window.addEventListener('keydown', (event) => {
		switch (event.key.toLowerCase()) {
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

	// Handle keyup events
	window.addEventListener('keyup', (event) => {
		switch (event.key.toLowerCase()) {
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

	// Handle mouse move events
	window.addEventListener('mousemove', (event) => {
		gameState.input.mouseX = event.clientX;
		gameState.input.mouseY = event.clientY;
	});

	// Handle window resize
	window.addEventListener('resize', (): void => {
		app.renderer.resize(window.innerWidth, window.innerHeight);
	});
}
