import { defineQuery } from 'bitecs';
import { Position, CameraTarget } from '../components';
import { Application } from 'pixi.js';

// Define a query to get entities that the camera should follow
const cameraTargetQuery = defineQuery([Position, CameraTarget]);

export function cameraSystem(world: any, gameState: any, app: Application) {
  // Get camera target entities
  const entities = cameraTargetQuery(world);
  
  if (entities.length === 0) return world;
  
  // Get the first camera target (usually the player)
  const entity = entities[0];
  
  // Get the position of the entity
  const targetX = Position.x[entity];
  const targetY = Position.y[entity];
  
  // Get the current camera position
  const { x: cameraX, y: cameraY } = gameState.camera;
  
  // Get screen center
  const screenCenterX = app.screen.width / 2;
  const screenCenterY = app.screen.height / 2;
  
  // Get the dead zone radius (the "give" in the camera)
  const deadZoneRadius = CameraTarget.deadZoneRadius[entity];
  
  // Calculate distance between current camera focus and target
  const dx = targetX - (cameraX + screenCenterX);
  const dy = targetY - (cameraY + screenCenterY);
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // If target is outside the dead zone, move the camera
  if (distance > deadZoneRadius) {
    // Calculate how much the camera should move
    const ratio = 1 - (deadZoneRadius / distance);
    
    // Smoothly move the camera (lerp)
    gameState.camera.x += dx * ratio * 0.1;
    gameState.camera.y += dy * ratio * 0.1;
  }
  
  // Update the stage position to follow the camera
  app.stage.x = -gameState.camera.x;
  app.stage.y = -gameState.camera.y;
  
  return world;
} 