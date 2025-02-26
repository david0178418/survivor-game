import { defineQuery, removeEntity } from 'bitecs';
import { Position, Render, Projectile } from '../components';
import { Enemy } from '../entities/enemy';

// Define queries for collision detection
const projectileQuery = defineQuery([Projectile, Position, Render]);
const enemyQuery = defineQuery([Enemy, Position, Render]);

export function collisionSystem(world: any) {
  // Get all projectiles and enemies
  const projectiles = projectileQuery(world);
  const enemies = enemyQuery(world);
  
  // Check each projectile against each enemy
  for (const projectile of projectiles) {
    const projectileX = Position.x[projectile];
    const projectileY = Position.y[projectile];
    const projectileWidth = Render.width[projectile];
    const projectileHeight = Render.height[projectile];
    
    for (const enemy of enemies) {
      const enemyX = Position.x[enemy];
      const enemyY = Position.y[enemy];
      const enemyWidth = Render.width[enemy];
      const enemyHeight = Render.height[enemy];
      
      // Simple AABB collision detection
      const collisionX = Math.abs(projectileX - enemyX) < (projectileWidth + enemyWidth) / 2;
      const collisionY = Math.abs(projectileY - enemyY) < (projectileHeight + enemyHeight) / 2;
      
      // If collision detected
      if (collisionX && collisionY) {
        // Destroy the projectile
        removeEntity(world, projectile);
        
        // Destroy the enemy
        removeEntity(world, enemy);
        
        // Only one collision per projectile
        break;
      }
    }
  }
  
  return world;
} 