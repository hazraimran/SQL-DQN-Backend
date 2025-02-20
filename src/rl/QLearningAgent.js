"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QLearningAgent = void 0;
const QLearning_1 = require("./QLearning");
/**
 * QLearningAgent coordinates the environment and QLearning (Q-table).
 * We define a state-encoding function that flattens (GameState) to an integer.
 */
class QLearningAgent {
    constructor(environment, numStates, numActions, alpha, gamma, epsilon, epsilonDecay, epsilonMin) {
        this.environment = environment;
        this.numStates = numStates;
        this.numActions = numActions;
        this.qlearning = new QLearning_1.QLearning(numStates, numActions, alpha, gamma, epsilon, epsilonDecay, epsilonMin);
    }
    train(episodes) {
        for (let ep = 0; ep < episodes; ep++) {
            const initial = this.environment.reset();
            let currentIndex = this.encodeState(initial);
            let done = false;
            while (!done) {
                const action = this.qlearning.chooseAction(currentIndex);
                // For training, we don't pass actual user queries. We might simulate or pass null.
                // In real usage, you'd gather user input from a UI or test harness.
                const step = this.environment.step(action);
                const nextState = step.nextState;
                const reward = step.reward;
                done = step.done;
                const nextIndex = this.encodeState(nextState);
                this.qlearning.updateQ(currentIndex, action, reward, nextIndex, done);
                currentIndex = nextIndex;
            }
            this.qlearning.decayEpsilon();
        }
    }
    /**
     * For an actual user session, you'd use environment.step(action, userQuery),
     * capturing the user's actual SQL from a UI. Then let the environment produce
     * reward based on correctness.
     * The RL can keep updating Q-values over time (online learning).
     */
    encodeState(s) {
        // We'll define dimension ranges:
        // role: 2 (0..1)
        // storylineStage: 6 (0..5)
        // sqlSkill: 6 (0..5)
        // engagementTime: let's clamp to e.g. 201 possible values (0..200)
        // puzzleDifficulty: 3 (0..2)
        const roleFactor = s.role; // 0..1
        const stageFactor = s.storylineStage; // 0..5
        const skillFactor = s.sqlSkill; // 0..5
        const timeFactor = Math.min(s.engagementTime, 200); // clamp
        const diffFactor = s.puzzleDifficulty; // 0..2
        // Flatten:
        // index = role
        //       + stage * 2
        //       + skill * 2 * 6
        //       + timeFactor * 2 * 6 * 6
        //       + diffFactor * 2 * 6 * 6 * 201
        let index = roleFactor;
        index += stageFactor * 2;
        index += skillFactor * 2 * 6;
        index += timeFactor * 2 * 6 * 6;
        index += diffFactor * 2 * 6 * 6 * 201;
        return index;
    }
    getQTable() {
        return this.qlearning.getQTable();
    }
}
exports.QLearningAgent = QLearningAgent;
