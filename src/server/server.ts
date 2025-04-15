// src/server/server.ts
import express, { Request, Response , Application } from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { DQNAgent } from "../agent/DQNAgent";
import { MatrixSQLEnvironment } from "../environment/MatrixSQLEnvironment";
import pg from "pg";
const { Pool } = pg;
import { Transition } from "../types/types";
import { loadTransitionsFromCSV } from "../types/utilities";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In-memory singletons for demonstration
let agent: DQNAgent | null = null;
let env: MatrixSQLEnvironment | null = null;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_DATABASE
});

async function preTrain(DQNAgent: DQNAgent) {
  console.log("Loading transitions from CSV...");
  const transitions = await loadTransitionsFromCSV("src/resources/generated_data.csv");
  console.log(`Loaded ${transitions.length} transitions.`);

  console.log("Starting offline training (10 epochs) with batchSize=32...");
  await DQNAgent.offlineTrain(transitions);
  console.log("Offline training complete.");
}

async function initAgentEnv(numQueryTypes: number, pool: pg.Pool, preTrainAgent: boolean = true): Promise<number> {
  env = new MatrixSQLEnvironment(numQueryTypes, pool);
  env.reset();

  // create agent
  const inputDim = numQueryTypes;
  const outputDim = numQueryTypes;
  agent = new DQNAgent(inputDim, outputDim, 5000);
  if (preTrainAgent) {
    await preTrain(agent);
  }
  const oldState = env.getState();

  // 2) Agent chooses an action
  const action = agent.chooseAction(oldState.mastery);
  return action;
}

export async function startServer(port: number) {
  const app: Application = express();
  app.use(express.json());

  // Serve the static frontend from /views/pages
  app.use(express.static(join(__dirname, "../../public")));

  app.use("*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });

  // Endpoint: set the game concepts
  app.post("/setup-form", async (req: Request, res: Response) => {
    try {
      const { conceptsLength } = req.body;
      console.log("Received:", { conceptsLength });
      const action = await initAgentEnv(conceptsLength, pool);
      res.set("Access-Control-Allow-Origin", "*");
      res.json({ action });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: "Invalid request" });
    }
  });

  // Endpoint: user submits an SQL query, environment steps
  app.post("/submit-query", async (req: Request, res: Response) => {
    if (!agent || !env) {
      return res.status(400).json({ error: "Agent or Environment not initialized." });
    }
  
    const { userQuery, expected } = req.body;
    console.log("Received user query:", userQuery);
  
    try {
      // Execute the query with error handling
      const resultFromDB = await pool.query(userQuery);
      
      // Actually step the environment
      const oldState = env.getState();
  
      // 2) Agent chooses an action
      const action = agent.chooseAction(oldState.mastery);
      console.log("Agent chose action:", action);
      const { nextState, reward, correct } = await env.stepWithUserInput(action, expected, resultFromDB.rows);
  
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
  
      // respond with updated mastery, action, and the actual result from DB.
      res.json({
        newMastery: nextState.mastery,
        action,
        resultFromDB: resultFromDB.rows,
        correct,
      });
    } catch (error) {
      console.error("Database query error:", error);
      
      // Send an appropriate error response to the client
      return res.status(400).json({ 
        error: true,
        message: error instanceof Error ? error.message : "Unknown database error",
        type: "database_error"
      });
    }
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
