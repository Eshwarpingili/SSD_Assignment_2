import * as CANNON from 'cannon-es';

class PhysicsWorld {
    constructor() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0); // Set gravity
    }

    addBody(body) {
        this.world.addBody(body);
    }

    removeBody(body) {
        this.world.removeBody(body);
    }

    step(timeStep) {
        this.world.step(timeStep);
    }
}

export { PhysicsWorld };