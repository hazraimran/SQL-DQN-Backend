import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Pool } = pg;
import { DIFFICULTIES} from "./shared/difficulties";
import { MatrixSQLEnvironment } from "./environment/MatrixSQLEnvironment";
import { DQNAgent } from "./agent/DQNAgent";
import { loadTransitionsFromCSV } from "./shared/utilities";
import { easyQueries } from "./resources/easy_queries";
import { argv } from "process";

async function preTrain(DQNAgent: DQNAgent) {
  console.log("Loading transitions from CSV...");
  const transitions = await loadTransitionsFromCSV("src/resources/generated_data.csv");
  console.log(`Loaded ${transitions.length} transitions.`);

  console.log("Starting offline training (10 epochs) with batchSize=32...");
  await DQNAgent.offlineTrain(transitions);
  console.log("Offline training complete.");
}

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
  const agent = new DQNAgent(inputDim, outputDim, 5000);  // 5000 transitions in replay buffer
  const batchSize = 16;
  const numQueryKinds = 10;
  
  if (argv.includes("--pretrain")) {
    await preTrain(agent);
  }

  for (let diffIndex = 0; diffIndex < DIFFICULTIES.length; diffIndex++) {
    const diffInfo = DIFFICULTIES[diffIndex];
    console.log(`\n=== Starting Difficulty: ${diffInfo.name} ===`);
    console.log(diffInfo.scenario);

    let success = false;
    const env = new MatrixSQLEnvironment(numQueryKinds, pool);
    env.reset();

    while (!success) {
      // 1) Grab the old state BEFORE stepping
      const oldState = env.getState();
      
      // 2) Agent chooses an action
      const action = agent.chooseAction(oldState.mastery);
      console.log(`\nChose action: ${action}`);

      // 3) Agent steps in the environment
      const query = easyQueries[action as keyof typeof easyQueries];
      console.log(`\nQuery: [${action} - ${query.branchName}]: ${query.storyNarrative}`);

      const { nextState, reward } = await env.stepWithUserInput(action, query.expected);

      // 4) Observe the transition
      agent.observe({ state: oldState, action, reward, nextState });

      await agent.trainBatch(batchSize);

      console.log(`Current mastery of Query ${action}: ${nextState.mastery[action].toFixed(2)}`);

      // Move on once mastery is over 80%, aka done
      if (nextState.done) {
        success = true;
        console.log(`  => Completed [${diffInfo.name}] with mastery = ${(nextState.mastery.reduce((a, b) => a+b) / nextState.mastery.length).toFixed(2)}`);
        break;
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