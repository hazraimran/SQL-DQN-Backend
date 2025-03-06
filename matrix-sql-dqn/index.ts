import * as tf from "@tensorflow/tfjs-node";
import { Pool } from "pg";
import readline from "readline";
import { easyQueries } from "./resources/easy_queries";  // <-- Make sure you have this import

/**
 * -----------------------------------------------------
 * 1. DATA & STORYLINE
 * -----------------------------------------------------
 */

/**
 * The story is segmented by difficulty:
 * Easy, Medium, Hard
 * 
 * Each difficulty corresponds to certain SQL concepts:
 *   Easy: Basic SELECT, FROM, WHERE ... 
 *   Medium: JOINs, GROUP BY, Subqueries
 *   Hard: Window functions, CTEs, advanced subqueries, transactions
 *
 * We provide an example "branching" approach: each difficulty has 2 sub-branches
 * that lead to a final outcome. The user can pick an action 0 or 1 at each step,
 * and we simulate whether it leads to high correctness or not.
 *
 * We'll store the storyline in a small data structure. It's just for demonstration.
 */

interface DifficultyInfo {
  name: string;
  maxSteps: number;      // how many steps per difficulty
  passThreshold: number; // correctness threshold to pass
  scenario: string;      // description
}

const DIFFICULTIES: DifficultyInfo[] = [
  {
    name: "Easy",
    maxSteps: 3,
    passThreshold: 0.7,
    scenario: `
EASY LEVEL: Identifying Rebels
Neo identifies potential rebels in the residue table. We do basic SQL queries
(SELECT, FROM, WHERE) to list them.
`
  },
  {
    name: "Medium",
    maxSteps: 4,
    passThreshold: 0.5,
    scenario: `
MEDIUM LEVEL: The Keymaker's Puzzle
Morpheus needs mission data from 'archives' and 'mission_logs' tables. We do a JOIN and GROUP BY.
`
  },
  {
    name: "Hard",
    maxSteps: 5,
    passThreshold: 0.7,
    scenario: `
HARD LEVEL: Agent Smith's Replication
We investigate advanced concepts: Window functions, CTEs, transactions.
`
  }
];

/**
 * We define a small "branching" for each difficulty:
 *   We'll just say each step has 2 possible actions: 0 or 1
 *   Some branches might have a higher chance of correctness improvement
 *   We'll track correctness in [0..1].
 */

/**
 * -----------------------------------------------------
 * 2. ENVIRONMENT (One Class)
 * -----------------------------------------------------
 * We'll define an environment that:
 *   - Tracks the current difficulty
 *   - Tracks the step count within that difficulty
 *   - Tracks correctness in [0..1]
 *   - Accepts an action 0 or 1. We then do a random check
 *     if correctness improves or not, based on the "concept" logic.
 *   - Terminates after maxSteps for that difficulty.
 */

interface EnvState {
  difficultyIndex: number; // 0=Easy,1=Med,2=Hard
  stepCount: number;
  correctness: number;     // 0..1
}

const pool = new Pool({
  // Adapt to your own DB credentials
  user: "matrix_sql_dqn",
  host: "localhost",
  database: "matrix_game",
  password: "matrix_sql_dqn",
  port: 5432
});

