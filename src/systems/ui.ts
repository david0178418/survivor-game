import { defineQuery, hasComponent } from 'bitecs';
import { Graphics, Text, Application } from 'pixi.js';
import { Player, Health, Velocity, PickupRange, Experience } from '../components';
import { UI, EXPERIENCE } from '../constants';
import type { World, GameState } from '../types';
import { getPlayerDamageBoost } from './collectible';
import { ENEMY_LEVEL_REQUIREMENTS, EnemyType } from '../entities/enemy';

// Define query to get player entity
const playerQuery = defineQuery([Player, Health, Experience]);

// UI elements
let healthText: Text;
let speedText: Text;
let damageText: Text;
let rangeText: Text;
let levelText: Text;
let xpText: Text;
let xpBar: Graphics;
let statsContainer: Graphics;
let notificationText: Text;

// Track notification state
const notifications = {
  displayTime: 3000, // How long to show notifications (ms)
  currentMessage: '',
  timeRemaining: 0,
  enemyTypesUnlocked: new Set<EnemyType>([EnemyType.NORMAL]) // Start with normal enemies unlocked
};

/**
 * Initialize UI elements
 * @param app PIXI Application instance
 */
export function createUI(app: Application): void {
	// Create a semi-transparent container for stats
	statsContainer = new Graphics();
	statsContainer.beginFill(
		UI.STATS_PANEL.BACKGROUND_COLOR,
		UI.STATS_PANEL.BACKGROUND_ALPHA
	);
	statsContainer.drawRect(
		0, 0,
		UI.STATS_PANEL.WIDTH,
		UI.STATS_PANEL.HEIGHT + 60  // Increased height for XP and level
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

	// Level display
	levelText = new Text('Level: 0', {
		fontFamily: UI.TEXT.FONT_FAMILY,
		fontSize: UI.TEXT.FONT_SIZE,
		fill: 0xFFFF00,  // Yellow for level
		align: 'left'
	});

	levelText.x = UI.TEXT.X_OFFSET;
	levelText.y = UI.STATS_PANEL.Y_OFFSET + UI.TEXT.X_OFFSET + UI.TEXT.SPACING * 4;
	levelText.resolution = UI.TEXT.RESOLUTION;
	app.stage.addChild(levelText);

	// XP display
	xpText = new Text('XP: 0 / 10', {
		fontFamily: UI.TEXT.FONT_FAMILY,
		fontSize: UI.TEXT.FONT_SIZE,
		fill: 0xFFFF00,  // Yellow for XP
		align: 'left'
	});

	xpText.x = UI.TEXT.X_OFFSET;
	xpText.y = UI.STATS_PANEL.Y_OFFSET + UI.TEXT.X_OFFSET + UI.TEXT.SPACING * 5;
	xpText.resolution = UI.TEXT.RESOLUTION;
	app.stage.addChild(xpText);

	// XP progress bar
	xpBar = new Graphics();
	xpBar.x = UI.TEXT.X_OFFSET;
	xpBar.y = UI.STATS_PANEL.Y_OFFSET + UI.TEXT.X_OFFSET + UI.TEXT.SPACING * 6;
	app.stage.addChild(xpBar);
	
	// Notification text for displaying new enemy types
	notificationText = new Text('', {
		fontFamily: UI.TEXT.FONT_FAMILY,
		fontSize: UI.TEXT.FONT_SIZE + 4,
		fill: 0xFF9900,  // Orange for notifications
		align: 'center',
		stroke: 0x000000,
		strokeThickness: 4,
		dropShadow: true,
		dropShadowColor: 0x000000,
		dropShadowDistance: 2
	});
	notificationText.resolution = UI.TEXT.RESOLUTION;
	notificationText.anchor.set(0.5, 0);
	app.stage.addChild(notificationText);
}

/**
 * Check if any new enemy types are unlocked at the current level
 * @param level Current player level
 */
function checkForNewEnemyTypes(level: number): void {
	Object.values(EnemyType).forEach(enemyType => {
		const requiredLevel = ENEMY_LEVEL_REQUIREMENTS[enemyType];
		
		// If this enemy type becomes available at the current level and hasn't been shown yet
		if (level === requiredLevel && !notifications.enemyTypesUnlocked.has(enemyType)) {
			// Mark as unlocked
			notifications.enemyTypesUnlocked.add(enemyType);
			
			// Format the enemy type name for display
			const formattedName = enemyType.charAt(0).toUpperCase() + 
				enemyType.slice(1).toLowerCase();
			
			// Set notification
			notifications.currentMessage = `New Enemy Type Unlocked: ${formattedName}!`;
			notifications.timeRemaining = notifications.displayTime;
		}
	});
}

/**
 * Update UI based on player stats and game state
 * @param world ECS world
 * @param gameState Current game state
 * @param delta Time since last frame in milliseconds
 * @returns The updated world
 */
export function uiSystem(world: World, gameState: GameState, delta: number): World {
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

	// Update level and XP display
	if (hasComponent(world, Experience, player)) {
		const level = Experience.level[player];
		const currentXP = Experience.current[player];
		const nextLevelXP = Experience.nextLevel[player];

		levelText.text = `Level: ${level}`;
		xpText.text = `XP: ${currentXP} / ${nextLevelXP}`;

			// Check for newly unlocked enemy types
		checkForNewEnemyTypes(level);

		// Update XP progress bar to show progress from current level to next level
		const barWidth = 200;
		const barHeight = 10;

		// Calculate progress between current level and next level
		// This resets the bar with each level-up
		const xpForCurrentLevel = currentXP - (nextLevelXP / (1 + EXPERIENCE.LEVEL_SCALING_FACTOR));
		const xpNeededForNextLevel = nextLevelXP - (nextLevelXP / (1 + EXPERIENCE.LEVEL_SCALING_FACTOR));
		const progress = Math.min(xpForCurrentLevel / xpNeededForNextLevel, 1);

		xpBar.clear();

		// Background bar (gray)
		xpBar.beginFill(0x666666);
		xpBar.drawRect(0, 0, barWidth, barHeight);
		xpBar.endFill();

		// Progress bar (yellow)
		xpBar.beginFill(0xFFFF00);
		xpBar.drawRect(0, 0, barWidth * progress, barHeight);
		xpBar.endFill();
	}

	// Update notification system
	if (notifications.timeRemaining > 0) {
		notifications.timeRemaining -= delta;
		
		// Position in the middle of the screen
		notificationText.text = notifications.currentMessage;
		notificationText.x = gameState.camera.x + window.innerWidth / 2;
		notificationText.y = gameState.camera.y + 100;
		notificationText.alpha = Math.min(1, notifications.timeRemaining / 500);
	} else {
		notificationText.text = '';
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

	levelText.x = gameState.camera.x + UI.TEXT.X_OFFSET;
	levelText.y = gameState.camera.y + UI.STATS_PANEL.Y_OFFSET + UI.TEXT.X_OFFSET + UI.TEXT.SPACING * 4;

	xpText.x = gameState.camera.x + UI.TEXT.X_OFFSET;
	xpText.y = gameState.camera.y + UI.STATS_PANEL.Y_OFFSET + UI.TEXT.X_OFFSET + UI.TEXT.SPACING * 5;

	xpBar.x = gameState.camera.x + UI.TEXT.X_OFFSET;
	xpBar.y = gameState.camera.y + UI.STATS_PANEL.Y_OFFSET + UI.TEXT.X_OFFSET + UI.TEXT.SPACING * 6;

	return world;
}
