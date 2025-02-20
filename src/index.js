"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./database/db");
const SQLGameEnvironment_1 = require("./environment/SQLGameEnvironment");
const QLearningAgent_1 = require("./rl/QLearningAgent");
/**
 * Minimal demonstration of the RL training loop in TypeScript.
 * This does not handle concurrency or a real-time multi-user interface.
 */
async function main() {
    // Connect to MongoDB (optional in MVP, but included to illustrate usage)
    await (0, db_1.default)();
    // Create environment
    const env = new SQLGameEnvironment_1.SQLGameEnvironment();
    // We must define how many states exist, for Q-table dimensions:
    // role(2) * stage(6) * skill(6) * time(201) * diff(3) = 2 * 6 * 6 * 201 * 3 = 43236
    const numStates = 2 * 6 * 6 * 201 * 3;
    const numActions = 4; // as defined in environment (0..3)
    // RL hyperparams
    const alpha = 0.1;
    const gamma = 0.95;
    const epsilon = 1.0;
    const epsilonDecay = 0.99;
    const epsilonMin = 0.01;
    // Create agent
    const agent = new QLearningAgent_1.QLearningAgent(env, numStates, numActions, alpha, gamma, epsilon, epsilonDecay, epsilonMin);
    // Train
    const episodes = 1000;
    console.log("Training Q-Learning agent for", episodes, "episodes...");
    agent.train(episodes);
    console.log("Training done.");
    // DEMO RUN: illustrate how we might do a quick "game" run
    // with best actions from the Q-table (greedy).
    const testRuns = 3;
    for (let i = 0; i < testRuns; i++) {
        let state = env.reset();
        let done = false;
        let steps = 0;
        console.log(`\n--- DEMO RUN #${i + 1} ---`);
        while (!done) {
            // We'll pick the best action from Q-table
            const currentIndex = encodeStateForDemo(agent, state);
            const action = bestActionFromQ(agent.getQTable()[currentIndex]);
            // For demonstration, we skip real user queries. 
            // If you had a user query, you'd call env.step(action, userQuery).
            const stepResult = env.step(action);
            console.log(`Step=${steps}, Action=${action}, Reward=${stepResult.reward}, NextState=${JSON.stringify(stepResult.nextState)}`);
            state = stepResult.nextState;
            done = stepResult.done;
            steps++;
        }
    }
}
// Utility for demonstration
function bestActionFromQ(actionValues) {
    let best = 0;
    let bestVal = actionValues[0];
    for (let i = 1; i < actionValues.length; i++) {
        if (actionValues[i] > bestVal) {
            best = i;
            bestVal = actionValues[i];
        }
    }
    return best;
}
// This must replicate the same state encoding logic used in QLearningAgent
function encodeStateForDemo(agent, s) {
    // In a real design, we might keep a consistent utility function to encode states
    // For now, let's replicate the logic or store it in a shared place
    const roleFactor = s.role;
    const stageFactor = s.storylineStage;
    const skillFactor = s.sqlSkill;
    const timeFactor = Math.min(s.engagementTime, 200);
    const diffFactor = s.puzzleDifficulty;
    let index = roleFactor;
    index += stageFactor * 2;
    index += skillFactor * 2 * 6;
    index += timeFactor * 2 * 6 * 6;
    index += diffFactor * 2 * 6 * 6 * 201;
    return index;
}
// Run main
main().catch((err) => console.error(err));
