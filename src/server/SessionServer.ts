// src/server/SessionServer.ts
import express from "express";
import session from "express-session";
import { DQNAgent } from "../rl/DQNAgent";
import { MerchantStoryEnv } from "../environment/MerchantStoryEnv";
import { Transition } from "../model/types";

/**
 * A minimal approach to session-based training:
 * We store agent + environment in the session.
 * Real apps might store them in a DB or a global in-memory map keyed by sessionId.
 */

const app = express();
app.use(express.json());

// We use in-memory session, do NOT use this for production.
app.use(session({
  secret: "someSecret",
  resave: false,
  saveUninitialized: true
}));

// Each user gets a brand-new agent & environment when they visit
app.post("/start", (req, res) => {
  if (!req.session) {
    return res.status(500).send("Session error");
  }
  // Create agent
  const inputDim = 5;  // branchId(1) + userFeatures(2) + timeSpent(1) + correctness(1)
  const outputDim = 6; // up to 6 possible branches
  const agent = new DQNAgent(inputDim, outputDim, 1000);
  const env = new MerchantStoryEnv(2, 5); // userFeatureDim=2, maxSteps=5 for easy

  req.session.agent = agent;
  req.session.env = env;
  req.session.episodeStep = 0;

  const initState = env.reset();
  res.json({
    message: "Session started",
    state: initState
  });
});

// The user or system calls /step with an action
app.post("/step", async (req, res) => {
  if (!req.session || !req.session.agent || !req.session.env) {
    return res.status(400).send("No session with agent/env found. Call /start first.");
  }

  const agent: DQNAgent = req.session.agent;
  const env: MerchantStoryEnv = req.session.env;

  const { action } = req.body;
  if (typeof action !== "number") {
    return res.status(400).send("Invalid action");
  }

  // Get current state
  const state = env.getState(); // we can expose a getState() method if not public
  const { nextState, reward, done } = env.step(action);

  // Store transition in agent
  agent.observe({
    state,
    action,
    reward,
    nextState,
    done
  });

  // train on a small batch
  await agent.trainBatch(16);

  req.session.episodeStep += 1;

  res.json({
    nextState,
    reward,
    done
  });
});

// The user can ask the agent for an action if we want
app.get("/chooseAction", (req, res) => {
  if (!req.session || !req.session.agent || !req.session.env) {
    return res.status(400).send("No session with agent/env found.");
  }
  const agent: DQNAgent = req.session.agent;
  const env: MerchantStoryEnv = req.session.env;
  const state = env.getState();

  const action = agent.chooseAction(state);
  res.json({ action });
});

export function startServer(port: number) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
