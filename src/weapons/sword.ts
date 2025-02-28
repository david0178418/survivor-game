import { addEntity, addComponent } from 'bitecs';
import { Position, Render, Damage, Sword, Weapon } from '../components';
import { WeaponType, WEAPONS } from '../constants';
import type { Entity } from '../types';

/**
 * Creates a sword weapon entity attached to the player
 * The sword swings in an arc toward the closest enemy
 * 
 * @param world The game world
 * @param playerX Player X position (center of the swing)
 * @param playerY Player Y position (center of the swing)
 * @param targetX Target X position (direction to swing)
 * @param targetY Target Y position (direction to swing)
 * @returns The sword entity ID
 */
export function createSword(world: any, playerX: number, playerY: number, targetX: number, targetY: number): Entity {
	// Create a new entity for the sword
	const sword = addEntity(world);
	
	// Debug: Log sword creation
	console.log('Creating sword entity:', sword, 'at position:', playerX, playerY);
	
	// Calculate direction to target (this will be the center of our swing arc)
	const dx = targetX - playerX;
	const dy = targetY - playerY;
	
	// Get the sword settings
	const swordSettings = WEAPONS[WeaponType.SWORD];
	
	// Add Position component (start at player position)
	addComponent(world, Position, sword);
	Position.x[sword] = playerX;
	Position.y[sword] = playerY;
	
	// Add Render component
	addComponent(world, Render, sword);
	Render.width[sword] = swordSettings.WIDTH;
	Render.height[sword] = swordSettings.HEIGHT;
	Render.color[sword] = swordSettings.COLOR;
	
	// Add Damage component
	addComponent(world, Damage, sword);
	Damage.amount[sword] = swordSettings.DAMAGE;
	
	// Add Weapon component to mark this as a weapon
	addComponent(world, Weapon, sword);
	Weapon.type[sword] = WeaponType.SWORD;
	Weapon.level[sword] = 0; // Base level
	Weapon.cooldown[sword] = 0; // No cooldown initially
	Weapon.baseCooldown[sword] = swordSettings.COOLDOWN;
	
	// Add Sword component for specific sword properties
	addComponent(world, Sword, sword);
	
	// Calculate the starting angle based on the target direction
	const baseAngle = Math.atan2(dy, dx);
	
	// Start the swing from one edge of the arc
	const startOffset = swordSettings.SWING_ARC / 2;
	Sword.angle[sword] = baseAngle - startOffset;
	Sword.swingSpeed[sword] = swordSettings.SWING_SPEED;
	Sword.swingArc[sword] = swordSettings.SWING_ARC;
	Sword.range[sword] = swordSettings.RANGE;
	Sword.active[sword] = 1; // Start the swing
	Sword.lifeTime[sword] = swordSettings.LIFETIME;
	
	return sword;
}