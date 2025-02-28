import { defineQuery, hasComponent, defineSystem } from 'bitecs';
import { Position, Render, Invincible, Player, Sword } from '../components';
import { Application, Container, Graphics } from 'pixi.js';

// Define a query to get all renderable entities
const renderQuery = defineQuery([Position, Render]);
const swordQuery = defineQuery([Sword, Position, Render]);

// Map to store graphics for entities
const entityGraphics = new Map();

export const renderSystem = defineSystem((world: any, { app }: { app: Application & { stage: Container } }): any => {
	// Get all entities with Position and Render components
	const entities = renderQuery(world);
	const swords = swordQuery(world);
	
	// Process each entity
	for (const entity of entities) {
		// Skip rendering of sword entities here (they're handled specially below)
		if (hasComponent(world, Sword, entity)) {
			continue;
		}
		
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
	
	// Process sword entities with enhanced rendering
	for (const sword of swords) {
		// Get or create graphics for this sword
		let graphics = entityGraphics.get(sword);
		if (!graphics) {
			graphics = new Graphics();
			entityGraphics.set(sword, graphics); // Fixed: was incorrectly using 'entity' instead of 'sword'
			app.stage.addChild(graphics);
		}
		
		// Clear previous graphics
		graphics.clear();
		
		// Only render active swords
		if (Sword.active[sword] !== 1) {
			continue;
		}
		
		const swordX = Position.x[sword];
		const swordY = Position.y[sword];
		const swordWidth = Render.width[sword];
		const swordHeight = Render.height[sword];
		const swordAngle = Sword.angle[sword];
		const swordColor = Render.color[sword];
		
		 // Enhanced sword rendering
		// Draw the sword blade
		graphics.lineStyle(swordHeight, swordColor, 1);
		
		// Calculate the endpoint of the sword based on its angle
		const endX = swordX + Math.cos(swordAngle) * swordWidth;
		const endY = swordY + Math.sin(swordAngle) * swordWidth;
		
		// Draw the sword blade line
		graphics.moveTo(swordX, swordY);
		graphics.lineTo(endX, endY);
		
		// Draw a highlight at the sword's tip
		graphics.beginFill(0xFFFFFF, 0.8);
		graphics.drawCircle(endX, endY, swordHeight / 1.5);
		graphics.endFill();
		
		// Draw a hilt/guard at the base of the sword
		graphics.beginFill(0x8B4513); // Brown color for the hilt
		graphics.drawCircle(swordX, swordY, swordHeight * 1.2);
		graphics.endFill();
	}
	
	// Clean up graphics for removed entities
	for (const [entityId, graphics] of entityGraphics.entries()) {
		if (!entities.includes(entityId) && !swords.includes(entityId)) {
			app.stage.removeChild(graphics);
			entityGraphics.delete(entityId);
		}
	}
	
	return world;
});