// Utility: prompt the user for SQL input
function promptUserForQuery(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Utility: compare actual rows with expected
function compareRows(actual: any[], expected: any[]): boolean {
  // console.log("Actual rows:", actual);
  // console.log("Expected rows:", expected);
  if (actual.length !== expected.length) return false;
  // Simple check if JSON-serialized arrays match
  return JSON.stringify(actual) === JSON.stringify(expected);
}

class MatrixSQLEnvironment {
  private currentState: EnvState;
  private done: boolean;

  constructor(private difficultyIndex: number) {
    this.currentState = {
      difficultyIndex,
      stepCount: 0,
      correctness: 0
    };
    this.done = false;
  }

  public reset(): EnvState {
    this.currentState.stepCount = 0;
    this.currentState.correctness = 0;
    this.done = false;
    return { ...this.currentState };
  }

  /**
   * step(action: number) => (nextState, reward, done)
   * We'll treat 'action' as picking sub-branch 0 or 1.
   * Then we do a random simulation of correctness gains.
   */
  public step(action: number): {
    nextState: EnvState;
    reward: number;
    done: boolean;
  } {
    if (this.done) {
      // environment is already done
      return {
        nextState: { ...this.currentState },
        reward: 0,
        done: true
      };
    }
    const info = DIFFICULTIES[this.currentState.difficultyIndex];
    // We'll define chance of correctness improvement if user picks the "good" sub-branch
    // e.g. action=0 might yield a lesser improvement than action=1 or vice versa
    // We'll randomize it for demonstration
    const baseChance = (action === 0) ? 0.3 : 0.6; 
    // e.g. action=1 is "reading official docs," more likely to help correctness
    const success = (Math.random() < baseChance);
    let correctnessDelta = 0;
    if (success) {
      correctnessDelta = 0.2 + Math.random() * 0.1; 
      // each success can raise correctness by 0.2..0.3
    }
    const oldCorrectness = this.currentState.correctness;
    let newCorrectness = oldCorrectness + correctnessDelta;
    if (newCorrectness > 1) newCorrectness = 1;

    // define a reward = 3*(delta correctness)
    const reward = 3 * (newCorrectness - oldCorrectness);

    // increment step
    this.currentState.stepCount++;
    this.currentState.correctness = newCorrectness;

    // check if done
    if (this.currentState.stepCount >= info.maxSteps) {
      this.done = true;
    }

    return {
      nextState: { ...this.currentState },
      reward,
      done: this.done
    };
  }

  public async stepWithUserInput(expectedRows: any[]): Promise<{
    nextState: EnvState;
    reward: number;
    done: boolean;
  }> {
    if (this.done) {
      return {
        nextState: { ...this.currentState },
        reward: 0,
        done: true
      };
    }

    // 1. Get user query
    const userQuery = await promptUserForQuery("Enter your SQL query: ");
    let rows: any[] = [];

    // 2. Run query
    try {
      const res = await pool.query(userQuery);
      rows = res.rows;
    } catch (err) {
      console.log("Query error:", err);
    }

    // 3. Compare rows with expected
    const matched = compareRows(rows, expectedRows);

    // 4. Update correctness (negative if incorrect)
    const oldCorrectness = this.currentState.correctness;
    // For example, +0.3 on success, -0.1 on failure
    let correctnessDelta = matched ? 0.3 : -0.1;
    let newCorrectness = oldCorrectness + correctnessDelta;

    // Clamp the correctness in [0,1]
    if (newCorrectness < 0) newCorrectness = 0;
    if (newCorrectness > 1) newCorrectness = 1;
    this.currentState.correctness = newCorrectness;

    this.currentState.stepCount++;
    if (this.currentState.stepCount >= DIFFICULTIES[this.currentState.difficultyIndex].maxSteps) {
      this.done = true;
    }

    // Negative reward if correctnessDelta < 0
    const reward = 3 * correctnessDelta;

    return {
      nextState: { ...this.currentState },
      reward,
      done: this.done
    };
  }

  public isDone(): boolean {
    return this.done;
  }

  public getState(): EnvState {
    return { ...this.currentState };
  }
}

/**
 * We'll represent the state to the RL agent as a numeric array:
 * [ difficultyIndex, stepCount, correctness ]
 */

/**
 * -----------------------------------------------------
 * 3. REPLAY BUFFER
 * -----------------------------------------------------
 */

interface Transition {
  state: number[];
  action: number;
  reward: number;
  nextState: number[];
  done: boolean;
}

class ReplayBuffer {
  private buffer: Transition[];
  private capacity: number;
  private position: number;

  constructor(capacity: number) {
    this.buffer = [];
    this.capacity = capacity;
    this.position = 0;
  }

  public push(transition: Transition) {
    if (this.buffer.length < this.capacity) {
      this.buffer.push(transition);
    } else {
      this.buffer[this.position] = transition;
    }
    this.position = (this.position + 1) % this.capacity;
  }

  public sample(batchSize: number): Transition[] {
    const result: Transition[] = [];
    for (let i = 0; i < batchSize; i++) {
      const idx = Math.floor(Math.random() * this.buffer.length);
      result.push(this.buffer[idx]);
    }
    return result;
  }

  public size(): number {
    return this.buffer.length;
  }
}

/**
 * -----------------------------------------------------
 * 4. Q-NETWORK
 * -----------------------------------------------------
 * We'll define a small feed-forward net. Input = 3 dims,
 * output = 2 possible actions (0 or 1).
 */

class QNetwork {
  private model: tf.LayersModel;
  private inputDim: number;
  private outputDim: number;

  constructor(inputDim: number, outputDim: number) {
    this.inputDim = inputDim;
    this.outputDim = outputDim;
    this.model = this.buildModel();
  }

  buildModel(): tf.LayersModel {
    const model = tf.sequential();
    model.add(tf.layers.dense({
      units: 16,
      inputShape: [this.inputDim],
      activation: "relu"
    }));
    model.add(tf.layers.dense({
      units: 16,
      activation: "relu"
    }));
    model.add(tf.layers.dense({
      units: this.outputDim,
      activation: "linear"
    }));
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: "meanSquaredError"
    });
    return model;
  }

  predict(states: number[][]): tf.Tensor2D {
    return tf.tidy(() => {
      const inputTensor = tf.tensor2d(states, [states.length, this.inputDim]);
      const output = this.model.predict(inputTensor) as tf.Tensor2D;
      return output;
    });
  }

  async trainOnBatch(states: number[][], targets: number[][]) {
    const xs = tf.tensor2d(states, [states.length, this.inputDim]);
    const ys = tf.tensor2d(targets, [states.length, this.outputDim]);
    return this.model.fit(xs, ys, {
      epochs: 1,
      verbose: 0
    });
  }

  public getModel(): tf.LayersModel {
    return this.model;
  }
}

