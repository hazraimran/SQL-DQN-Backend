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

  const inputDim = 10;   // [mastery*10]
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
    const env = new MatrixSQLEnvironment(10, pool);
    env.reset();

    while (!success) {
      // const queryIds = Object.keys(easyQueries).map(key => parseInt(key)) as (keyof typeof easyQueries)[];
      // for (const queryName of queryNames) {
        // 1) Grab the old state BEFORE stepping
        const oldEnvState = env.getState();
        const oldStateArr = oldEnvState.mastery;
        // [
        //   oldEnvState.mastery,
        //   oldEnvState.stepCount,
        //   oldEnvState.correctness
        // ];
        
        // 2) Agent chooses an action
        const action = agent.chooseAction(oldStateArr);
        console.log(`\nChose action: ${action}`);

        // 3) Agent steps in the environment
        const query = easyQueries[action as keyof typeof easyQueries];
        console.log(`\nQuery: [${action} - ${query.branchName}]: ${query.storyNarrative}`);

        const { nextState, reward } = await env.stepWithUserInput(action, query.expected);
        // const newStateArr = [nextState.difficultyIndex, nextState.stepCount, nextState.correctness];

        // 4) Observe the transition
        agent.observe({ state: oldStateArr, action, reward, nextState: nextState.mastery });

        await agent.trainBatch(batchSize);

        const masteryAction = nextState.mastery[action];
        console.log(`Current mastery of Query ${action}: ${masteryAction.toFixed(2)}`);
  
        // Move on once mastery is over 90%
        if (nextState.done) {
          success = true;
          console.log(`  => Completed [${diffInfo.name}] with mastery = ${(nextState.mastery.reduce((a, b) => a+b) / nextState.mastery.length).toFixed(2)}`);
          break;
        // } else {
        //   console.log(`  => Query [${query.branchId} - ${queryName}], correctness = ${correctness.toFixed(2)} (continuing...)`);
        }
      // }
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