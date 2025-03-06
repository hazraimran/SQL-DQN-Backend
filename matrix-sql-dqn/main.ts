import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";
import { DIFFICULTIES} from "./environment/difficulties";
import { MatrixSQLEnvironment } from "./environment/MatrixSQLEnvironment";
import { DQNAgent } from "./agent/DQNAgent";

async function runGame() {
  // Setup DB pool from .env
  const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_DATABASE
  });

  const inputDim = 3;   // [difficultyIndex, stepCount, correctness]
  const outputDim = 2;  // 2 possible actions
  const agent = new DQNAgent(inputDim, outputDim, 5000);
  const batchSize = 16;

  for (let diffIndex = 0; diffIndex < DIFFICULTIES.length; diffIndex++) {
    const diffInfo = DIFFICULTIES[diffIndex];
    console.log(`\n=== Starting Difficulty: ${diffInfo.name} ===`);
    console.log(diffInfo.scenario);

    let success = false;
    const maxTries = 3;
    let attemptCount = 0;

    while (!success && attemptCount < maxTries) {
      attemptCount++;
      console.log(`  Attempt #${attemptCount} for ${diffInfo.name}`);
      const env = new MatrixSQLEnvironment(diffIndex, pool);
      env.reset();

      let done = false;
      while (!done) {
        const expectedRows = [{ id: 1, name: "Neo", status: "PotentialRebel" }];
        const { nextState, reward, done: isDone } = await env.stepWithUserInput(expectedRows);
        const s = nextState;
        const stateArr = [s.difficultyIndex, s.stepCount, s.correctness];

        // The RL agent still chooses actions, but here
        // we're focusing on user queries for correctness
        const action = agent.chooseAction(stateArr);

        agent.observe({
          state: stateArr,
          action,
          reward,
          nextState: stateArr,
          done: isDone
        });
        await agent.trainBatch(batchSize);

        done = isDone;
      }

      const finalState = env.getState();
      if (finalState.correctness >= diffInfo.passThreshold) {
        success = true;
        console.log(`  => Completed [${diffInfo.name}] with correctness = ${finalState.correctness.toFixed(2)}`);
      } else {
        console.log(`  => Retrying [${diffInfo.name}], correctness = ${finalState.correctness.toFixed(2)}`);
      }
    }

    if (!success) {
      console.log(`User failed to pass [${diffInfo.name}] after ${maxTries} attempts. Moving on...`);
    }
  }

  console.log("\n=== All difficulties complete ===\n");
  await pool.end();
}

(async () => {
  console.log("WELCOME TO THE MATRIX SQL GAME\n");
  await runGame();
  process.exit(0);
})();