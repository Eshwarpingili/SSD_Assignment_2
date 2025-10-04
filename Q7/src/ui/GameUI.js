class GameUI {
    constructor(scorecard) {
        this.scorecard = scorecard;
        this.scoreboardElement = document.getElementById('game-status');
        this.throwButton = null;
        this.directionSlider = null;
        this.powerValue = 50;
        this.direction = 0;
        this.isChargingPower = false;
        this.powerChargeInterval = null;
        this.initialize();
        this.setupControls();
    }

    initialize() {
        this.scoreboardElement.innerHTML = `
            <h3>🎳 Bowling Game</h3>
            <p><strong>Frame:</strong> 1 / 10</p>
            <p><strong>Roll:</strong> 1</p>
            <p><strong>Total Score:</strong> 0</p>
        `;
    }

    setupControls() {
        // Get references to control elements
        this.throwButton = document.getElementById('throw-button');
        this.directionSlider = document.getElementById('direction-slider');
        this.powerValueElement = document.getElementById('power-value');
        this.powerFillElement = document.getElementById('power-fill');
        this.directionValueElement = document.getElementById('direction-value');
        
        // Setup direction slider listener
        if (this.directionSlider) {
            this.directionSlider.addEventListener('input', () => {
                this.direction = parseInt(this.directionSlider.value);
                this.updateDirectionDisplay();
            });
        }
    }

    getPower() {
        return this.powerValue;
    }

    getDirection() {
        return this.direction;
    }

    setPower(power) {
        this.powerValue = Math.max(10, Math.min(100, power));
        this.updatePowerDisplay();
    }

    setDirection(direction) {
        this.direction = Math.max(-30, Math.min(30, direction));
        if (this.directionSlider) {
            this.directionSlider.value = this.direction;
        }
        this.updateDirectionDisplay();
    }

    updatePowerDisplay() {
        if (this.powerValueElement) {
            this.powerValueElement.textContent = this.powerValue + '%';
        }
        if (this.powerFillElement) {
            this.powerFillElement.style.width = this.powerValue + '%';
        }
    }

    updateDirectionDisplay() {
        if (this.directionValueElement) {
            this.directionValueElement.textContent = this.direction + '°';
        }
    }

    startPowerCharge() {
        if (this.isChargingPower) return;
        
        this.isChargingPower = true;
        this.powerValue = 10; // Start at minimum
        
        this.powerChargeInterval = setInterval(() => {
            if (this.powerValue < 100) {
                this.powerValue += 2; // Increase by 2% every interval
                this.updatePowerDisplay();
            }
        }, 50); // Update every 50ms for smooth charging
    }

    stopPowerCharge() {
        this.isChargingPower = false;
        if (this.powerChargeInterval) {
            clearInterval(this.powerChargeInterval);
            this.powerChargeInterval = null;
        }
        return this.powerValue;
    }

    setThrowEnabled(enabled) {
        if (this.throwButton) {
            this.throwButton.disabled = !enabled;
            this.throwButton.textContent = enabled ? 'THROW BALL' : 'WAIT...';
        }
    }

    updateDisplay() {
        const state = this.scorecard.getCurrentState();
        const currentFrame = state.currentFrameIndex + 1;
        const currentRoll = state.currentRoll + 1;
        const lastFrame = state.frames[Math.max(0, state.currentFrameIndex - 1)];
        const totalScore = lastFrame ? lastFrame.totalScore : 0;

        this.scoreboardElement.innerHTML = `
            <h3>🎳 Bowling Game</h3>
            <p><strong>Frame:</strong> ${Math.min(currentFrame, 10)} / 10</p>
            <p><strong>Roll:</strong> ${currentRoll} ${state.isGameOver ? '(Final)' : ''}</p>
            <p><strong>Total Score:</strong> ${totalScore}</p>
            <p><strong>Power:</strong> ${this.getPower()}% | <strong>Direction:</strong> ${this.getDirection()}°</p>
            ${state.isGameOver ? '<p style="color: yellow; font-weight: bold;">🏆 GAME OVER!</p>' : '<p style="color: #90EE90;">Ready to throw!</p>'}
        `;
    }

    resetUI() {
        this.initialize();
    }
}

export { GameUI };