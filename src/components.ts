import { defineComponent, Types } from 'bitecs';

// Position component for entities in the game world
export const Position = defineComponent({
	x: Types.f32,
	y: Types.f32
});

// Velocity component for moving entities
export const Velocity = defineComponent({
	x: Types.f32,
	y: Types.f32,
	speed: Types.f32
});

// Renderable component for visual entities
export const Renderable = defineComponent({
	width: Types.f32,
	height: Types.f32,
	color: Types.ui32, // Color in PIXI format
	spriteId: Types.ui32 // Reference to a sprite or graphics object
});

// Player component to tag the player entity
export const Player = defineComponent();

// Camera component for the camera entity
export const Camera = defineComponent({
	x: Types.f32,
	y: Types.f32,
	width: Types.f32,
	height: Types.f32,
	lerpFactor: Types.f32, // For smooth camera movement
	target: Types.eid // Entity to follow
});

// Boundary component for wall entities
export const Boundary = defineComponent({
	top: Types.f32,
	right: Types.f32,
	bottom: Types.f32,
	left: Types.f32
});

// Render component - for entities that need to be rendered
export const Render = defineComponent({
	width: Types.f32,
	height: Types.f32,
	color: Types.ui32
});

// Wall component - marker component for boundary walls
export const Wall = defineComponent();

// Camera target component - entities that the camera should follow
export const CameraTarget = defineComponent({
	offsetX: Types.f32,
	offsetY: Types.f32,
	deadZoneRadius: Types.f32
});

// Projectile component - for player shots
export const Projectile = defineComponent({
	targetX: Types.f32,
	targetY: Types.f32,
	lifeTime: Types.f32  // How long the projectile exists in ms
});

// Health component - for entities that can take damage
export const Health = defineComponent({
	current: Types.i32,
	max: Types.i32
});

// Damage component - for entities that deal damage
export const Damage = defineComponent({
	amount: Types.i32
});

// Collectible component - for items that can be picked up
export const Collectible = defineComponent({
	type: Types.ui8,  // 0 = health, 1 = speed, 2 = damage boost, etc.
	value: Types.f32,  // How much value the collectible provides
	lifeTime: Types.f32,  // How long the collectible exists in ms
	isLarge: Types.ui8 // 0 = small (1 XP), 1 = large (5 XP)
});

// PickupRange component - for entities that can attract items
export const PickupRange = defineComponent({
	radius: Types.f32,  // Radius in which items are attracted
	attractionSpeed: Types.f32  // How fast items move toward the entity
});

// Experience component - for tracking player level and XP
export const Experience = defineComponent({
	level: Types.ui32,  // Current level
	current: Types.ui32,  // Current XP
	nextLevel: Types.ui32  // XP required for next level
});

// Invincible component - for tracking invincibility frames
export const Invincible = defineComponent({
	duration: Types.f32  // How long invincibility lasts in ms
});
