import { defineQuery } from 'bitecs';
import { Position, Velocity, Player } from '../components';
import { Enemy } from '../entities/enemy';

// Define queries to get player and enemy entities
const playerQuery = defineQuery([Player, Position]);
const enemyQuery = defineQuery([Enemy, Position, Velocity]);

export function enemyAISystem(world: any, delta: number) {
  // Find the player entity
  const playerEntities = playerQuery(world);
  if (playerEntities.length === 0) {
    return world; // No player to target
  }
  
  // Get player position
  const playerId = playerEntities[0];
  const playerX = Position.x[playerId];
  const playerY = Position.y[playerId];
  
  // Get all enemies
  const enemies = enemyQuery(world);
  
  // Update each enemy's movement to target the player
  for (const enemy of enemies) {
    // Calculate direction to player
    const enemyX = Position.x[enemy];
    const enemyY = Position.y[enemy];
    
    // Vector from enemy to player
    const dx = playerX - enemyX;
    const dy = playerY - enemyY;
    
    // Normalize the direction vector
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      // Normalize and set velocity
      Velocity.x[enemy] = dx / distance;
      Velocity.y[enemy] = dy / distance;
    }
    
    // Apply velocity to position
    Position.x[enemy] += Velocity.x[enemy] * Velocity.speed[enemy] * delta;
    Position.y[enemy] += Velocity.y[enemy] * Velocity.speed[enemy] * delta;
  }
  
  return world;
} 