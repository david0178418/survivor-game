import { defineQuery } from 'bitecs';
import { Position, Player, Render } from '../components';

// Define a query to get player entities with position
const playerQuery = defineQuery([Position, Player, Render]);

export function boundarySystem(world: any, mapSize: { width: number, height: number }) {
  // Get player entities
  const entities = playerQuery(world);
  
  // Set up the wall boundaries (including wall thickness)
  const wallThickness = 20;
  const minX = wallThickness;
  const minY = wallThickness;
  const maxX = mapSize.width - wallThickness;
  const maxY = mapSize.height - wallThickness;
  
  // Process each entity
  for (const entity of entities) {
    const width = Render.width[entity];
    const height = Render.height[entity];
    
    // Constrain player position to stay within map boundaries
    // Account for entity size to prevent the player from going into the walls
    if (Position.x[entity] < minX + width / 2) {
      Position.x[entity] = minX + width / 2;
    } else if (Position.x[entity] > maxX - width / 2) {
      Position.x[entity] = maxX - width / 2;
    }
    
    if (Position.y[entity] < minY + height / 2) {
      Position.y[entity] = minY + height / 2;
    } else if (Position.y[entity] > maxY - height / 2) {
      Position.y[entity] = maxY - height / 2;
    }
  }
  
  return world;
} 