 // Game map settings
export const MAP = {
	WIDTH: 2000,
	HEIGHT: 2000,
	WALL_THICKNESS: 20,
	BACKGROUND_COLOR: 0xdddddd
};

// Player settings
export const PLAYER = {
	STARTING_X: 1000,
	STARTING_Y: 1000,
	WIDTH: 40,
	HEIGHT: 40,
	COLOR: 0xFF0000,
	STARTING_SPEED: 0.5,
	STARTING_HEALTH: 10,
	MAX_HEALTH: 10,
	CAMERA_DEAD_ZONE: 100,
	PICKUP_RADIUS: 150,
	ATTRACTION_SPEED: 0.8
};

// Collectible settings
export const COLLECTIBLE = {
	WIDTH: 20,
	HEIGHT: 20,
	LIFETIME_MS: 10000,
	COLORS: {
		HEALTH: 0xFFA500,    // Orange
		SPEED: 0x00FFFF,     // Cyan
		DAMAGE: 0xFF00FF,    // Magenta
		RANGE: 0xFFFF00      // Yellow
	},
	VALUES: {
		HEALTH: 2,           // Heal 2 health
		SPEED: 0.1,          // Increase speed by 0.1
		DAMAGE: 1,           // Increase damage by 1
		RANGE: 25,           // Increase pickup range by 25 pixels
		RANGE_SPEED_BOOST: 0.01 // Range collectible also boosts attraction speed
	},
	SPAWN_CHANCE: {
		HEALTH: 0.5,         // 50% chance
		SPEED: 0.2,          // 20% chance
		DAMAGE: 0.2,         // 20% chance
		RANGE: 0.1           // 10% chance
	},
	RADIUS: 10,
	LARGE_RADIUS: 15,
	HEALTH_COLOR: 0xff0000, // Red
	SPEED_COLOR: 0x00ff00,  // Green
	DAMAGE_COLOR: 0x0000ff, // Blue
	PICKUP_COLOR: 0xffff00, // Yellow
	LIFETIME: 10000, // 10 seconds
	DROP_CHANCE: 0.5, // 50% chance to drop a collectible
	PICKUP_RANGE_VALUE: 25,
	PICKUP_ATTRACTION_BOOST: 0.25,
	PICKUP_DROP_CHANCE: 0.1, // 10% chance for pickup range boost
	SMALL_XP: 1,  // XP granted by small pickup
	LARGE_XP: 5   // XP granted by large pickup
};

// Experience constants
export const EXPERIENCE = {
	STARTING_LEVEL: 1,
	BASE_XP_FOR_LEVEL: 10,  // XP needed for level 1
	LEVEL_SCALING_FACTOR: 1.5,  // Each level requires 1.5x more XP
	MAX_LEVEL: 30,
	POINTS_PER_LEVEL: 5  // Each level requires 5 more XP than the previous
};

// Enemy scaling constants
export const ENEMY_SCALING = {
	BASE_SPAWN_COUNT: 8,  // Increased from 5 to 8
	SPAWN_INCREASE_PER_LEVEL: 2,  // Increased from 1 to 2
	HEALTH_SCALING: 0.1,   // 10% health increase per level
	DAMAGE_SCALING: 0.1,   // 10% damage increase per level
	SPEED_SCALING: 0.05    // 5% speed increase per level
};

// UI settings
export const UI = {
	STATS_PANEL: {
		WIDTH: 200,
		HEIGHT: 125,
		X_OFFSET: 10,
		Y_OFFSET: 10,
		BACKGROUND_COLOR: 0x000000,
		BACKGROUND_ALPHA: 0.5
	},
	TEXT: {
		FONT_FAMILY: 'Arial',
		FONT_SIZE: 16,
		COLOR: 0xFFFFFF,
		RESOLUTION: 2,
		SPACING: 25,
		X_OFFSET: 20
	}
};

// Invincibility duration constant
export const INVINCIBILITY_DURATION = 500; // 500ms
