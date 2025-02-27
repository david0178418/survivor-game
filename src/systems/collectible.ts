import { defineQuery, removeEntity, hasComponent, defineSystem } from 'bitecs';
import { Position, Render, Collectible, Player, Health, Velocity, PickupRange, Experience } from '../components';
import { CollectibleType } from '../entities/collectible';
import { COLLECTIBLE, EXPERIENCE } from '../constants';

// Define queries for collectibles and player
const collectibleQuery = defineQuery([Collectible, Position, Render]);
const playerQuery = defineQuery([Player, Position, Render, PickupRange, Experience]);

// Store player upgrades for speed and damage
let playerSpeedBoost = 0;
let playerDamageBoost = 0;

// Handle collectible movement toward player when in range
function handleCollectibleMovement(
	world: any,
	collectible: number,
	player: number,
	delta: number,
	pickupRadius: number,
	attractionSpeed: number
) {
	const dx = Position.x[player] - Position.x[collectible];
	const dy = Position.y[player] - Position.y[collectible];
	const distance = Math.sqrt(dx * dx + dy * dy);

	// If within pickup range, move toward player
	if (distance <= pickupRadius) {
		const moveX = (dx / distance) * attractionSpeed * delta;
		const moveY = (dy / distance) * attractionSpeed * delta;

		Position.x[collectible] += moveX;
		Position.y[collectible] += moveY;

		// Check if collectible has reached player
		const collisionX = Math.abs(dx) < Render.width[player] / 2;
		const collisionY = Math.abs(dy) < Render.height[player] / 2;

		if (collisionX && collisionY) {
			// Player collided with collectible, apply its effect
			applyCollectibleEffect(world, player, collectible);

			// Grant experience based on collectible size
			grantExperience(world, player, collectible);

			// Remove the collectible
			removeEntity(world, collectible);
		}
	}
}

// Apply the collectible's effect to the player
function applyCollectibleEffect(world: any, player: number, collectible: number) {
	const type = Collectible.type[collectible];
	const value = Collectible.value[collectible];

	switch (type) {
		case CollectibleType.HEALTH:
			if (hasComponent(world, Health, player)) {
				Health.current[player] = Math.min(
					Health.current[player] + value,
					Health.max[player]
				);
			}
			break;
		case CollectibleType.SPEED:
			if (hasComponent(world, Velocity, player)) {
				Velocity.speed[player] += value;
				playerSpeedBoost += value;
			}
			break;
		case CollectibleType.DAMAGE:
			playerDamageBoost += value;
			break;
		case CollectibleType.RANGE:
			if (hasComponent(world, PickupRange, player)) {
				PickupRange.radius[player] += value;
				// Also slightly increase attraction speed
				PickupRange.attractionSpeed[player] += COLLECTIBLE.VALUES.RANGE_SPEED_BOOST * value;
			}
			break;
	}
}

/**
 * Calculate player level based on experience
 */
export function getPlayerLevel(world: any): number {
	const players = playerQuery(world);
	if (players.length === 0) return EXPERIENCE.STARTING_LEVEL;

	const player = players[0];
	if (!hasComponent(world, Experience, player)) return EXPERIENCE.STARTING_LEVEL;

	return Experience.level[player];
}

/**
 * Get the current player's damage boost
 */
export function getPlayerDamageBoost(): number {
	return playerDamageBoost;
}

/**
 * Grant experience to the player based on collectible size
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
	checkLevelUp(player);
}

/**
 * Check and handle player level up
 */
function checkLevelUp(player: number) {
	const currentExp = Experience.current[player];
	const nextLevelExp = Experience.nextLevel[player];

	if (currentExp >= nextLevelExp) {
		// Level up!
		Experience.level[player]++;
		Experience.current[player] = currentExp - nextLevelExp;
		Experience.nextLevel[player] = calculateNextLevelExp(Experience.level[player]);
	}
}

/**
 * Calculate XP needed for next level
 */
function calculateNextLevelExp(level: number): number {
	return Math.floor(
		EXPERIENCE.BASE_XP_FOR_LEVEL +
		(level * EXPERIENCE.POINTS_PER_LEVEL * EXPERIENCE.LEVEL_SCALING_FACTOR)
	);
}

export const collectibleSystem = defineSystem((world: any, { delta }: { delta: number }): any => {
	// Get all collectibles and player
	const collectibles = collectibleQuery(world);
	const players = playerQuery(world);

	if (players.length === 0) return world; // No player active

	const player = players[0];

	// Process each collectible
	for (const collectible of collectibles) {
		// Update lifetime
		Collectible.lifeTime[collectible] -= delta;

		// Remove if lifetime expired
		if (Collectible.lifeTime[collectible] <= 0) {
			removeEntity(world, collectible);
			continue;
		}

		// Handle movement toward player if in range
		handleCollectibleMovement(
			world,
			collectible,
			player,
			delta,
			PickupRange.radius[player],
			PickupRange.attractionSpeed[player]
		);
	}

	return world;
});
