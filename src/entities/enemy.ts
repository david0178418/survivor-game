import { addEntity, addComponent, defineComponent } from 'bitecs';
import { Position, Velocity, Render, Health, Damage } from '../components';
import { ENEMY_SCALING } from '../constants';

// Create Enemy components
export const Enemy = defineComponent();
export const FastEnemy = defineComponent();
export const ShooterEnemy = defineComponent(); // New component for shooter enemies

// Enemy type definitions for scalable enemy system
export enum EnemyType {
  NORMAL = 'normal',
  FAST = 'fast',
  SHOOTER = 'shooter' // New shooter enemy type
}

// Minimum level requirements for each enemy type to spawn
export const ENEMY_LEVEL_REQUIREMENTS = {
  [EnemyType.NORMAL]: 0, // Available from the start
  [EnemyType.FAST]: 2,   // Only appears at level 2 and above
  [EnemyType.SHOOTER]: 3 // Only appears at level 3 and above
};

// Stats modifiers for different enemy types
export const ENEMY_STATS = {
  [EnemyType.NORMAL]: {
    baseSpeed: 0.1,
    baseHealth: 2,
    baseDamage: 2,
    width: 30,
    height: 30,
    color: (strengthFactor: number) => {
      const green = Math.floor(0xFF * (1 - strengthFactor));
      return (0xFF << 16) | (green << 8); // Red-green mix
    }
  },
  [EnemyType.FAST]: {
    baseSpeed: 0.25, // 2.5x faster than normal enemies
    baseHealth: 1,   // Half the health of normal enemies
    baseDamage: 1,   // Half the damage of normal enemies
    width: 24,       // Slightly smaller than normal enemies
    height: 24,
    color: (strengthFactor: number) => {
      const red = Math.floor(0xFF * (1 - strengthFactor));
      return (red << 16) | (0xFF << 8) | 0xFF; // Primarily cyan
    }
  },
  [EnemyType.SHOOTER]: {
    baseSpeed: 0.08,   // Slower than normal enemies
    baseHealth: 3,     // More health than normal enemies
    baseDamage: 1,     // Less contact damage than normal enemies
    width: 35,         // Slightly larger than normal enemies
    height: 35,
    color: (strengthFactor: number) => {
      const blue = Math.floor(0xFF * (1 - strengthFactor));
      return (0xFF << 16) | (0xA0 << 8) | blue; // Orange-yellow color
    }
  }
};

/**
 * Creates an enemy entity with stats scaled to player level
 *
 * @param world The game world
 * @param playerX Player's X position
 * @param playerY Player's Y position
 * @param playerLevel Current player level (0 is default if not provided)
 * @param type Type of enemy to create
 * @returns The enemy entity ID
 */
export function createEnemy(
  world: any, 
  playerX: number, 
  playerY: number, 
  playerLevel: number = 0,
  type: EnemyType = EnemyType.NORMAL
) {
  // Create a new entity
  const enemy = addEntity(world);
  
  // Add Position component (start at a random position away from player)
  addComponent(world, Position, enemy);
  
  // Random position between 500-800 pixels away from player
  const distance = 500 + Math.random() * 300;
  const angle = Math.random() * Math.PI * 2; // Random angle
  Position.x[enemy] = playerX + Math.cos(angle) * distance;
  Position.y[enemy] = playerY + Math.sin(angle) * distance;
  
  // Get the stats for this enemy type
  const stats = ENEMY_STATS[type];
  
  // Calculate level scaling factors
  const healthScaling = 1 + (playerLevel * ENEMY_SCALING.HEALTH_SCALING);
  const damageScaling = 1 + (playerLevel * ENEMY_SCALING.DAMAGE_SCALING);
  const speedScaling = 1 + (playerLevel * ENEMY_SCALING.SPEED_SCALING);
  
  // Add Velocity component with level-based scaling
  addComponent(world, Velocity, enemy);
  Velocity.x[enemy] = 0;
  Velocity.y[enemy] = 0;
  Velocity.speed[enemy] = stats.baseSpeed * speedScaling;
  
  // Add Enemy marker component based on type
  addComponent(world, Enemy, enemy);
  if (type === EnemyType.FAST) {
    addComponent(world, FastEnemy, enemy);
  } else if (type === EnemyType.SHOOTER) {
    addComponent(world, ShooterEnemy, enemy);
  }
  
  // Add Render component
  addComponent(world, Render, enemy);
  Render.width[enemy] = stats.width;
  Render.height[enemy] = stats.height;
  
  // Color based on enemy strength (stronger enemies have more intense colors)
  const strengthFactor = Math.min(1, (healthScaling - 1) / 5);  // Cap at 500% health
  Render.color[enemy] = stats.color(strengthFactor);
  
  // Add Health component with level-based scaling
  addComponent(world, Health, enemy);
  const scaledHealth = Math.ceil(stats.baseHealth * healthScaling);
  Health.current[enemy] = scaledHealth;
  Health.max[enemy] = scaledHealth;
  
  // Add Damage component with level-based scaling
  addComponent(world, Damage, enemy);
  const scaledDamage = Math.ceil(stats.baseDamage * damageScaling);
  Damage.amount[enemy] = scaledDamage;
  
  return enemy;
}
