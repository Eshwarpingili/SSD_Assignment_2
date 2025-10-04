import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es';

class BowlingBall {
    constructor(scene, physicsWorld) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.mesh = null;
        this.body = null;
        this.initialize();
    }

    initialize() {
        // Load the bowling ball model and set up its physics body
        this.loadModel();
        this.createPhysicsBody();
    }

    loadModel() {
        // Create fallback ball immediately
        this.createFallbackBall();
        
        // Try to load the bowling ball model and replace fallback if successful
        const loader = new GLTFLoader();
        loader.load('./models/Bowling_ball.glb', (gltf) => {
            // Remove fallback mesh
            if (this.mesh) {
                this.scene.remove(this.mesh);
            }
            
            this.mesh = gltf.scene;
            this.mesh.scale.set(0.2, 0.2, 0.2);
            this.mesh.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            this.scene.add(this.mesh);
            console.log('GLTF ball model loaded successfully');
        }, undefined, (error) => {
            console.log('Using fallback ball (GLTF model not found):', error.message);
        });
    }

    createFallbackBall() {
        const geometry = new THREE.SphereGeometry(0.108, 32, 32); // Regulation size
        const material = new THREE.MeshPhongMaterial({ color: 0x333333 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 0.163, 1.5); // Initial position behind foul line
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
        console.log('Fallback bowling ball created at:', this.mesh.position);
    }

    createPhysicsBody() {
        // Create the physics body for the bowling ball
        const ballRadius = 0.108; // Regulation bowling ball radius (8.5 inches diameter)
        const ballShape = new CANNON.Sphere(ballRadius);
        this.body = new CANNON.Body({ mass: 7.26 }); // Regulation weight (16 pounds)
        this.body.addShape(ballShape);
        this.body.position.set(0, ballRadius + 0.05, 1.5); // Start behind foul line
        this.body.material = new CANNON.Material({ friction: 0.4, restitution: 0.3 });
        this.physicsWorld.addBody(this.body);
        
        console.log('Physics body created for bowling ball');
        console.log('Body position:', this.body.position);
        console.log('Body mass:', this.body.mass);
        console.log('Physics world body count:', this.physicsWorld.bodies.length);
    }

    throw(power = 50, direction = 0) {
        console.log(`BowlingBall.throw() called with power: ${power}%, direction: ${direction}°`);
        console.log('Ball body exists:', !!this.body);
        console.log('Ball mesh exists:', !!this.mesh);
        
        if (this.body) {
            console.log('Ball position before throw:', this.body.position);
            console.log('Ball mass:', this.body.mass);
            
            // Calculate power multiplier (10% to 100% of max force)
            const powerMultiplier = (power / 100) * 0.9 + 0.1; // 0.1 to 1.0
            
            // Calculate direction in radians
            const directionRad = (direction * Math.PI) / 180;
            
            // Base force values
            const baseForceZ = -15; // Forward force
            const maxSideForce = 3;  // Maximum sideways force
            
            // Calculate force components
            const forceZ = baseForceZ * powerMultiplier;
            const forceX = Math.sin(directionRad) * maxSideForce * powerMultiplier;
            
            console.log(`Calculated forces - X: ${forceX.toFixed(2)}, Z: ${forceZ.toFixed(2)}`);
            
            // Apply impulse for immediate effect
            const impulse = new CANNON.Vec3(forceX, 0, forceZ);
            this.body.applyImpulse(impulse);
            console.log('Impulse applied:', impulse);
            
            // Also set velocity directly as backup
            const velocityMultiplier = powerMultiplier * 0.8;
            this.body.velocity.set(
                forceX * 0.5, 
                0, 
                forceZ * velocityMultiplier
            );
            console.log('Velocity set to:', this.body.velocity);
            
            // Add some spin based on direction
            if (Math.abs(direction) > 5) {
                const spin = (direction > 0 ? 1 : -1) * powerMultiplier * 2;
                this.body.angularVelocity.set(0, spin, 0);
                console.log('Spin applied:', spin);
            }
        } else {
            console.error('Ball physics body not found!');
        }
    }

    reset() {
        // Reset the bowling ball to its initial position
        this.body.position.set(0, 0.163, 1.5); // Behind foul line
        this.body.velocity.set(0, 0, 0);
        this.body.angularVelocity.set(0, 0, 0);
        this.body.quaternion.set(0, 0, 0, 1);
        if (this.mesh) {
            this.mesh.position.copy(this.body.position);
            this.mesh.quaternion.copy(this.body.quaternion);
        }
    }

    update() {
        // Update the mesh position based on the physics body
        if (this.mesh && this.body) {
            this.mesh.position.copy(this.body.position);
            this.mesh.quaternion.copy(this.body.quaternion);
            
            // Track if ball has stopped moving
            const velocity = this.body.velocity.length();
            if (velocity < 0.1 && this.wasMoving) {
                console.log('Ball stopped moving');
                this.wasMoving = false;
            } else if (velocity > 0.1) {
                this.wasMoving = true;
            }
        }
    }

    isMoving() {
        return this.body && this.body.velocity.length() > 0.1;
    }
}

export { BowlingBall };