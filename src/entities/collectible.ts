import { addEntity, addComponent } from 'bitecs';
import { Position, Render, Collectible } from '../components';

// Collectible types
export enum CollectibleType {
  HEALTH = 0,
  SPEED = 1,
  DAMAGE = 2
}

// Colors for different collectible types
const COLLECTIBLE_COLORS = {
  [CollectibleType.HEALTH]: 0xFFA500,   // Orange for health
  [CollectibleType.SPEED]: 0x00FFFF,    // Cyan for speed
  [CollectibleType.DAMAGE]: 0xFF00FF    // Magenta for damage boost
};

// Create a collectible at the given position with the given type
export function createCollectible(world: any, x: number, y: number, type: CollectibleType) {
  // Create a new entity
  const collectible = addEntity(world);

  // Add Position component
  addComponent(world, Position, collectible);
  Position.x[collectible] = x;
  Position.y[collectible] = y;

  // Add Collectible component
  addComponent(world, Collectible, collectible);
  Collectible.type[collectible] = type;

  // Set value based on type
  switch(type) {
    case CollectibleType.HEALTH:
      Collectible.value[collectible] = 2; // Heal 2 health
      break;
    case CollectibleType.SPEED:
      Collectible.value[collectible] = 0.1; // Increase speed by 0.1
      break;
    case CollectibleType.DAMAGE:
      Collectible.value[collectible] = 1; // Increase damage by 1
      break;
  }

  // Set lifetime for the collectible (10 seconds)
  Collectible.lifeTime[collectible] = 10000;

  // Add Render component
  addComponent(world, Render, collectible);
  Render.width[collectible] = 20;
  Render.height[collectible] = 20;
  Render.color[collectible] = COLLECTIBLE_COLORS[type];

  return collectible;
}

// Randomly pick a collectible type with weighted probabilities
export function getRandomCollectibleType(): CollectibleType {
  const rand = Math.random();

  if (rand < 0.6) {
    return CollectibleType.HEALTH; // 60% chance for health
  } else if (rand < 0.8) {
    return CollectibleType.SPEED; // 20% chance for speed
  } else {
    return CollectibleType.DAMAGE; // 20% chance for damage
  }
}
