// src/rl/DQNAgent.ts

import { MerchantStoryState, MerchantStoryAction, Transition } from "../model/types";
import { QNetwork } from "./QNetwork";
import { ReplayBuffer } from "./ReplayBuffer";
import * as tf from "@tensorflow/tfjs-node";

export class DQNAgent {
  private qNetwork: QNetwork;
  private targetNetwork: QNetwork;
  private replayBuffer: ReplayBuffer;

  private gamma: number;
  private epsilon: number;
  private epsilonMin: number;
  private epsilonDecay: number;

  private updateTargetSteps: number;
  private stepCounter: number;

  constructor(
    inputDim: number,         // dimension of (branchId + userFeatures)
    outputDim: number,        // = numBranches
    replayCapacity: number,
    gamma = 0.99,
    epsilon = 1.0,
    epsilonMin = 0.01,
    epsilonDecay = 0.995,
    updateTargetSteps = 50,   // frequency to update target network
    hiddenUnits = 16
  ) {
    this.qNetwork = new QNetwork(inputDim, outputDim, hiddenUnits);
    this.targetNetwork = new QNetwork(inputDim, outputDim, hiddenUnits);

    // copy qNetwork weights to targetNetwork
    this.syncTargetNetwork();

    this.replayBuffer = new ReplayBuffer(replayCapacity);

    this.gamma = gamma;
    this.epsilon = epsilon;
    this.epsilonMin = epsilonMin;
    this.epsilonDecay = epsilonDecay;
    this.updateTargetSteps = updateTargetSteps;
    this.stepCounter = 0;
  }

  /**
   * Choose action via epsilon-greedy
   */
  public chooseAction(state: MerchantStoryState): MerchantStoryAction {
    if (Math.random() < this.epsilon) {
      // random
      const action = Math.floor(Math.random() * this.getOutputDim());
      return action;
    } else {
      // exploit
      const qVals = this.predictQValues([this.stateToVector(state)]);
      const data = qVals.dataSync();
      let bestA = 0;
      let bestVal = data[0];
      for (let i = 1; i < data.length; i++) {
        if (data[i] > bestVal) {
          bestVal = data[i];
          bestA = i;
        }
      }
      return bestA;
    }
  }

  public observe(transition: Transition) {
    // store in replay buffer
    this.replayBuffer.push(transition);
    this.stepCounter++;

    // decay epsilon
    if (this.epsilon > this.epsilonMin) {
      this.epsilon *= this.epsilonDecay;
    }

    // update target network occasionally
    if (this.stepCounter % this.updateTargetSteps === 0) {
      this.syncTargetNetwork();
    }
  }

  public async trainBatch(batchSize: number) {
    if (this.replayBuffer.size() < batchSize) {
      return;
    }
    // sample
    const transitions = this.replayBuffer.sample(batchSize);
    const states = transitions.map(t => this.stateToVector(t.state));
    const nextStates = transitions.map(t => this.stateToVector(t.nextState));

    // predictions from main and target networks
    const qPred = this.qNetwork.predict(states);
    const qNextTarget = this.targetNetwork.predict(nextStates);

    const qPredVals = await qPred.array();
    const qNextTargetVals = await qNextTarget.array();

    // build target Q for training
    const targetQVals = qPredVals.map((row, idx) => {
      const t = transitions[idx];
      const newRow = [...row];
      if (t.done) {
        newRow[t.action] = t.reward;
      } else {
        const maxNext = Math.max(...qNextTargetVals[idx]);
        newRow[t.action] = t.reward + this.gamma * maxNext;
      }
      return newRow;
    });

    // train
    await this.qNetwork.trainOnBatch(states, targetQVals);

    qPred.dispose();
    qNextTarget.dispose();
  }

  /**
   * Convert (branchId + userFeatures) to a numeric vector
   */
  private stateToVector(state: MerchantStoryState): number[] {
    // combine branchId as first dimension, then userFeatures
    // e.g. [branchId, ...userFeatures]
    // you could also 1-hot the branchId if you prefer
    const arr = [state.branchId, ...state.userFeatures];
    return arr;
  }

  private getOutputDim(): number {
    // matches qNetwork's output dimension
    return this.qNetwork["outputDim"];
  }

  private syncTargetNetwork() {
    // copy weights from qNetwork to targetNetwork
    const weights = this.qNetwork["model"].getWeights();
    this.targetNetwork["model"].setWeights(weights);
  }
}
