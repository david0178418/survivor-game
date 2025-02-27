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
  }
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
