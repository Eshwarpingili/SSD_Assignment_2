// --- DOM Element References --- //
const statusDisplay = document.getElementById('status-display'); // Gets the status message display element
const playerChoiceDisplay = document.getElementById('player-choice'); // Gets the element to show the player's choice
const computerChoiceDisplay = document.getElementById('computer-choice'); // Gets the element to show the computer's choice
const playerScoreDisplay = document.getElementById('player-score'); // Gets the display for the player's score
const computerScoreDisplay = document.getElementById('computer-score'); // Gets the display for the computer's score
const goButton = document.getElementById('go-btn'); // Gets the player's "Go" button
const stopButton = document.getElementById('stop-btn'); // Gets the player's "Stop" button
const resetButton = document.getElementById('reset-btn'); // Gets the "Reset Game" button

// --- Game State Variables --- //
let playerScore = 0; // Initializes player's score to 0
let computerScore = 0; // Initializes computer's score to 0

// --- Event Listeners --- //
goButton.addEventListener('click', () => playRound('Go')); // Calls playRound with 'Go' when the Go button is clicked
stopButton.addEventListener('click', () => playRound('Stop')); // Calls playRound with 'Stop' when the Stop button is clicked
resetButton.addEventListener('click', resetGame); // Calls the resetGame function when the reset button is clicked

// --- Game Logic Functions --- //

/**
 * Executes a single round of the game with balanced risk/reward.
 * @param {string} playerChoice - The choice made by the player ('Go' or 'Stop').
 */
function playRound(playerChoice) {
    // Computer's move (Nash Equilibrium: 50/50 random choice)
    const computerChoice = Math.random() < 0.5 ? 'Go' : 'Stop'; // Generates 'Go' or 'Stop' randomly

    // Display choices made by player and computer
    playerChoiceDisplay.textContent = `You chose: ${playerChoice}`; // Shows the player's choice on screen
    computerChoiceDisplay.textContent = `Computer chose: ${computerChoice}`; // Shows the computer's choice on screen

    // Determine the outcome based on a balanced payoff matrix
    if (playerChoice === 'Go' && computerChoice === 'Stop') {
        // Player wins big for being aggressive when the path is clear
        playerScore += 2;
        statusDisplay.textContent = 'Clear path! You gain 2 points.';
    } else if (playerChoice === 'Stop' && computerChoice === 'Go') {
        // Computer wins big
        computerScore += 2;
        statusDisplay.textContent = 'Computer went ahead! It gains 2 points.';
    } else if (playerChoice === 'Go' && computerChoice === 'Go') {
        // A crash is a major penalty for both players
        playerScore -= 5;
        computerScore -= 5;
        statusDisplay.textContent = 'CRASH! Both lose 5 points.';
    } else { // This condition covers when both chose 'Stop'
        // A standoff (gridlock) is a minor penalty for being too cautious
        playerScore -= 1;
        computerScore -= 1;
        statusDisplay.textContent = 'Gridlock. Both lose 1 point.';
    }

    // Update the score display on the screen
    updateScores();
}

/**
 * Updates the score text on the webpage.
 */
function updateScores() {
    playerScoreDisplay.textContent = `Player: ${playerScore}`; // Updates the player's score display
    computerScoreDisplay.textContent = `Computer: ${computerScore}`; // Updates the computer's score display
}

/**
 * Resets the game to its initial state.
 */
function resetGame() {
    playerScore = 0; // Resets player's score to 0
    computerScore = 0; // Resets computer's score to 0
    statusDisplay.textContent = 'Choose Go or Stop'; // Resets the status message
    playerChoiceDisplay.textContent = ''; // Clears the player choice text
    computerChoiceDisplay.textContent = ''; // Clears the computer choice text
    updateScores(); // Updates the score display to show the reset scores
}

