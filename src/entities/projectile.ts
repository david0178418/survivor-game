import { addEntity, addComponent } from 'bitecs';
import { Position, Velocity, Render, Projectile, Damage } from '../components';

export function createProjectile(world: any, startX: number, startY: number, targetX: number, targetY: number) {
  // Create a new entity
  const projectile = addEntity(world);
  
  // Add Position component (start at player position)
  addComponent(world, Position, projectile);
  Position.x[projectile] = startX;
  Position.y[projectile] = startY;
  
  // Calculate direction to target
  const dx = targetX - startX;
  const dy = targetY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Add Velocity component
  addComponent(world, Velocity, projectile);
  if (distance > 0) {
    Velocity.x[projectile] = dx / distance;
    Velocity.y[projectile] = dy / distance;
  } else {
    // If for some reason the target is at the same position, shoot right
    Velocity.x[projectile] = 1;
    Velocity.y[projectile] = 0;
  }
  Velocity.speed[projectile] = 1.0; // Faster than player
  
  // Add Projectile component
  addComponent(world, Projectile, projectile);
  Projectile.targetX[projectile] = targetX;
  Projectile.targetY[projectile] = targetY;
  Projectile.lifeTime[projectile] = 2000; // 2 seconds max life time
  
  // Add Render component
  addComponent(world, Render, projectile);
  Render.width[projectile] = 15;
  Render.height[projectile] = 15;
  Render.color[projectile] = 0x0000FF; // Blue square for projectiles
  
  // Add Damage component - projectiles deal 1 damage
  addComponent(world, Damage, projectile);
  Damage.amount[projectile] = 1;
  
  return projectile;
}