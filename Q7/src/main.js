import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es';
import { BowlingScorecard } from './scoring.js';
import { BowlingGame } from './game/BowlingGame.js';
import { GameUI } from './ui/GameUI.js';

// --- GLOBAL VARIABLES ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
const scorecard = new BowlingScorecard();
const gameUI = new GameUI(scorecard);
const bowlingGame = new BowlingGame(scene, world, scorecard, gameUI);

// Camera tracking variables
let isTrackingBall = false;
let cameraTargetPosition = new THREE.Vector3();
let cameraTargetLookAt = new THREE.Vector3();
const cameraOffset = new THREE.Vector3(0, 6, 6); // Behind and above the ball at elevated height
const cameraLerpSpeed = 0.05;

// --- INITIALIZATION ---
function init() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x87CEEB, 1); // Sky blue background
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Make canvas focusable
    renderer.domElement.tabIndex = 0;
    renderer.domElement.style.outline = 'none';
    
    document.body.appendChild(renderer.domElement);
    
    // Focus the canvas so it can receive keyboard events
    renderer.domElement.focus();
    
    // Camera - positioned behind the ball for aiming, moderate height for good lane view
    camera.position.set(0, 3, 5);
    camera.lookAt(0, 0, -15);

    // Load assets and start game
    bowlingGame.loadAssets().then(() => {
        bowlingGame.setup();
        animate();
    });

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- CAMERA TRACKING FUNCTIONS ---
function startBallTracking() {
    isTrackingBall = true;
    console.log('Camera started tracking ball');
}

function stopBallTracking() {
    isTrackingBall = false;
    // Smoothly return to default position
    cameraTargetPosition.set(3, 2.5, 4);
    cameraTargetLookAt.set(3, 1, -5);
    console.log('Camera stopped tracking ball');
}

function updateCameraTracking() {
    if (isTrackingBall && bowlingGame.bowlingBall && bowlingGame.bowlingBall.body) {
        const ballPosition = bowlingGame.bowlingBall.body.position;
        const ballVelocity = bowlingGame.bowlingBall.body.velocity;
        const ballSpeed = ballVelocity.length();
        
        // Dynamic camera offset based on ball speed
        let dynamicOffset = cameraOffset.clone();
        if (ballSpeed > 3) {
            // When ball is moving fast, stay further back and higher
            dynamicOffset.z = 8;
            dynamicOffset.y = 7;
            dynamicOffset.x = 0;
        } else if (ballSpeed > 1) {
            // Medium speed - closer tracking
            dynamicOffset.z = 7;
            dynamicOffset.y = 6.5;
        } else {
            // Slow speed - close tracking
            dynamicOffset.z = 6;
            dynamicOffset.y = 6;
        }
        
        // Calculate desired camera position (behind and above the ball)
        cameraTargetPosition.copy(ballPosition);
        cameraTargetPosition.add(dynamicOffset);
        
        // Look ahead of the ball based on its velocity
        cameraTargetLookAt.copy(ballPosition);
        if (ballSpeed > 0.7) {
            const lookAhead = new THREE.Vector3(ballVelocity.x, ballVelocity.y, ballVelocity.z);
            lookAhead.normalize().multiplyScalar(Math.min(ballSpeed * 0.8, 4));
            cameraTargetLookAt.add(lookAhead);
        }
        
        // Keep camera height reasonable and avoid going below ground
        cameraTargetPosition.y = Math.max(cameraTargetPosition.y, 1.5);
        cameraTargetLookAt.y = Math.max(cameraTargetLookAt.y, 0.5);
    }
    
    // Smoothly interpolate camera position with speed-based lerp speed
    const currentLerpSpeed = isTrackingBall ? cameraLerpSpeed * 1.5 : cameraLerpSpeed;
    camera.position.lerp(cameraTargetPosition, currentLerpSpeed);
    
    // Smooth look-at transition
    const tempTarget = new THREE.Vector3();
    tempTarget.lerpVectors(
        camera.position.clone().add(camera.getWorldDirection(new THREE.Vector3())),
        cameraTargetLookAt,
        currentLerpSpeed
    );
    camera.lookAt(tempTarget);
}

// --- ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    updateCameraTracking();
    bowlingGame.update();
    renderer.render(scene, camera);
}

// --- MAKE CAMERA FUNCTIONS GLOBALLY ACCESSIBLE ---
window.startBallTracking = startBallTracking;
window.stopBallTracking = stopBallTracking;

// --- START THE APPLICATION ---
init();