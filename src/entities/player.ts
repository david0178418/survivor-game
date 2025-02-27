import { addEntity, addComponent } from 'bitecs';
import { Position, Velocity, Player, Render, CameraTarget, Health, PickupRange } from '../components';

export function createPlayer(world: any) {
  // Create a new entity
  const player = addEntity(world);

  // Add Position component (start in the center of the map)
  addComponent(world, Position, player);
  Position.x[player] = 1000; // Center of the 2000x2000 map
  Position.y[player] = 1000;

  // Add Velocity component
  addComponent(world, Velocity, player);
  Velocity.x[player] = 0;
  Velocity.y[player] = 0;
  Velocity.speed[player] = 0.5; // Player movement speed (reduced by factor of 10 from 5.0)

  // Add Player marker component
  addComponent(world, Player, player);

  // Add Render component
  addComponent(world, Render, player);
  Render.width[player] = 40;
  Render.height[player] = 40;
  Render.color[player] = 0xFF0000; // Red square for the player

  // Add CameraTarget component
  addComponent(world, CameraTarget, player);
  CameraTarget.offsetX[player] = 0;
  CameraTarget.offsetY[player] = 0;
  CameraTarget.deadZoneRadius[player] = 100; // Radius of the "give" in the camera

  // Add Health component
  addComponent(world, Health, player);
  Health.current[player] = 10;
  Health.max[player] = 10;

  // Add PickupRange component
  addComponent(world, PickupRange, player);
  PickupRange.radius[player] = 150; // Items within 150 pixels will be attracted
  PickupRange.attractionSpeed[player] = 0.8; // Speed at which items move toward player

  return player;
}
