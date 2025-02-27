import { defineQuery, hasComponent, defineSystem } from 'bitecs';
import { Position, Render, Invincible, Player } from '../components';
import { Application, Container, Graphics } from 'pixi.js';

// Define a query to get all renderable entities
const renderQuery = defineQuery([Position, Render]);

// Map to store graphics for entities
const entityGraphics = new Map();

export const renderSystem = defineSystem((world: any, { app }: { app: Application & { stage: Container } }): any => {
	// Get all entities with Position and Render components
	const entities = renderQuery(world);

	// Process each entity
	for (const entity of entities) {
		// Get or create graphics for this entity
		let graphics = entityGraphics.get(entity);
		if (!graphics) {
			graphics = new Graphics();
			entityGraphics.set(entity, graphics);
			app.stage.addChild(graphics);
		}

		// Clear previous graphics
		graphics.clear();

		// Check if entity is a player and is invincible
		const isInvincible = hasComponent(world, Player, entity) && 
							hasComponent(world, Invincible, entity) && 
							Invincible.duration[entity] > 0;

		// Draw the entity
		graphics.beginFill(Render.color[entity], isInvincible ? 0.5 : 1);
		graphics.drawRect(
			Position.x[entity] - Render.width[entity] / 2,
			Position.y[entity] - Render.height[entity] / 2,
			Render.width[entity],
			Render.height[entity]
		);
		graphics.endFill();
	}

	// Clean up graphics for removed entities
	for (const [entityId, graphics] of entityGraphics.entries()) {
		if (!entities.includes(entityId)) {
			app.stage.removeChild(graphics);
			entityGraphics.delete(entityId);
		}
	}

	return world;
});
