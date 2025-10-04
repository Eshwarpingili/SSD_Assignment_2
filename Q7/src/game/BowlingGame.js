import * as THREE from 'three';
import { BowlingBall } from './BowlingBall.js';
import { BowlingPin } from './BowlingPin.js';
import { BowlingLane } from './BowlingLane.js';
import { AssetLoader } from '../utils/AssetLoader.js';

class BowlingGame {
    constructor(scene, world, scorecard, gameUI) {
        this.scene = scene;
        this.world = world;
        this.scorecard = scorecard;
        this.gameUI = gameUI;
        this.pins = [];
        this.bowlingBall = null;
        this.lane = null;
        this.canThrow = true;
        this.assetLoader = new AssetLoader();
        this.ballIsMoving = false;
    }

    async loadAssets() {
        // Load 3D models
        await this.assetLoader.loadModels();
    }

    setup() {
        console.log('Setting up bowling game...');
        this.lane = new BowlingLane(this.scene, this.world);
        console.log('Lane created');
        
        this.bowlingBall = new BowlingBall(this.scene, this.world);
        console.log('Bowling ball created');
        
        this.setupPins();
        console.log('Pins setup complete');
        
        this.setupLighting();
        console.log('Lighting setup complete');
        
        this.setupAimHelper();
        console.log('Aim helper created');
        
        this.setupEventListeners();
        console.log('Event listeners setup complete');
        
        console.log('Game setup finished - ready to play!');
    }

