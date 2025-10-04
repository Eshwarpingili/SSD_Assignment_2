import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class AssetLoader {
    constructor() {
        this.loader = new GLTFLoader();
    }

    async loadModels() {
        // Pre-load models if needed
        console.log('AssetLoader initialized');
    }

    loadModel(path) {
        return new Promise((resolve, reject) => {
            this.loader.load(
                path,
                (gltf) => resolve(gltf.scene),
                undefined,
                (error) => reject(error)
            );
        });
    }
}