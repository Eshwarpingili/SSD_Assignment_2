class BowlingScorecard {
    constructor() {
        this.frames = [];
        this.currentFrameIndex = 0;
        this.currentRoll = 0;
        this.isGameOver = false;

        // Initialize frames
        for (let i = 0; i < 10; i++) {
            this.frames.push({ roll1: 0, roll2: 0, roll3: 0, score: 0, totalScore: 0, isTenth: i === 9 });
        }
    }

    recordRoll(pinsDown) {
        if (this.isGameOver) return;

        const currentFrame = this.frames[this.currentFrameIndex];

        if (this.currentRoll === 0) {
            currentFrame.roll1 = pinsDown;
            if (pinsDown === 10 && this.currentFrameIndex < 9) {
                this.currentFrameIndex++;
                this.currentRoll = 0;
            } else {
                this.currentRoll++;
            }
        } else {
            currentFrame.roll2 = pinsDown;
            this.currentRoll = 0;
            this.currentFrameIndex++;

            // Handle spare
            if (currentFrame.roll1 + currentFrame.roll2 === 10 && this.currentFrameIndex < 9) {
                this.frames[this.currentFrameIndex].roll1 = 0; // Placeholder for bonus roll
            }
        }

        // Handle scoring
        this.calculateScores();

        // Check for game over
        if (this.currentFrameIndex === 10) {
            this.isGameOver = true;
        }

        return this.frames.filter(f => f.roll1 + f.roll2 < 10).length; // Return pins standing for next roll
    }

    calculateScores() {
        let totalScore = 0;

        for (let i = 0; i < this.frames.length; i++) {
            const frame = this.frames[i];
            frame.score = frame.roll1 + frame.roll2 + frame.roll3;

            // Add bonus for strikes and spares
            if (frame.roll1 === 10) { // Strike
                if (i + 1 < this.frames.length) {
                    frame.score += this.frames[i + 1].roll1 + (this.frames[i + 1].roll2 || 0);
                }
            } else if (frame.roll1 + frame.roll2 === 10) { // Spare
                if (i + 1 < this.frames.length) {
                    frame.score += this.frames[i + 1].roll1;
                }
            }

            totalScore += frame.score;
            frame.totalScore = totalScore;
        }
    }

    getCurrentState() {
        return {
            frames: this.frames,
            currentFrameIndex: this.currentFrameIndex,
            currentRoll: this.currentRoll,
            isGameOver: this.isGameOver,
        };
    }
}

export { BowlingScorecard };