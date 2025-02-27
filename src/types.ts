// Type definitions for the game

// ECS World type
export interface World {
	// BitECS doesn't expose its World type, so we use any for now
	[key: string]: any;
}

// Input state
export interface InputState {
	up: boolean;
	down: boolean;
	left: boolean;
	right: boolean;
	shoot: boolean;
}

// Camera state
export interface CameraState {
	x: number;
	y: number;
}

// Map size
export interface MapSize {
	width: number;
	height: number;
}

// Game state
export interface GameState {
	input: InputState;
	camera: CameraState;
	mapSize: MapSize;
	paused: boolean;
}

// Entity type for better type safety when dealing with entity IDs
export type Entity = number;
