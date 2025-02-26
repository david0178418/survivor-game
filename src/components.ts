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