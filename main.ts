import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";
import { DIFFICULTIES} from "./src/environment/difficulties";
import { MatrixSQLEnvironment } from "./src/environment/MatrixSQLEnvironment";
import { DQNAgent } from "./src/agent/DQNAgent";
import { loadTransitionsFromCSV } from "./src/shared/utilities";
import { easyQueries } from "./src/resources/easy_queries";


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
  const outputDim = 10;  // 10 possible actions
  const agent = new DQNAgent(inputDim, outputDim, 5000);
  const batchSize = 16;
  
  console.log("Loading transitions from CSV...");
  const transitions = await loadTransitionsFromCSV("src/resources/generated_data.csv");
  console.log(`Loaded ${transitions.length} transitions.`);

  console.log("Starting offline training (10 epochs) with batchSize=32...");
  await agent.offlineTrain(transitions);
  console.log("Offline training complete.");

  for (let diffIndex = 0; diffIndex < DIFFICULTIES.length; diffIndex++) {
    const diffInfo = DIFFICULTIES[diffIndex];
    console.log(`\n=== Starting Difficulty: ${diffInfo.name} ===`);
    console.log(diffInfo.scenario);

    let success = false;
    const env = new MatrixSQLEnvironment(diffIndex, pool);
    env.reset();

    while (!success) {
      const queryNames = Object.keys(easyQueries) as Array<keyof typeof easyQueries>;
      for (const queryName of queryNames) {
        // 1) Grab the old state BEFORE stepping
        const oldEnvState = env.getState();
        const oldStateArr = [
          oldEnvState.difficultyIndex,
          oldEnvState.stepCount,
          oldEnvState.correctness
        ];
        
        // 2) Agent chooses an action
        const action = agent.chooseAction(oldStateArr);
        console.log(`\nChose action: ${action}`);

        // 3) Agent steps in the environment
        const query = easyQueries[queryName];
        console.log(`\nQuery: [${queryName}]: ${query.storyNarrative}`);

        const { nextState, reward } = await env.stepWithUserInput(query.expected);
        const newStateArr = [nextState.difficultyIndex, nextState.stepCount, nextState.correctness];

        // 4) Observe the transition
        agent.observe({ state: oldStateArr, action, reward, nextState: newStateArr });

        await agent.trainBatch(batchSize);

        const correctness = nextState.correctness;
        console.log(`Current correctness: ${correctness.toFixed(2)}`);
  
        // Move on once correctness is enough
        if (correctness >= diffInfo.passThreshold) {
          success = true;
          console.log(`  => Completed [${diffInfo.name}] with correctness = ${correctness.toFixed(2)}`);
          break;
        } else {
          console.log(`  => Query [${query}], correctness = ${correctness.toFixed(2)} (continuing...)`);
        }
      }
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