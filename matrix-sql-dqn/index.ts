import * as tf from "@tensorflow/tfjs-node";
import readline from "readline";

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
    passThreshold: 0.3,
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
      // create environment for this difficulty
      const env = new MatrixSQLEnvironment(diffIndex);
      env.reset();

      let done = false;
      while (!done) {
        // Build state array
        const s = env.getState();
        const stateArr = [s.difficultyIndex, s.stepCount, s.correctness];

        // pick action
        const action = agent.chooseAction(stateArr);

        // step
        const { nextState, reward, done: isDone } = env.step(action);
        const nextArr = [nextState.difficultyIndex, nextState.stepCount, nextState.correctness];

        // store transition
        agent.observe({
          state: stateArr,
          action,
          reward,
          nextState: nextArr,
          done: isDone
        });

        // train
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
