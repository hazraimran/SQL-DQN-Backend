"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QLearning = void 0;
/**
 * Manages a Q-table for discrete states and actions.
 * The developer must define how to "encode" a GameState to a single integer index.
 */
class QLearning {
    constructor(numStates, numActions, alpha, gamma, epsilon, epsilonDecay, epsilonMin) {
        this.numStates = numStates;
        this.numActions = numActions;
        this.alpha = alpha;
        this.gamma = gamma;
        this.epsilon = epsilon;
        this.epsilonDecay = epsilonDecay;
        this.epsilonMin = epsilonMin;
        this.qTable = Array.from({ length: numStates }, () => Array(numActions).fill(0));
    }
    chooseAction(stateIndex) {
        // Epsilon-greedy
        if (Math.random() < this.epsilon) {
            return Math.floor(Math.random() * this.numActions);
        }
        return this.argMax(this.qTable[stateIndex]);
    }
    updateQ(currentStateIndex, action, reward, nextStateIndex, done) {
        const oldValue = this.qTable[currentStateIndex][action];
        let nextMax = 0;
        if (!done) {
            const bestNext = this.argMax(this.qTable[nextStateIndex]);
            nextMax = this.qTable[nextStateIndex][bestNext];
        }
        const newValue = oldValue + this.alpha * (reward + this.gamma * nextMax - oldValue);
        this.qTable[currentStateIndex][action] = newValue;
    }
    decayEpsilon() {
        if (this.epsilon > this.epsilonMin) {
            this.epsilon *= this.epsilonDecay;
        }
    }
    argMax(arr) {
        let bestIndex = 0;
        let bestVal = arr[0];
        for (let i = 1; i < arr.length; i++) {
            if (arr[i] > bestVal) {
                bestVal = arr[i];
                bestIndex = i;
            }
        }
        return bestIndex;
    }
    getQTable() {
        return this.qTable;
    }
}
exports.QLearning = QLearning;
