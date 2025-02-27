import { defineQuery, hasComponent } from 'bitecs';
import { Graphics, Text, Application } from 'pixi.js';
import { Player, Health, Velocity, PickupRange } from '../components';
import { UI } from '../constants';
import type { World, GameState } from '../types';
import { getPlayerDamageBoost } from './collectible';

// Define query to get player entity
const playerQuery = defineQuery([Player, Health]);

// UI elements
let healthText: Text;
let speedText: Text;
let damageText: Text;
let rangeText: Text;
let statsContainer: Graphics;

/**
 * Initialize UI elements
 * @param app PIXI Application instance
 */
export function createUI(app: Application) {
	// Create a semi-transparent container for stats
	statsContainer = new Graphics();
	statsContainer.beginFill(
		UI.STATS_PANEL.BACKGROUND_COLOR,
		UI.STATS_PANEL.BACKGROUND_ALPHA
	);
	statsContainer.drawRect(
		0, 0,
		UI.STATS_PANEL.WIDTH,
		UI.STATS_PANEL.HEIGHT
	);
	statsContainer.endFill();
	statsContainer.x = UI.STATS_PANEL.X_OFFSET;
	statsContainer.y = UI.STATS_PANEL.Y_OFFSET;

	app.stage.addChild(statsContainer);

	// Health display
	healthText = new Text('Health: 10 / 10', {
		fontFamily: UI.TEXT.FONT_FAMILY,
		fontSize: UI.TEXT.FONT_SIZE,
		fill: UI.TEXT.COLOR,
		align: 'left'
	});

	healthText.x = UI.TEXT.X_OFFSET;
	healthText.y = UI.STATS_PANEL.Y_OFFSET + UI.TEXT.X_OFFSET;
	healthText.resolution = UI.TEXT.RESOLUTION;
	app.stage.addChild(healthText);

	// Speed display
	speedText = new Text('Speed: 0.5', {
		fontFamily: UI.TEXT.FONT_FAMILY,
		fontSize: UI.TEXT.FONT_SIZE,
		fill: UI.TEXT.COLOR,
		align: 'left'
	});

	speedText.x = UI.TEXT.X_OFFSET;
	speedText.y = UI.STATS_PANEL.Y_OFFSET + UI.TEXT.X_OFFSET + UI.TEXT.SPACING;
	speedText.resolution = UI.TEXT.RESOLUTION;
	app.stage.addChild(speedText);

	// Damage display
	damageText = new Text('Damage: 1', {
		fontFamily: UI.TEXT.FONT_FAMILY,
		fontSize: UI.TEXT.FONT_SIZE,
		fill: UI.TEXT.COLOR,
		align: 'left'
	});

	damageText.x = UI.TEXT.X_OFFSET;
	damageText.y = UI.STATS_PANEL.Y_OFFSET + UI.TEXT.X_OFFSET + UI.TEXT.SPACING * 2;
	damageText.resolution = UI.TEXT.RESOLUTION;
	app.stage.addChild(damageText);

	// Range display
	rangeText = new Text('Pickup Range: 150', {
		fontFamily: UI.TEXT.FONT_FAMILY,
		fontSize: UI.TEXT.FONT_SIZE,
		fill: UI.TEXT.COLOR,
		align: 'left'
	});

	rangeText.x = UI.TEXT.X_OFFSET;
	rangeText.y = UI.STATS_PANEL.Y_OFFSET + UI.TEXT.X_OFFSET + UI.TEXT.SPACING * 3;
	rangeText.resolution = UI.TEXT.RESOLUTION;
	app.stage.addChild(rangeText);
}

/**
 * Update UI based on player stats and game state
 * @param world ECS world
 * @param gameState Current game state
 */
export function uiSystem(world: World, gameState: GameState) {
	const players = playerQuery(world);
	if (players.length === 0) return world;

	const player = players[0];

	// Update health display
	const currentHealth = Health.current[player];
	const maxHealth = Health.max[player];
	healthText.text = `Health: ${currentHealth} / ${maxHealth}`;

	// Update speed display
	if (hasComponent(world, Velocity, player)) {
		const speed = Velocity.speed[player].toFixed(1);
		speedText.text = `Speed: ${speed}`;
	}

	// Damage is updated from the collectible system
	// We just need to reflect the current value
	damageText.text = `Damage: ${1 + Math.floor(getPlayerDamageBoost())}`;

	// Update pickup range display
	if (hasComponent(world, PickupRange, player)) {
		const range = Math.round(PickupRange.radius[player]);
		rangeText.text = `Pickup Range: ${range}`;
	}

	// Make sure UI follows camera
	statsContainer.x = gameState.camera.x + UI.STATS_PANEL.X_OFFSET;
	statsContainer.y = gameState.camera.y + UI.STATS_PANEL.Y_OFFSET;

	healthText.x = gameState.camera.x + UI.TEXT.X_OFFSET;
	healthText.y = gameState.camera.y + UI.STATS_PANEL.Y_OFFSET + UI.TEXT.X_OFFSET;

	speedText.x = gameState.camera.x + UI.TEXT.X_OFFSET;
	speedText.y = gameState.camera.y + UI.STATS_PANEL.Y_OFFSET + UI.TEXT.X_OFFSET + UI.TEXT.SPACING;

	damageText.x = gameState.camera.x + UI.TEXT.X_OFFSET;
	damageText.y = gameState.camera.y + UI.STATS_PANEL.Y_OFFSET + UI.TEXT.X_OFFSET + UI.TEXT.SPACING * 2;

	rangeText.x = gameState.camera.x + UI.TEXT.X_OFFSET;
	rangeText.y = gameState.camera.y + UI.STATS_PANEL.Y_OFFSET + UI.TEXT.X_OFFSET + UI.TEXT.SPACING * 3;

	return world;
}
