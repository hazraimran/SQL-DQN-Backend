"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantStoryEnv = void 0;
const BranchGraph_1 = require("../model/BranchGraph");
class MerchantStoryEnv {
    // We'll track numeric values for timeSpent & correctness in the environment
    // Each step can update them. correctness is in range [0..1].
    constructor(userFeatureDim, maxStepsPerEpisode) {
        this.userFeatureDim = userFeatureDim;
        this.maxStepsPerEpisode = maxStepsPerEpisode;
        this.maxSteps = maxStepsPerEpisode;
        this.currentState = {
            branchId: 0,
            userFeatures: new Array(userFeatureDim).fill(0),
            timeSpent: 0,
            correctness: 0
        };
        this.stepsCount = 0;
    }
    reset() {
        this.stepsCount = 0;
        this.currentState = {
            branchId: 0, // start node
            userFeatures: new Array(this.userFeatureDim).fill(0),
            timeSpent: 0,
            correctness: 0
        };
        return this.getState();
    }
    step(action) {
        // "action" means "which next branch do we pick among the available next array"
        const node = BranchGraph_1.MERCHANT_BRANCH_GRAPH.find(n => n.id === this.currentState.branchId);
        if (!node) {
            // No such node found, end
            return {
                nextState: this.getState(),
                reward: 0,
                done: true
            };
        }
        if (node.next.length === 0) {
            // we've reached a terminal
            return {
                nextState: this.getState(),
                reward: 0,
                done: true
            };
        }
        // clamp action to [0..node.next.length-1]
        const actionIndex = Math.min(action, node.next.length - 1);
        const nextBranchId = node.next[actionIndex];
        // Update the "timeSpent" & "correctness" automatically
        // For example, we do a small random increase in timeSpent
        // and we see if the user "succeeds" or not for correctness
        const prevTime = this.currentState.timeSpent;
        const prevCorrectness = this.currentState.correctness;
        const deltaTime = Math.random() * 2; // e.g., user spent 0..2 additional minutes
        let correctnessDelta = 0;
        // Suppose there's a 30% chance user is correct
        // This is just a demonstration. In real code, you'd compute it from logs / tasks
        const success = Math.random() < 0.3;
        if (success) {
            // Weighted average update for correctness
            correctnessDelta = 0.1; // e.g. partial improvement
        }
        const newTime = prevTime + deltaTime;
        const newCorrectness = Math.min(1, prevCorrectness + correctnessDelta);
        // define reward
        const dTime = newTime - prevTime;
        const dCorr = newCorrectness - prevCorrectness;
        const reward = 2 * dCorr + 0.1 * dTime;
        // define next state's user features
        // just do random for demonstration
        const newUserFeatures = this.currentState.userFeatures.map(f => f + (Math.random() * 0.01));
        this.currentState = {
            branchId: nextBranchId,
            userFeatures: newUserFeatures,
            timeSpent: newTime,
            correctness: newCorrectness
        };
        this.stepsCount++;
        const done = (this.stepsCount >= this.maxSteps) || (node.next.length === 0);
        return {
            nextState: this.getState(),
            reward,
            done
        };
    }
    getState() {
        // return a copy
        return { ...this.currentState, userFeatures: [...this.currentState.userFeatures] };
    }
}
exports.MerchantStoryEnv = MerchantStoryEnv;
