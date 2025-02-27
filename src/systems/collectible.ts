import { defineQuery, removeEntity, hasComponent } from 'bitecs';
import { Position, Render, Collectible, Player, Health, Velocity, PickupRange, Experience } from '../components';
import { CollectibleType } from '../entities/collectible';
import { COLLECTIBLE, EXPERIENCE } from '../constants';

// Define queries for collectibles and player
const collectibleQuery = defineQuery([Collectible, Position, Render]);
const playerQuery = defineQuery([Player, Position, Render, PickupRange, Experience]);

// Store player upgrades for speed and damage
let playerSpeedBoost = 0;
let playerDamageBoost = 0;

export function collectibleSystem(world: any, delta: number) {
	// Get all collectibles and player
	const collectibles = collectibleQuery(world);
	const players = playerQuery(world);

	if (players.length === 0) return world; // No player active

	const player = players[0];

	// Get player's pickup range
	const pickupRadius = PickupRange.radius[player];
	const attractionSpeed = PickupRange.attractionSpeed[player];

	// Process each collectible
	for (const collectible of collectibles) {
		// Update lifetime
		Collectible.lifeTime[collectible] -= delta;

		// Remove collectibles that have expired
		if (Collectible.lifeTime[collectible] <= 0) {
			removeEntity(world, collectible);
			continue;
		}

		// Check if collectible is within pickup range and handle movement
		handleCollectibleMovement(world, collectible, player, delta, pickupRadius, attractionSpeed);
	}

	return world;
}

// Handle collectible movement toward player when in range
function handleCollectibleMovement(
	world: any,
	collectible: number,
	player: number,
	delta: number,
	pickupRadius: number,
	attractionSpeed: number
) {
	const playerX = Position.x[player];
	const playerY = Position.y[player];
	const playerWidth = Render.width[player];
	const playerHeight = Render.height[player];

	const collectibleX = Position.x[collectible];
	const collectibleY = Position.y[collectible];
	const collectibleWidth = Render.width[collectible];
	const collectibleHeight = Render.height[collectible];

	// Calculate distance to player
	const dx = playerX - collectibleX;
	const dy = playerY - collectibleY;
	const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

	// Check if collectible is within pickup range
	if (distanceToPlayer <= pickupRadius) {
		// Calculate normalized direction vector to player
		const dirX = dx / distanceToPlayer;
		const dirY = dy / distanceToPlayer;

		// Calculate attraction speed (faster as it gets closer)
		const speedFactor = 1.0 - (distanceToPlayer / pickupRadius) * 0.5;
		const moveSpeed = attractionSpeed * speedFactor * delta;

		// Move collectible toward player
		Position.x[collectible] += dirX * moveSpeed;
		Position.y[collectible] += dirY * moveSpeed;
	}

	// Check for player collision (after movement)
	const updatedDx = Math.abs(playerX - Position.x[collectible]);
	const updatedDy = Math.abs(playerY - Position.y[collectible]);
	const collisionX = updatedDx < (playerWidth + collectibleWidth) / 2;
	const collisionY = updatedDy < (playerHeight + collectibleHeight) / 2;

	if (collisionX && collisionY) {
		// Player collided with collectible, apply its effect
		applyCollectibleEffect(world, player, collectible);

		// Grant experience based on collectible size
		grantExperience(world, player, collectible);

		// Remove the collectible
		removeEntity(world, collectible);
	}
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

		case CollectibleType.RANGE:
			// Pickup range boost
			if (hasComponent(world, PickupRange, player)) {
				PickupRange.radius[player] += value;
				// Also slightly increase attraction speed
				PickupRange.attractionSpeed[player] += COLLECTIBLE.VALUES.RANGE_SPEED_BOOST * value;
			}
			break;
	}
}

/**
 * Grant experience to the player based on collectible size
 *
 * @param world The game world
 * @param player The player entity
 * @param collectible The collectible entity
 */
function grantExperience(world: any, player: number, collectible: number) {
	if (!hasComponent(world, Experience, player)) {
		return; // Player doesn't have Experience component
	}

	// Determine XP amount based on collectible size
	const isLarge = Collectible.isLarge[collectible] === 1;
	const xpAmount = isLarge ? COLLECTIBLE.LARGE_XP : COLLECTIBLE.SMALL_XP;

	// Add experience to player
	Experience.current[player] += xpAmount;

	// Check for level up
	checkLevelUp(world, player);
}

/**
 * Check if player has enough XP to level up and process level up if needed
 *
 * @param world The game world
 * @param player The player entity
 */
function checkLevelUp(world: any, player: number) {
	const currentXP = Experience.current[player];
	const requiredXP = Experience.nextLevel[player];
	const currentLevel = Experience.level[player];

	// Check if player has enough XP to level up
	if (currentXP >= requiredXP && currentLevel < EXPERIENCE.MAX_LEVEL) {
		// Level up the player
		Experience.level[player] += 1;

		// Calculate XP for next level using the scaling factor applied to previous level's requirement
		// For example:
		// Level 1 needs 10 XP (base)
		// Level 2 needs 25 XP (10 + 10*1.5)
		// Level 3 needs 63 XP (25 + 25*1.5)
		const additionalXP = Math.floor(requiredXP * EXPERIENCE.LEVEL_SCALING_FACTOR);
		const nextLevelXP = requiredXP + additionalXP;

		Experience.nextLevel[player] = nextLevelXP;

		// Apply level-up bonuses
		if (hasComponent(world, Health, player)) {
			// Increase max health by 10% per level
			const newMaxHealth = Math.floor(Health.max[player] * 1.1);
			Health.max[player] = newMaxHealth;

			// Also heal 20% of max health on level up
			const healAmount = Math.floor(newMaxHealth * 0.2);
			Health.current[player] = Math.min(Health.current[player] + healAmount, newMaxHealth);
		}

		console.log(`Player leveled up to level ${Experience.level[player]}! Next level at ${Experience.nextLevel[player]} XP`);
	}
}

// Get the current damage boost for projectiles
export function getPlayerDamageBoost() {
	return playerDamageBoost;
}

// Get the current player speed boost
export function getPlayerSpeedBoost() {
	return playerSpeedBoost;
}

/**
 * Get the current player level
 *
 * @param world The game world
 * @returns The player's current level or 0 if no player
 */
export function getPlayerLevel(world: any): number {
	const players = playerQuery(world);
	if (players.length === 0) return 0;

	return Experience.level[players[0]];
}
