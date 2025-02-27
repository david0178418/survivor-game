import { Application, Graphics } from 'pixi.js';
import { MAP } from '../constants';
import type { World, MapSize } from '../types';

/**
 * Creates boundary walls around the map
 *
 * @param world The ECS world
 * @param app The PIXI Application
 * @param mapSize The size of the map
 * @returns The container with wall graphics
 */
export function createBoundaries(world: World, app: Application, mapSize: MapSize) {
	const { width, height } = mapSize;
	const wallThickness = MAP.WALL_THICKNESS;

	// Create the container for all walls
	const wallsContainer = new Graphics();
	app.stage.addChild(wallsContainer);

	wallsContainer.beginFill(0x000000); // Black walls

	// Top wall
	wallsContainer.drawRect(0, 0, width, wallThickness);

	// Bottom wall
	wallsContainer.drawRect(0, height - wallThickness, width, wallThickness);

	// Left wall
	wallsContainer.drawRect(0, 0, wallThickness, height);

	// Right wall
	wallsContainer.drawRect(width - wallThickness, 0, wallThickness, height);

	wallsContainer.endFill();

	return wallsContainer;
}

/**
 * Gets the map boundaries as an object with min/max values
 *
 * @param mapSize The size of the map
 * @returns The map boundaries
 */
export function getMapBoundaries(mapSize: MapSize) {
	return {
		minX: MAP.WALL_THICKNESS,
		minY: MAP.WALL_THICKNESS,
		maxX: mapSize.width - MAP.WALL_THICKNESS,
		maxY: mapSize.height - MAP.WALL_THICKNESS
	};
}
