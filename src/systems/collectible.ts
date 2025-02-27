import { defineQuery, removeEntity, hasComponent } from 'bitecs';
import { Position, Render, Collectible, Player, Health, Velocity, Damage } from '../components';
import { CollectibleType } from '../entities/collectible';

// Define queries for collectibles and player
const collectibleQuery = defineQuery([Collectible, Position, Render]);
const playerQuery = defineQuery([Player, Position, Render]);

// Store player upgrades for speed and damage
let playerSpeedBoost = 0;
let playerDamageBoost = 0;

export function collectibleSystem(world: any, delta: number) {
  // Get all collectibles and player
  const collectibles = collectibleQuery(world);
  const players = playerQuery(world);

  if (players.length === 0) return world; // No player active

  const player = players[0];
  const playerX = Position.x[player];
  const playerY = Position.y[player];
  const playerWidth = Render.width[player];
  const playerHeight = Render.height[player];

  // Process each collectible
  for (const collectible of collectibles) {
    // Update lifetime
    Collectible.lifeTime[collectible] -= delta;

    // Remove collectibles that have expired
    if (Collectible.lifeTime[collectible] <= 0) {
      removeEntity(world, collectible);
      continue;
    }

    // Check for player collision
    const collectibleX = Position.x[collectible];
    const collectibleY = Position.y[collectible];
    const collectibleWidth = Render.width[collectible];
    const collectibleHeight = Render.height[collectible];

    // Simple AABB collision detection
    const collisionX = Math.abs(playerX - collectibleX) < (playerWidth + collectibleWidth) / 2;
    const collisionY = Math.abs(playerY - collectibleY) < (playerHeight + collectibleHeight) / 2;

    if (collisionX && collisionY) {
      // Player collided with collectible, apply its effect
      applyCollectibleEffect(world, player, collectible);

      // Remove the collectible
      removeEntity(world, collectible);
    }
  }

  return world;
}

// Apply the collectible's effect to the player
function applyCollectibleEffect(world: any, player: number, collectible: number) {
  const type = Collectible.type[collectible];
  const value = Collectible.value[collectible];

  switch(type) {
    case CollectibleType.HEALTH:
      // Health boost
      if (hasComponent(world, Health, player)) {
        const currentHealth = Health.current[player];
        const maxHealth = Health.max[player];

        // Cap health at max
        Health.current[player] = Math.min(currentHealth + value, maxHealth);
      }
      break;

    case CollectibleType.SPEED:
      // Speed boost
      if (hasComponent(world, Velocity, player)) {
        playerSpeedBoost += value;
        Velocity.speed[player] += value;
      }
      break;

    case CollectibleType.DAMAGE:
      // Damage boost for projectiles
      playerDamageBoost += value;
      break;
  }
}

// Get the current damage boost for projectiles
export function getPlayerDamageBoost() {
  return playerDamageBoost;
}
