import { defineQuery, hasComponent, defineSystem } from 'bitecs';
import { Graphics, Text, Application, TextStyle, Container } from 'pixi.js';
import { Player, Health, Velocity, PickupRange, Experience } from '../components';
import { UI } from '../constants';
import type { World } from '../types';
import { getPlayerDamageBoost } from './collectible';
import { EnemyType } from '../entities/enemy';

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
 */
export function createUI(uiStage: Container) {
	// Create stats panel background
	statsContainer = new Graphics();
	statsContainer.beginFill(UI.STATS_PANEL.BACKGROUND_COLOR, UI.STATS_PANEL.BACKGROUND_ALPHA);
	statsContainer.drawRect(0, 0, UI.STATS_PANEL.WIDTH, UI.STATS_PANEL.HEIGHT);
	statsContainer.endFill();
	statsContainer.position.set(UI.STATS_PANEL.X_OFFSET, UI.STATS_PANEL.Y_OFFSET);

	// Create text elements for stats with a common style
	const textStyle = new TextStyle({
		fontFamily: UI.TEXT.FONT_FAMILY,
		fontSize: UI.TEXT.FONT_SIZE,
		fill: UI.TEXT.COLOR,
		align: 'left' as const
	});

	// Create each text element with its initial text
	healthText = new Text('Health: 0/0', textStyle);
	speedText = new Text('Speed: 0', textStyle);
	damageText = new Text('Damage: 0', textStyle);
	rangeText = new Text('Range: 0', textStyle);
	levelText = new Text('Level: 1', textStyle);
	xpText = new Text('XP: 0/0', textStyle);

	// Create XP bar
	xpBar = new Graphics();

	// Create notification text with larger font size
	notificationText = new Text('', new TextStyle({
		...textStyle,
		align: 'center' as const,
		fontSize: UI.TEXT.FONT_SIZE * 1.5
	}));
	notificationText.alpha = 0;

	// Position elements within the stats container
	const padding = 10;
	healthText.position.set(padding, padding);
	speedText.position.set(padding, padding + UI.TEXT.SPACING);
	damageText.position.set(padding, padding + UI.TEXT.SPACING * 2);
	rangeText.position.set(padding, padding + UI.TEXT.SPACING * 3);
	levelText.position.set(padding, padding + UI.TEXT.SPACING * 4);
	xpText.position.set(padding, padding + UI.TEXT.SPACING * 5);
	xpBar.position.set(padding, padding + UI.TEXT.SPACING * 6);

	// Add elements to stats container
	statsContainer.addChild(healthText);
	statsContainer.addChild(speedText);
	statsContainer.addChild(damageText);
	statsContainer.addChild(rangeText);
	statsContainer.addChild(levelText);
	statsContainer.addChild(xpText);
	statsContainer.addChild(xpBar);

	// Add containers to UI stage
	uiStage.addChild(statsContainer);
	uiStage.addChild(notificationText);

	// Position notification text in center of screen
	notificationText.position.set(0, 100); // Y position from top
}

export const uiSystem = defineSystem((world: World, { app }: { app: Application }): World => {
	// Get player entity
	const players = playerQuery(world);
	if (players.length === 0) return world;

	const player = players[0];

	// Update health display
	healthText.text = `Health: ${Health.current[player]}/${Health.max[player]}`;

	// Update speed display
	if (hasComponent(world, Velocity, player)) {
		speedText.text = `Speed: ${Velocity.speed[player].toFixed(2)}`;
	}

	// Update damage display
	const damageBoost = getPlayerDamageBoost();
	damageText.text = `Damage: ${(1 + damageBoost).toFixed(1)}`;

	// Update range display
	if (hasComponent(world, PickupRange, player)) {
		rangeText.text = `Range: ${PickupRange.radius[player].toFixed(0)}`;
	}

	// Update level and XP display
	if (hasComponent(world, Experience, player)) {
		const level = Experience.level[player];
		const currentXP = Experience.current[player];
		const nextLevelXP = Experience.nextLevel[player];

		levelText.text = `Level: ${level}`;
		xpText.text = `XP: ${currentXP}/${nextLevelXP}`;

		// Update XP bar
		const xpProgress = currentXP / nextLevelXP;
		xpBar.clear();
		xpBar.beginFill(0x00FF00);
		xpBar.drawRect(0, 0, (UI.STATS_PANEL.WIDTH - 20) * xpProgress, 10);
		xpBar.endFill();
	}

	// Handle notifications
	if (notifications.timeRemaining > 0) {
		notificationText.text = notifications.currentMessage;
		notificationText.alpha = Math.min(notifications.timeRemaining / 500, 1);
		notificationText.position.set(
			(app.screen.width - notificationText.width) / 2,
			100
		);
		notifications.timeRemaining -= 16.67; // Roughly one frame at 60fps
	} else {
		notificationText.alpha = 0;
	}

	return world;
});
