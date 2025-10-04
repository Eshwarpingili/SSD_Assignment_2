import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es';

class BowlingPin {
    constructor(scene, world, x, z) {
        this.scene = scene;
        this.world = world;
        this.mesh = null;
        this.body = null;
        this.initialPosition = { x, y: 0.5, z };
        this.createPin();
    }

    createPin() {
        // Create fallback pin immediately (skip model loading for now)
        this.createFallbackPin();
        
        // Create the physics body for the pin
        this.createPhysicsBody();
        
        // Try to load the pin model and replace fallback if successful
        const loader = new GLTFLoader();
        loader.load('./models/bowling_pin.glb', (gltf) => {
            // Remove fallback mesh
            if (this.mesh) {
                this.scene.remove(this.mesh);
            }
            
            this.mesh = gltf.scene;
            this.mesh.scale.set(0.1, 0.1, 0.1);
            this.mesh.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z);
            this.mesh.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            this.scene.add(this.mesh);
            console.log('GLTF pin model loaded successfully');
        }, undefined, (error) => {
            console.log('Using fallback pin (GLTF model not found):', error.message);
        });
    }

    createFallbackPin() {
        const pinGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.3, 8);
        const pinMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        this.mesh = new THREE.Mesh(pinGeometry, pinMaterial);
        this.mesh.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
        console.log('Fallback pin created at:', this.initialPosition);
    }

    createPhysicsBody() {
        const pinShape = new CANNON.Cylinder(0.05, 0.08, 0.3, 8);
        this.body = new CANNON.Body({ mass: 0.5 });
        this.body.addShape(pinShape);
        this.body.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z);
        this.body.material = new CANNON.Material({ friction: 0.4, restitution: 0.2 });
        this.world.addBody(this.body);
        console.log('Pin physics body created at:', this.initialPosition);
    }

    update() {
        if (this.body && this.mesh) {
            this.mesh.position.copy(this.body.position);
            this.mesh.quaternion.copy(this.body.quaternion);
        }
    }

    isDown() {
        // Check if pin is knocked down (y position low or tilted significantly)
        if (!this.body) return false;
        return this.body.position.y < 0.1 || Math.abs(this.body.quaternion.x) > 0.7 || Math.abs(this.body.quaternion.z) > 0.7;
    }

    reset() {
        if (this.body) {
            this.body.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z);
            this.body.velocity.set(0, 0, 0);
            this.body.angularVelocity.set(0, 0, 0);
            this.body.quaternion.set(0, 0, 0, 1);
        }
        if (this.mesh) {
            this.mesh.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z);
            this.mesh.quaternion.set(0, 0, 0, 1);
        }
    }
}

export { BowlingPin };