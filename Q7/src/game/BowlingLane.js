import * as THREE from 'three';
import * as CANNON from 'cannon-es';

class BowlingLane {
    constructor(scene, physicsWorld) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.laneMesh = null;
        this.createLane();
    }

    createLane() {
        // Standard bowling lane dimensions: 60 feet long (18.3m), 3.5 feet wide (1.07m)
        const laneLength = 18.3; // 60 feet in meters
        const laneWidth = 1.07;  // 3.5 feet in meters
        
        // Visual Lane (Mesh)
        const laneGeometry = new THREE.BoxGeometry(laneWidth, 0.1, laneLength);
        const laneMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        this.laneMesh = new THREE.Mesh(laneGeometry, laneMaterial);
        this.laneMesh.position.set(0, -0.05, -laneLength/2 + 2); // Center the lane, start 2m from origin
        this.laneMesh.receiveShadow = true;
        this.scene.add(this.laneMesh);

        // Add lane markings
        this.addLaneMarkings(laneWidth, laneLength);

        // Physics Lane (Ground Body) - Use box instead of plane for better collision
        const groundShape = new CANNON.Box(new CANNON.Vec3(laneWidth/2, 0.05, laneLength/2));
        const groundBody = new CANNON.Body({ mass: 0 });
        groundBody.addShape(groundShape);
        groundBody.position.set(0, -0.1, -laneLength/2 + 2);
        groundBody.material = new CANNON.Material({ friction: 0.4, restitution: 0.3 });
        this.physicsWorld.addBody(groundBody);

        // Add side walls (gutters)
        this.createSideWalls(laneWidth, laneLength);
    }

    addLaneMarkings(laneWidth, laneLength) {
        // Add foul line
        const foulLineGeometry = new THREE.BoxGeometry(laneWidth, 0.01, 0.05);
        const foulLineMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        const foulLine = new THREE.Mesh(foulLineGeometry, foulLineMaterial);
        foulLine.position.set(0, 0.01, 1.8); // 6 feet from start
        this.scene.add(foulLine);

        // Add arrows (targeting aids)
        for (let i = 0; i < 7; i++) {
            const arrowGeometry = new THREE.ConeGeometry(0.03, 0.1, 3);
            const arrowMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
            const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
            arrow.position.set((i - 3) * 0.15, 0.01, -2); // Spread arrows across lane
            arrow.rotation.x = Math.PI / 2;
            this.scene.add(arrow);
        }
    }

    createSideWalls(laneWidth, laneLength) {
        const gutterWidth = 0.23; // 9 inches
        const gutterDepth = 0.05; // 2 inches
        const wallHeight = 0.15;  // 6 inches
        
        // Left gutter and wall
        const leftGutterGeometry = new THREE.BoxGeometry(gutterWidth, gutterDepth, laneLength);
        const gutterMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const leftGutter = new THREE.Mesh(leftGutterGeometry, gutterMaterial);
        leftGutter.position.set(-(laneWidth/2 + gutterWidth/2), -gutterDepth/2, -laneLength/2 + 2);
        this.scene.add(leftGutter);

        const leftWallGeometry = new THREE.BoxGeometry(0.05, wallHeight, laneLength);
        const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
        const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
        leftWall.position.set(-(laneWidth/2 + gutterWidth + 0.025), wallHeight/2, -laneLength/2 + 2);
        this.scene.add(leftWall);

        // Right gutter and wall
        const rightGutter = new THREE.Mesh(leftGutterGeometry, gutterMaterial);
        rightGutter.position.set((laneWidth/2 + gutterWidth/2), -gutterDepth/2, -laneLength/2 + 2);
        this.scene.add(rightGutter);

        const rightWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
        rightWall.position.set((laneWidth/2 + gutterWidth + 0.025), wallHeight/2, -laneLength/2 + 2);
        this.scene.add(rightWall);

        // Physics bodies for walls
        const wallShape = new CANNON.Box(new CANNON.Vec3(0.025, wallHeight/2, laneLength/2));
        
        const leftWallBody = new CANNON.Body({ mass: 0 });
        leftWallBody.addShape(wallShape);
        leftWallBody.position.set(-(laneWidth/2 + gutterWidth + 0.025), wallHeight/2, -laneLength/2 + 2);
        this.physicsWorld.addBody(leftWallBody);

        const rightWallBody = new CANNON.Body({ mass: 0 });
        rightWallBody.addShape(wallShape);
        rightWallBody.position.set((laneWidth/2 + gutterWidth + 0.025), wallHeight/2, -laneLength/2 + 2);
        this.physicsWorld.addBody(rightWallBody);
    }
}

export { BowlingLane };