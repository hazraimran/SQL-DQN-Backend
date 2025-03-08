import { QNetwork } from "./QNetwork";
import { ReplayBuffer } from "./ReplayBuffer";
import { Transition } from "../shared/types";

/**
 * DQNAgent manages:
 *  - Two QNetworks (online network + target network)
 *  - Epsilon-greedy policy
 *  - Replay buffer
 *  - Methods to choose actions, observe transitions, and train on mini-batches.
 */
export class DQNAgent {
  private qNetwork: QNetwork;         // online network
  private targetNetwork: QNetwork;    // target network for stable Q-learning
  private replayBuffer: ReplayBuffer; // memory for storing transitions

  private gamma: number;         // discount factor
  private epsilon: number;       // epsilon for epsilon-greedy strategy
  private epsilonMin: number;    // minimum epsilon
  private epsilonDecay: number;  // factor by which to decay epsilon each update
  private stepCounter: number;   // counts how many steps have occurred
  private updateTargetSteps: number; // after how many steps to sync the target network

  constructor(
    inputDim: number,
    outputDim: number,
    replayCapacity: number = 5000,
    gamma = 0.99,
    epsilon = 1.0,
    epsilonMin = 0.1,
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

  /**
   * chooseAction: Returns an action based on epsilon-greedy policy.
   * With probability epsilon, choose a random action.
   * Otherwise, pick the action with the highest Q-value predicted by qNetwork.
   */
  public chooseAction(stateArr: number[]): number {
    // 10 possible actions/ types of queries
    const numActions = 10;
    const tieThreshold = 1e-3;

    if (Math.random() < this.epsilon) {
      return Math.floor(Math.random() * numActions);
    } else {
      const pred = this.qNetwork.predict([stateArr]);
      const data = pred.dataSync(); // Q-values in a typed array
      pred.dispose();

      let bestA = 0;
      let bestVal = data[0];
      for (let i = 1; i < data.length; i++) {
        if (data[i] > bestVal) {
          bestVal = data[i];
          bestA = i;
        }
      }

      // collect all actions with Q-value close to bestVal
      const bestActions: number[] = [];
      for (let i = 0; i < data.length; i++) {
        if (Math.abs(data[i] - bestVal) < tieThreshold) {
          bestActions.push(i);
        }
      }

      // randomly pick one of the best actions
      if (bestActions.length > 1) {
        bestA = bestActions[Math.floor(Math.random() * bestActions.length)];
      }
      return bestA;
    }
  }

  /**
   * observe: Stores the transition in replay buffer, increments stepCounter,
   * and handles epsilon decay + occasional weight sync.
   */
  public observe(transition: Transition) {
    this.replayBuffer.push(transition);
    this.stepCounter++;

    // Epsilon decay
    if (this.epsilon > this.epsilonMin) {
      this.epsilon *= this.epsilonDecay;
    }

    // Update target network weights after certain steps
    if (this.stepCounter % this.updateTargetSteps === 0) {
      this.copyWeightsToTarget();
    }
  }

  /**
   * trainBatch: Samples transitions from replay buffer and updates the qNetwork.
   */
  public async trainBatch(batchSize: number) {
    if (this.replayBuffer.size() < batchSize) return;

    const transitions = this.replayBuffer.sample(batchSize);
    const states = transitions.map(t => t.state);
    const nextStates = transitions.map(t => t.nextState);

    // Q-values predicted by the online network for current states
    const qPred = this.qNetwork.predict(states);
    // Q-values predicted by the target network for next states
    const qNext = this.targetNetwork.predict(nextStates);

    const qPredVals = await qPred.array();
    const qNextVals = await qNext.array();

    // update the Q-value target for each transition
    const targetVals = qPredVals.map((row, idx) => {
      const t = transitions[idx];
      const updatedRow = [...row];

      const maxNext = Math.max(...qNextVals[idx]);
      updatedRow[t.action] = t.reward + this.gamma * maxNext;
      
      return updatedRow;
    });

    // Train the online network on states vs. updated targets
    await this.qNetwork.trainOnBatch(states, targetVals);

    // Dispose Tensors
    qPred.dispose();
    qNext.dispose();
  }

  /**
   * copyWeightsToTarget: Syncs the parameters from qNetwork to targetNetwork,
   * stabilizing training.
   */
  private copyWeightsToTarget() {
    const mainWeights = this.qNetwork.getModel().getWeights();
    this.targetNetwork.getModel().setWeights(mainWeights);
  }

  public async offlineTrain(transitions: Transition[], epochs = 10, batchSize = 32) {
    // push all transitions to replay buffer
    transitions.forEach(t => this.observe(t));

    // run multiple epochs
    for (let e = 0; e < epochs; e++) {
      for (let i = 0; i < 100; i++) {
        await this.trainBatch(batchSize);
      }
      console.log(`OfflineTrain: finished epoch #${e + 1}`);
    }
  }
}