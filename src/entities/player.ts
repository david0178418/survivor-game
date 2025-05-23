import { addEntity, addComponent } from 'bitecs';
import { Position, Velocity, Player, Render, CameraTarget, Health, PickupRange, Experience, Invincible } from '../components';
import { PLAYER, EXPERIENCE } from '../constants';

export function createPlayer(world: any) {
	// Create a new entity
	const player = addEntity(world);

	// Add Position component (start in the center of the map)
	addComponent(world, Position, player);
	Position.x[player] = PLAYER.STARTING_X;
	Position.y[player] = PLAYER.STARTING_Y;

	// Add Velocity component
	addComponent(world, Velocity, player);
	Velocity.x[player] = 0;
	Velocity.y[player] = 0;
	Velocity.speed[player] = PLAYER.STARTING_SPEED;

	// Add Player marker component
	addComponent(world, Player, player);

	// Add Render component
	addComponent(world, Render, player);
	Render.width[player] = PLAYER.WIDTH;
	Render.height[player] = PLAYER.HEIGHT;
	Render.color[player] = PLAYER.COLOR;

	// Add CameraTarget component
	addComponent(world, CameraTarget, player);
	CameraTarget.offsetX[player] = 0;
	CameraTarget.offsetY[player] = 0;
	CameraTarget.deadZoneRadius[player] = PLAYER.CAMERA_DEAD_ZONE;

	// Add Health component
	addComponent(world, Health, player);
	Health.current[player] = PLAYER.STARTING_HEALTH;
	Health.max[player] = PLAYER.MAX_HEALTH;

	// Add PickupRange component
	addComponent(world, PickupRange, player);
	PickupRange.radius[player] = PLAYER.PICKUP_RADIUS;
	PickupRange.attractionSpeed[player] = PLAYER.ATTRACTION_SPEED;

	// Add Experience component
	addComponent(world, Experience, player);
	Experience.level[player] = EXPERIENCE.STARTING_LEVEL;
	Experience.current[player] = 0;
	Experience.nextLevel[player] = EXPERIENCE.BASE_XP_FOR_LEVEL;

	// Add Invincible component (starts with 0 duration)
	addComponent(world, Invincible, player);
	Invincible.duration[player] = 0;

	return player;
}
