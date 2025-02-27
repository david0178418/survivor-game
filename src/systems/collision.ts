import { defineQuery, removeEntity, hasComponent } from 'bitecs';
import { Position, Render, Projectile, Health, Damage, Player } from '../components';
import { Enemy } from '../entities/enemy';
import { createCollectible, getRandomCollectibleType } from '../entities/collectible';

// Define queries for collision detection
const projectileQuery = defineQuery([Projectile, Position, Render, Damage]);
const enemyQuery = defineQuery([Enemy, Position, Render, Health]);
const playerQuery = defineQuery([Player, Position, Render, Health]);

// Drop rate for collectibles from enemies
const COLLECTIBLE_DROP_CHANCE = 0.4; // 40% chance to drop an item

export function collisionSystem(world: any) {
  // Get all projectiles and enemies
  const projectiles = projectileQuery(world);
  const enemies = enemyQuery(world);
  const players = playerQuery(world);

  if (players.length === 0) return world; // No player found

  const player = players[0]; // There should be only one player

  // Check projectile collisions with enemies
  for (const projectile of projectiles) {
    const projectileX = Position.x[projectile];
    const projectileY = Position.y[projectile];
    const projectileWidth = Render.width[projectile];
    const projectileHeight = Render.height[projectile];
    const projectileDamage = Damage.amount[projectile];

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
        // Damage the enemy
        Health.current[enemy] -= projectileDamage;

        // Destroy the projectile
        removeEntity(world, projectile);

        // Check if enemy died
        if (Health.current[enemy] <= 0) {
          // Save position before destroying enemy
          const enemyPosX = Position.x[enemy];
          const enemyPosY = Position.y[enemy];

          // Destroy the enemy
          removeEntity(world, enemy);

          // Chance to spawn a collectible at the enemy's position
          if (Math.random() < COLLECTIBLE_DROP_CHANCE) {
            const collectibleType = getRandomCollectibleType();
            createCollectible(world, enemyPosX, enemyPosY, collectibleType);
          }
        }

        // Only one collision per projectile
        break;
      }
    }
  }

  // Check enemy collisions with player
  for (const enemy of enemies) {
    const enemyX = Position.x[enemy];
    const enemyY = Position.y[enemy];
    const enemyWidth = Render.width[enemy];
    const enemyHeight = Render.height[enemy];
    const enemyDamage = hasComponent(world, Damage, enemy) ? Damage.amount[enemy] : 2; // Default to 2 damage

    const playerX = Position.x[player];
    const playerY = Position.y[player];
    const playerWidth = Render.width[player];
    const playerHeight = Render.height[player];

    // Simple AABB collision detection
    const collisionX = Math.abs(playerX - enemyX) < (playerWidth + enemyWidth) / 2;
    const collisionY = Math.abs(playerY - enemyY) < (playerHeight + enemyHeight) / 2;

    // If collision detected
    if (collisionX && collisionY) {
      // Damage the player
      Health.current[player] -= enemyDamage;

      // Save position before destroying enemy
      const enemyPosX = Position.x[enemy];
      const enemyPosY = Position.y[enemy];

      // Destroy the enemy
      removeEntity(world, enemy);

      // Chance to spawn a collectible at the enemy's position
      if (Math.random() < COLLECTIBLE_DROP_CHANCE) {
        const collectibleType = getRandomCollectibleType();
        createCollectible(world, enemyPosX, enemyPosY, collectibleType);
      }
    }
  }

  return world;
}

// Function to check if player is dead
export function isPlayerDead(world: any): boolean {
  const players = playerQuery(world);
  if (players.length === 0) return false;

  const player = players[0];
  return Health.current[player] <= 0;
}