/**
 * -----------------------------------------------------
 * 5. DQN AGENT
 * -----------------------------------------------------
 * We have:
 *  - QNetwork and a targetNetwork
 *  - Epsilon-greedy policy
 *  - ReplayBuffer
 */

class DQNAgent {
  private qNetwork: QNetwork;
  private targetNetwork: QNetwork;
  private replayBuffer: ReplayBuffer;

  private gamma: number;
  private epsilon: number;
  private epsilonMin: number;
  private epsilonDecay: number;
  private stepCounter: number;
  private updateTargetSteps: number;

  constructor(
    inputDim: number,
    outputDim: number,
    replayCapacity: number,
    gamma = 0.99,
    epsilon = 1.0,
    epsilonMin = 0.01,
    epsilonDecay = 0.995,
    updateTargetSteps = 50
  ) {
    this.qNetwork = new QNetwork(inputDim, outputDim);
    this.targetNetwork = new QNetwork(inputDim, outputDim);
    this.copyWeightsToTarget();

    this.replayBuffer = new ReplayBuffer(replayCapacity);

    this.gamma = gamma;
    this.epsilon = epsilon;
    this.epsilonMin = epsilonMin;
    this.epsilonDecay = epsilonDecay;
    this.stepCounter = 0;
    this.updateTargetSteps = updateTargetSteps;
  }

  public chooseAction(stateArr: number[]): number {
    if (Math.random() < this.epsilon) {
      // random
      return Math.floor(Math.random() * 2); // 2 actions: 0 or 1
    } else {
      const pred = this.qNetwork.predict([stateArr]);
      const data = pred.dataSync();
      // data is length 2
      let bestA = 0;
      let bestVal = data[0];
      for (let i = 1; i < data.length; i++) {
        if (data[i] > bestVal) {
          bestVal = data[i];
          bestA = i;
        }
      }
      pred.dispose();
      return bestA;
    }
  }

  public observe(transition: Transition) {
    this.replayBuffer.push(transition);
    this.stepCounter++;
    if (this.epsilon > this.epsilonMin) {
      this.epsilon *= this.epsilonDecay;
    }
    // update target net occasionally
    if (this.stepCounter % this.updateTargetSteps === 0) {
      this.copyWeightsToTarget();
    }
  }

  public async trainBatch(batchSize: number) {
    if (this.replayBuffer.size() < batchSize) return;

    const transitions = this.replayBuffer.sample(batchSize);
    // we build (states, targetQ)
    const states = transitions.map(t => t.state);
    const nextStates = transitions.map(t => t.nextState);

    const qPred = this.qNetwork.predict(states);
    const qNext = this.targetNetwork.predict(nextStates);

    const qPredVals = await qPred.array();
    const qNextVals = await qNext.array();

    const targetVals = qPredVals.map((row, idx) => {
      const t = transitions[idx];
      const updatedRow = [...row];
      if (t.done) {
        updatedRow[t.action] = t.reward;
      } else {
        const maxNext = Math.max(...qNextVals[idx]);
        updatedRow[t.action] = t.reward + this.gamma * maxNext;
      }
      return updatedRow;
    });

    await this.qNetwork.trainOnBatch(states, targetVals);

    qPred.dispose();
    qNext.dispose();
  }

