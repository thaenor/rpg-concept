import Phaser from 'phaser';
import { ChatInterface } from '../classes/ChatInterface.js';

export class Map extends Phaser.Scene {
    constructor() {
        super('Map');
        this.playerSpeed = 200;
        this.isChatting = false;
        this.chatDistance = 60; // Distance to trigger chat
    }

    create() {
        // --- Level Setup ---
        // Green background to signify grass/map
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x228b22).setOrigin(0, 0);

        // --- Player Setup ---
        // Create a placeholder player (Blue Square)
        this.player = this.add.rectangle(100, 100, 32, 32, 0x0000ff);

        // Enable physics (Body is added by physics.add.existing)
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        // --- NPC Setup ---
        this.npcs = this.physics.add.staticGroup();

        const npcSetup = [
            { x: 300, y: 300, color: 0xff0000, type: 'rectangle' }, // Red Square
            { x: 800, y: 150, color: 0x00ff00, type: 'circle' },    // Green Circle
            { x: 600, y: 500, color: 0x800080, type: 'triangle' }   // Purple Triangle
        ];

        npcSetup.forEach(config => {
            let npc;
            if (config.type === 'circle') {
                npc = this.add.circle(config.x, config.y, 16, config.color);
            } else if (config.type === 'triangle') {
                // Triangle points relative to center (0,0) being top-left of the bounds usually,
                // but for add.triangle it's x1,y1, etc relative to x,y if unchained?
                // Phaser.GameObjects.Triangle(scene, x, y, x1, y1, x2, y2, x3, y3, fillColor)
                // Let's make an equilateral-ish triangle
                npc = this.add.triangle(config.x, config.y, 0, 32, 16, 0, 32, 32, config.color);
            } else {
                npc = this.add.rectangle(config.x, config.y, 32, 32, config.color);
            }

            // The second parameter 'true' creates a Static Body, which generally cannot move.
            this.physics.add.existing(npc, true);

            // Adjust body for circle to be more accurate if needed,
            // but for simple static collision a box is often fine.
            // If we really want circle physics:
            if (config.type === 'circle') {
                npc.body.setCircle(16);
            }

            this.npcs.add(npc);
        });

        this.physics.add.collider(this.player, this.npcs);

        // --- Controls ---
        this.cursors = this.input.keyboard.createCursorKeys();

        this.add.text(16, 16, 'Use Arrow Keys to Move', { fontSize: '18px', fill: '#ffffff' });

        // --- Chat UI ---
        this.chatInterface = new ChatInterface(this);
    }

    update() {
        this.player.body.setVelocity(0);
        this.input.keyboard.removeCapture(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Prevent movement while typing in chat
        if (this.chatInterface.isInputActive()) {
            return;
        }

        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-this.playerSpeed);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(this.playerSpeed);
        }

        if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-this.playerSpeed);
        } else if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(this.playerSpeed);
        }

        // Normalize and scale velocity so diagonal movement isn't faster
        if (this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown) {
             this.player.body.velocity.normalize().scale(this.playerSpeed);
        }

        // --- Proximity Check for Chat ---
        let closestNpc = null;
        let minDist = Infinity;

        this.npcs.getChildren().forEach(npc => {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
            if (dist < minDist) {
                minDist = dist;
                closestNpc = npc;
            }
        });

        if (closestNpc && minDist < this.chatDistance) {
            if (!this.isChatting) {
                this.isChatting = true;
                this.chatInterface.show();
            }
        } else {
            if (this.isChatting) {
                this.isChatting = false;
                this.chatInterface.hide();
            }
        }
    }
}
