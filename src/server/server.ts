// src/server/server.ts
import express from "express";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bodyParser from "body-parser";
import { DQNAgent } from "../agent/DQNAgent";
import { MatrixSQLEnvironment } from "../environment/MatrixSQLEnvironment";
import pg from "pg";
const { Pool } = pg;
import { Transition } from "../shared/types";
import { loadTransitionsFromCSV } from "../shared/utilities";
import { getGeneratedQuery } from "../shared/llmService";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In-memory singletons for demonstration
let agent: DQNAgent | null = null;
let env: MatrixSQLEnvironment | null = null;

async function preTrain(DQNAgent: DQNAgent) {
  console.log("Loading transitions from CSV...");
  const transitions = await loadTransitionsFromCSV("src/resources/generated_data.csv");
  console.log(`Loaded ${transitions.length} transitions.`);

  console.log("Starting offline training (10 epochs) with batchSize=32...");
  await DQNAgent.offlineTrain(transitions);
  console.log("Offline training complete.");
}

export async function startServer(port: number) {
  const app = express();
  app.use(bodyParser.json());

  // Serve the static frontend from /public
  app.use(express.static(join(__dirname, "../../public")));

  // Endpoint: set the game theme, schema and concepts
  app.post("/settings", async (req, res) => {
    const { theme, schema, concepts } = req.body;
    console.log("Received settings:", { theme, schema, concepts });
    // TODO: use these values as needed (store in DB, update in-memory, etc.)
    await getGeneratedQuery();
    return res.json({ status: "ok" });
  });

  // Example: create the environment + agent on server startup
  app.get("/api/init", async (req, res) => {
    // Suppose we have 10 query types:
    const numQueryTypes = 10;
    // Create environment (assuming you have a PG pool or similar)
    const pool = new Pool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_DATABASE
      });

    env = new MatrixSQLEnvironment(numQueryTypes, pool);
    env.reset();

    // create agent
    const inputDim = 10; // or how you define your mastery array dimension
    const outputDim = 10;
    agent = new DQNAgent(inputDim, outputDim, 5000);
    await preTrain(agent);
    
    res.json({ message: "Initialization done. Agent & Env created." });
  });

  // Endpoint: user submits an SQL query, environment steps
  app.post("/api/submitQuery", async (req, res) => {
    if (!agent || !env) {
      return res.status(400).json({ error: "Agent or Environment not initialized." });
    }

    const { userQuery } = req.body;

    // We might do env.stepWithUserInput(action, expectedRows). For demonstration,
    // let's define some placeholder expected rows, or read from a resource.
    const placeholderExpected: any[] = [];
    
    // Actually step the environment
    const oldState = env.getState();

    // 2) Agent chooses an action
    const action = agent.chooseAction(oldState.mastery);

    const { nextState, reward } = await env.stepWithUserInput(action, placeholderExpected, userQuery);

    // Observe transition
    const transition: Transition = {
      state: oldState,
      action,
      reward,
      nextState
    };
    agent.observe(transition);

    // Train
    await agent.trainBatch(16);

    // respond with updated mastery, reward, etc.
    res.json({
      newMastery: nextState.mastery,
      action,
      message: "Query processed"
    });
  });

  // Endpoint: ask agent to pick the best action given current mastery
  app.get("/api/getAction", (req, res) => {
    if (!agent || !env) {
      return res.status(400).json({ error: "Agent or Environment not initialized." });
    }
    const state = env.getState();
    const action = agent.chooseAction(state.mastery);
    res.json({ action });
  });

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
