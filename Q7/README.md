# Bowling Alley Game

Welcome to the Bowling Alley Game project! This project is a simple bowling game implemented using Three.js for 3D rendering and Cannon.js for physics simulation. 

## Project Structure

The project is organized as follows:

```
bowling-alley-game
├── src
│   ├── main.js                # Entry point for the game
│   ├── scoring.js             # Manages scoring logic
│   ├── game
│   │   ├── BowlingGame.js     # Main game logic
│   │   ├── BowlingLane.js     # Represents the bowling lane
│   │   ├── BowlingBall.js     # Represents the bowling ball
│   │   └── BowlingPin.js      # Represents individual bowling pins
│   ├── physics
│   │   └── PhysicsWorld.js    # Sets up the physics world
│   ├── utils
│   │   └── AssetLoader.js      # Utility functions for loading assets
│   └── ui
│       ├── GameUI.js          # Manages the user interface
│       └── styles.css         # CSS styles for the UI
├── models
│   ├── bowling_pin.glb        # 3D model of a bowling pin
│   └── Bowling_ball.glb       # 3D model of a bowling ball
├── public
│   └── index.html             # Main HTML file for the application
├── package.json                # npm configuration file
└── README.md                   # Project documentation
```

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd bowling-alley-game
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Run the application**:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000` to play the game!

## Game Rules

- The game consists of 10 frames.
- In each frame, the player has two chances to knock down 10 pins.
- If all pins are knocked down on the first throw, it is called a "strike."
- If all pins are knocked down after the second throw, it is called a "spare."
- The score is calculated based on the number of pins knocked down and bonuses for strikes and spares.

Enjoy playing the Bowling Alley Game!