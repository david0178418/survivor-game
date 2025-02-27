import { Container, Graphics } from 'pixi.js';
import { MAP } from '../constants';
import type { MapSize } from '../types';

/**
 * Map boundary description
 */
export interface MapBoundaries {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

/**
 * Creates boundary walls around the map
 * @param gameStage The game stage to add walls to
 * @param mapSize The size of the map
 */
export function createBoundaries(gameStage: Container, mapSize: MapSize) {
	const { width, height } = mapSize;
	const wallThickness = MAP.WALL_THICKNESS;

	// Create the container for all walls
	const wallsContainer = new Graphics();
	wallsContainer.beginFill(MAP.WALL_COLOR);

	// Draw walls
	// Top wall
	wallsContainer.drawRect(0, 0, width, wallThickness);
	// Bottom wall
	wallsContainer.drawRect(0, height - wallThickness, width, wallThickness);
	// Left wall
	wallsContainer.drawRect(0, 0, wallThickness, height);
	// Right wall
	wallsContainer.drawRect(width - wallThickness, 0, wallThickness, height);

	wallsContainer.endFill();

	// Add walls to game stage
	gameStage.addChild(wallsContainer);
}

/**
 * Gets the map boundaries as an object with min/max values
 *
 * @param mapSize The size of the map
 * @returns The map boundaries
 */
export function getMapBoundaries(mapSize: MapSize): MapBoundaries {
	return {
		minX: MAP.WALL_THICKNESS,
		minY: MAP.WALL_THICKNESS,
		maxX: mapSize.width - MAP.WALL_THICKNESS,
		maxY: mapSize.height - MAP.WALL_THICKNESS
	};
}