  private copyWeightsToTarget() {
    const mainWeights = this.qNetwork.getModel().getWeights();
    this.targetNetwork.getModel().setWeights(mainWeights);
  }
}

/**
 * -----------------------------------------------------
 * 6. MAIN LOGIC:
 *    We'll loop over difficulties: Easy->Medium->Hard
 *    For each difficulty, we create an environment & run episodes
 *    If correctness < passThreshold, we repeat.
 * -----------------------------------------------------
 */

async function runGame() {
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

      // Create environment for this difficulty
      const env = new MatrixSQLEnvironment(diffIndex);
      env.reset();

      if (diffInfo.name === "Easy") {
        // CUSTOM LOGIC FOR EASY LEVEL:
        //  0. Ignore the usual max steps
        //  1. Read each query in order from easy_queries
        //  2. If correctness >= passThreshold, move on to next difficulty
        //  3. Else keep reading until no more queries remain

        // Gather all query names in an array
        const queryNames = Object.keys(easyQueries) as Array<keyof typeof easyQueries>;
        for (let i = 0; i < queryNames.length && !success; i++) {
          const testCase = easyQueries[queryNames[i]];
          console.log(testCase);
          // stepWithUserInput: we pass in testCase.expected as the “correct” rows
          const { nextState, reward } = await env.stepWithUserInput(testCase.expected);

          // Build state array
          const s = nextState;
          const stateArr = [s.difficultyIndex, s.stepCount, s.correctness];

          // RL agent logic
          const action = agent.chooseAction(stateArr);
          agent.observe({
            state: stateArr,
            action,
            reward,
            nextState: stateArr,
            done: false // we let our logic manually decide when to succeed
          });
          await agent.trainBatch(batchSize);

          // Check correctness
          if (nextState.correctness >= diffInfo.passThreshold) {
            success = true;
            console.log(
              `  => Completed [${diffInfo.name}] with correctness = ${nextState.correctness.toFixed(2)}`
            );
          } else {
            console.log(
              `  => Query [${queryNames[i]}], correctness = ${nextState.correctness.toFixed(2)} (continuing...)`
            );
          }
        }
      } else {
        // ORIGINAL LOGIC FOR MEDIUM/HARD
        // Use the existing code that checks maxSteps, etc.
        let done = false;
        while (!done) {
          // Example expected rows for demonstration
          const expectedRows = [{ id: 1, name: "Neo", status: "PotentialRebel" }];
          const { nextState, reward, done: isDone } = await env.stepWithUserInput(expectedRows);

          const s = nextState;
          const stateArr = [s.difficultyIndex, s.stepCount, s.correctness];

          const action = agent.chooseAction(stateArr);
          agent.observe({ state: stateArr, action, reward, nextState: stateArr, done: isDone });
          await agent.trainBatch(batchSize);

          done = isDone;
        }

        // Check correctness after environment is done
        const finalState = env.getState();
        if (finalState.correctness >= diffInfo.passThreshold) {
          success = true;
          console.log(`  => Completed [${diffInfo.name}] with correctness = ${finalState.correctness.toFixed(2)}`);
        } else {
          console.log(`  => Retrying [${diffInfo.name}], correctness = ${finalState.correctness.toFixed(2)}`);
        }
      }
    }

    if (!success) {
      console.log(`User failed to pass [${diffInfo.name}] after ${maxTries} attempts. We'll move on but note suboptimal performance.`);
    }
  }

  console.log("\n=== All difficulties complete ===\n");
}

/**
 * We'll create a small CLI runner that calls runGame().
 */
async function main() {
  console.log("WELCOME TO THE MATRIX SQL GAME");
  console.log("We'll run an RL simulation with correctness as the only metric.\n");
  await runGame();

  console.log("Done. Press Enter to exit...");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question("", () => {
    rl.close();
    process.exit(0);
  });
}

main().catch(err => console.error(err));
