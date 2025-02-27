import { defineQuery, hasComponent } from 'bitecs';
import { Position, Render, Invincible, Player } from '../components';
import { Application, Graphics } from 'pixi.js';

// Define a query to get all renderable entities
const renderQuery = defineQuery([Position, Render]);

// Map to store graphics for entities
const entityGraphics = new Map();

export function renderSystem(world: any, app: Application) {
	// Get entities to render
	const entities = renderQuery(world);

	// Process each entity
	for (const entity of entities) {
		// Get the entity position and render properties
		const x = Position.x[entity];
		const y = Position.y[entity];
		const width = Render.width[entity];
		const height = Render.height[entity];
		const color = Render.color[entity];

		// Check if we already have a graphic for this entity
		let graphic = entityGraphics.get(entity);

		// If not, create a new one
		if (!graphic) {
			graphic = new Graphics();
			app.stage.addChild(graphic);
			entityGraphics.set(entity, graphic);
		}

		// Update the graphic
		graphic.clear();

		// Set alpha based on invincibility (if entity is a player)
		if (hasComponent(world, Player, entity) && hasComponent(world, Invincible, entity)) {
			graphic.alpha = Invincible.duration[entity] > 0 ? 0.5 : 1.0;
		} else {
			graphic.alpha = 1.0;
		}

		graphic.beginFill(color);
		graphic.drawRect(-width / 2, -height / 2, width, height);
		graphic.endFill();

		// Set position
		graphic.x = x;
		graphic.y = y;
	}

	// Clean up removed entities
	for (const [entityId, graphic] of entityGraphics.entries()) {
		if (!entities.includes(entityId)) {
			app.stage.removeChild(graphic);
			entityGraphics.delete(entityId);
		}
	}

	return world;
}