    setupAimHelper() {
        // Create aim line to show direction
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0.05, 1.5),
            new THREE.Vector3(0, 0.05, -14)
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0xff0000, 
            transparent: true, 
            opacity: 0.6,
            linewidth: 2
        });
        this.aimLine = new THREE.Line(lineGeometry, lineMaterial);
        this.scene.add(this.aimLine);
        
        // Create power indicator around the ball
        const powerGeometry = new THREE.RingGeometry(0.12, 0.18, 16);
        const powerMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            transparent: true, 
            opacity: 0.7 
        });
        this.powerIndicator = new THREE.Mesh(powerGeometry, powerMaterial);
        this.powerIndicator.position.set(0, 0.01, 1.5);
        this.powerIndicator.rotation.x = -Math.PI / 2;
        this.scene.add(this.powerIndicator);
    }

    setupPins() {
        // Standard 10-pin bowling formation at regulation distance (60 feet from foul line)
        // Pins are 12 inches apart, arranged in equilateral triangle
        const pinSpacing = 0.305; // 12 inches in meters
        const pinAreaZ = -14.3; // 47 feet from start (60 feet from foul line)
        
        const pinPositions = [
            // Back row (4 pins) - pins 7, 8, 9, 10
            { x: -pinSpacing * 1.5, z: pinAreaZ }, 
            { x: -pinSpacing * 0.5, z: pinAreaZ }, 
            { x: pinSpacing * 0.5, z: pinAreaZ }, 
            { x: pinSpacing * 1.5, z: pinAreaZ },
            // Third row (3 pins) - pins 4, 5, 6
            { x: -pinSpacing, z: pinAreaZ + pinSpacing * 0.866 }, 
            { x: 0.0, z: pinAreaZ + pinSpacing * 0.866 }, 
            { x: pinSpacing, z: pinAreaZ + pinSpacing * 0.866 },
            // Second row (2 pins) - pins 2, 3
            { x: -pinSpacing * 0.5, z: pinAreaZ + pinSpacing * 1.732 }, 
            { x: pinSpacing * 0.5, z: pinAreaZ + pinSpacing * 1.732 },
            // Front row (1 pin) - pin 1 (head pin)
            { x: 0.0, z: pinAreaZ + pinSpacing * 2.598 }
        ];

        console.log('Setting up', pinPositions.length, 'bowling pins at regulation distance');
        pinPositions.forEach((pos, index) => {
            const pin = new BowlingPin(this.scene, this.world, pos.x, pos.z);
            this.pins.push(pin);
            console.log(`Pin ${index + 1} created at position:`, pos);
        });
        console.log('Total pins created:', this.pins.length);
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }

    setupEventListeners() {
        // Add keydown event for controls
        window.addEventListener('keydown', (event) => {
            if (!this.canThrow) return; // Ignore inputs while ball is moving
            
            switch(event.code) {
                case 'Space':
                    event.preventDefault();
                    if (!this.gameUI.isChargingPower) {
                        console.log('Started charging power...');
                        this.gameUI.startPowerCharge();
                    }
                    break;
                    
                case 'ArrowLeft':
                    event.preventDefault();
                    const currentDir = this.gameUI.getDirection();
                    this.gameUI.setDirection(currentDir - 2);
                    console.log('Direction adjusted left:', this.gameUI.getDirection());
                    break;
                    
                case 'ArrowRight':
                    event.preventDefault();
                    const currentDirRight = this.gameUI.getDirection();
                    this.gameUI.setDirection(currentDirRight + 2);
                    console.log('Direction adjusted right:', this.gameUI.getDirection());
                    break;
            }
        });
        
        // Add keyup event for space release
        window.addEventListener('keyup', (event) => {
            if (event.code === 'Space' && this.gameUI.isChargingPower) {
                event.preventDefault();
                const finalPower = this.gameUI.stopPowerCharge();
                console.log('Power charged to:', finalPower);
                this.handleThrow();
            }
        });

        // Add throw button click event (backup method)
        const throwButton = document.getElementById('throw-button');
        if (throwButton) {
            throwButton.addEventListener('click', () => {
                console.log('Throw button clicked');
                this.handleThrow();
            });
        }
    }

    handleThrow() {
        console.log('handleThrow called, canThrow:', this.canThrow);
        if (!this.canThrow) {
            console.log('Cannot throw right now');
            return;
        }

        // Get power and direction from UI
        const power = this.gameUI.getPower();
        const direction = this.gameUI.getDirection();
        
        console.log(`Throwing ball with power: ${power}%, direction: ${direction}°`);
        
        // Disable throw button during throw
        this.gameUI.setThrowEnabled(false);
        
        // Hide aim helpers during throw
        if (this.aimLine) this.aimLine.visible = false;
        if (this.powerIndicator) this.powerIndicator.visible = false;
        
        // Throw ball with specified power and direction
        this.bowlingBall.throw(power, direction);
        this.canThrow = false;
        this.ballIsMoving = true;
        
        // Start camera tracking
        if (window.startBallTracking) {
            window.startBallTracking();
        }

        // Check for roll completion after a delay
        setTimeout(() => {
            this.checkRollCompletion();
        }, 5000);
    }

    checkRollCompletion() {
        const fallenPins = this.pins.filter(pin => pin.isDown());
        const pinsDownCount = fallenPins.length;

        console.log(`Roll completed: ${pinsDownCount} pins knocked down`);
        this.scorecard.recordRoll(pinsDownCount);
        this.gameUI.updateDisplay();
        
        // Reset for next roll
        setTimeout(() => {
            this.resetForNextRoll();
        }, 3000); // Give more time to see the result
    }

    resetForNextRoll() {
        console.log('Resetting for next roll');
        this.bowlingBall.reset();
        this.pins.forEach(pin => pin.reset());
        this.canThrow = true;
        
        // Stop camera tracking and return to default view
        this.ballIsMoving = false;
        if (window.stopBallTracking) {
            window.stopBallTracking();
        }
        
        // Re-enable throw button and show aim helpers
        this.gameUI.setThrowEnabled(true);
        this.gameUI.updateDisplay();
        
        // Show aim helpers again
        if (this.aimLine) this.aimLine.visible = true;
        if (this.powerIndicator) this.powerIndicator.visible = true;
        
        console.log('Ready for next throw');
    }

    updateAimHelpers() {
        if (!this.canThrow) return; // Don't show helpers while ball is moving
        
        const power = this.gameUI.getPower();
        const direction = this.gameUI.getDirection();
        
        // Update aim line direction
        if (this.aimLine) {
            const directionRad = (direction * Math.PI) / 180;
            const laneLength = 15.5; // From ball to pins
            const endX = Math.sin(directionRad) * 3; // More pronounced direction
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0.05, 1.5),
                new THREE.Vector3(endX, 0.05, -14)
            ]);
            this.aimLine.geometry.dispose();
            this.aimLine.geometry = lineGeometry;
        }
        
        // Update power indicator size and color
        if (this.powerIndicator) {
            const powerScale = (power / 100) * 2 + 0.5; // 0.5 to 2.5 scale
            this.powerIndicator.scale.set(powerScale, powerScale, powerScale);
            
            // Color based on power (green to red)
            const powerRatio = power / 100;
            const red = powerRatio;
            const green = 1 - powerRatio;
            this.powerIndicator.material.color.setRGB(red, green, 0);
        }
    }

    update() {
        // Update physics
        this.world.step(1/60);
        
        // Update game objects
        if (this.bowlingBall) this.bowlingBall.update();
        this.pins.forEach(pin => pin.update());
        
        // Update visual aim helpers
        this.updateAimHelpers();
    }
}

export { BowlingGame };