// src/cli/playCLI.ts

import prompts from "prompts";
import { startServer } from "../server/SessionServer";

// A minimal script that starts the server, then
// in the CLI, we let the user choose actions.

async function main() {
  // Start server on port 3000
  startServer(3000);
  console.log("Server running on port 3000. We'll now do a CLI flow...");

  // Start session with a fetch to /start
  const startRes = await fetch("http://localhost:3000/start", {
    method: "POST"
  });
  const startData = await startRes.json();
  let currentState = startData.state;
  console.log("Game started, initial state:", currentState);

  let done = false;
  while (!done) {
    // Ask the agent for recommended action
    const chooseRes = await fetch("http://localhost:3000/chooseAction");
    const chooseData = await chooseRes.json();
    const recommendedAction = chooseData.action;

    // Prompt the user if they want to follow recommended action or override
    const response = await prompts({
      type: "number",
      name: "userAction",
      message: `Current state:\n${JSON.stringify(currentState, null, 2)}\nRecommended action: ${recommendedAction}. Enter your chosen action:`
    });
    const userAction = response.userAction ?? recommendedAction;

    // Post /step
    const stepRes = await fetch("http://localhost:3000/step", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: userAction })
    });
    const stepData = await stepRes.json();
    console.log("Step result:", stepData);

    currentState = stepData.nextState;
    done = stepData.done;
  }
  console.log("Game ended. Final state:", currentState);
}

main().catch(console.error);
