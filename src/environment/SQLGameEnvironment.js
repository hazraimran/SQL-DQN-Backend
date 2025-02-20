"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLGameEnvironment = void 0;
const StorylineManager_1 = require("../storyline/StorylineManager");
const PuzzleGenerator_1 = require("../puzzle/PuzzleGenerator");
class SQLGameEnvironment {
    constructor() {
        this.storylineManager = new StorylineManager_1.StorylineManager();
        this.puzzleGenerator = new PuzzleGenerator_1.PuzzleGenerator();
        // Initialize with a default
        this.currentState = {
            role: 0,
            storylineStage: 0,
            sqlSkill: 0,
            engagementTime: 0,
            puzzleDifficulty: 0,
        };
    }
    reset() {
        // Start: random role 0 or 1
        const role = Math.random() < 0.5 ? 0 : 1;
        const stage = 0;
        const skill = 0;
        const engagementTime = 0;
        const puzzleDifficulty = 0; // start with EASY
        this.currentState = { role, storylineStage: stage, sqlSkill: skill, engagementTime, puzzleDifficulty };
        return this.currentState;
    }
    step(action, userQuery = null) {
        let { role, storylineStage: stage, sqlSkill: skill, engagementTime: time, puzzleDifficulty: diff } = this.currentState;
        let reward = 0;
        let done = false;
        switch (action) {
            case 0:
                // 0: Present puzzle at current difficulty
                const puzzlePrompt = this.puzzleGenerator.generatePuzzlePrompt(role, diff);
                if (userQuery) {
                    // Evaluate user-submitted query
                    const isCorrect = this.puzzleGenerator.evaluateUserQuery(userQuery, role, puzzlePrompt);
                    if (isCorrect) {
                        skill = Math.min(skill + 1, SQLGameEnvironment.MAX_SKILL);
                        reward += 10; // correct query => bigger reward
                    }
                    else {
                        reward += 2; // partial reward for attempt
                    }
                }
                else {
                    // If no userQuery is given, we can treat as attempt/fail or skip
                    reward += 1;
                }
                // Increase engagement time (spent on puzzle)
                time = Math.min(time + 5, SQLGameEnvironment.MAX_TIME);
                break;
            case 1:
                // 1: Provide practice storyline at same difficulty
                this.storylineManager.addPracticeArc(role, stage, diff);
                time = Math.min(time + 3, SQLGameEnvironment.MAX_TIME);
                reward += 5;
                break;
            case 2:
                // 2: Increase difficulty or move storyline forward (if skill is high)
                if (diff < 2) {
                    diff++;
                    reward += 3;
                }
                else {
                    stage = Math.min(stage + 1, SQLGameEnvironment.MAX_STAGE);
                    reward += 5;
                }
                time = Math.min(time + 2, SQLGameEnvironment.MAX_TIME);
                break;
            case 3:
                // 3: Move to next big event
                stage = this.storylineManager.goToNextBigEvent(stage);
                if (stage >= SQLGameEnvironment.MAX_STAGE) {
                    done = true;
                    reward += 20; // big finale bonus
                }
                else {
                    reward += 8;
                }
                time = Math.min(time + 4, SQLGameEnvironment.MAX_TIME);
                break;
            default:
                // no-op
                break;
        }
        // Update current state
        this.currentState = {
            role,
            storylineStage: stage,
            sqlSkill: skill,
            engagementTime: time,
            puzzleDifficulty: diff,
        };
        return {
            nextState: { ...this.currentState },
            reward,
            done,
        };
    }
    getCurrentState() {
        return this.currentState;
    }
}
exports.SQLGameEnvironment = SQLGameEnvironment;
SQLGameEnvironment.MAX_STAGE = 5;
SQLGameEnvironment.MAX_SKILL = 5;
SQLGameEnvironment.MAX_TIME = 200;
