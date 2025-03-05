"use strict";
// src/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
const MerchantStoryEnv_1 = require("./environment/MerchantStoryEnv");
const DQNAgent_1 = require("./rl/DQNAgent");
const difficulties_1 = require("./config/difficulties");
/**
 * Offline demonstration of multi-difficulty progression:
 * For each difficulty, we run episodes until the user meets correctness threshold.
 * If correctness < threshold, we re-run the same difficulty. Then move on.
 */
async function main() {
    const userFeatureDim = 2;
    const maxBranches = 6; // the largest branch set from the graph (some nodes have up to 2 next edges)
    const inputDim = 1 + userFeatureDim + 2; // branchId + userFeatures + (timeSpent + correctness)
    // We'll store state as: [branchId, userFeatures..., timeSpent, correctness]
    // => number of userFeatures = 2
    // => total = 1 + 2 + 2 = 5
    // We'll do 6 as the output dimension if we want to be safe (some nodes won't need all 6)
    const outputDim = 6;
    const agent = new DQNAgent_1.DQNAgent(inputDim, outputDim, 2000 /* replayCapacity */);
    const trainingBatchSize = 16;
    for (let diffIndex = 0; diffIndex < difficulties_1.DIFFICULTIES.length; diffIndex++) {
        const config = difficulties_1.DIFFICULTIES[diffIndex];
        console.log(`Starting difficulty: ${config.name}`);
        // We'll keep trying episodes until correctness meets threshold or we do 5 tries max
        let success = false;
        const maxTries = 5;
        let tryCount = 0;
        while (!success && tryCount < maxTries) {
            tryCount++;
            console.log(` Episode #${tryCount} in ${config.name}`);
            // create environment
            const env = new MerchantStoryEnv_1.MerchantStoryEnv(userFeatureDim, config.maxSteps);
            let state = env.reset();
            let done = false;
            while (!done) {
                const action = agent.chooseAction(state);
                // environment step
                const { nextState, reward, done: isDone } = env.step(action);
                // store in replay
                agent.observe({
                    state,
                    action,
                    reward,
                    nextState,
                    done: isDone
                });
                await agent.trainBatch(trainingBatchSize);
                state = nextState;
                done = isDone;
            }
            // check final correctness
            if (state.correctness >= config.correctnessThreshold) {
                success = true;
                console.log(`  => Episode success in ${config.name}, correctness=${state.correctness.toFixed(2)}`);
            }
            else {
                console.log(`  => Episode repeat in ${config.name}, correctness=${state.correctness.toFixed(2)}`);
            }
        }
        if (!success) {
            console.log(`User couldn't progress after ${maxTries} tries in ${config.name}. Move on or stop? Stopping now.`);
            break;
        }
    }
    console.log("All done. Exiting.");
    // Optionally save model
    // e.g. agent.saveModel("file://./myModel")
}
main().catch(err => console.error(err));
