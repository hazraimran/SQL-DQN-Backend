// src/rl/QNetwork.ts (modified with an embedding approach)

import * as tf from "@tensorflow/tfjs-node";

export class QNetwork {
  private model: tf.LayersModel;
  private branchEmbedding: tf.LayerVariable;
  private userDim: number;
  private embeddingDim: number;
  private outputDim: number;

  constructor(
    maxBranches: number,
    userDim: number,
    outputDim: number,
    embeddingDim = 8,
    hiddenUnits = 16
  ) {
    this.userDim = userDim; // dimension of [userFeatures..., timeSpent, correctness]
    this.embeddingDim = embeddingDim;
    this.outputDim = outputDim;

    // We'll build a TF model with a discrete embedding for the branchId
    // plus user feature input.
    this.model = this.buildModel(maxBranches, userDim, embeddingDim, hiddenUnits);
  }

  private buildModel(
    maxBranches: number, userDim: number,
    embeddingDim: number, hiddenUnits: number
  ): tf.LayersModel {

    // We'll define two separate inputs: 
    // 1) branchId as an integer to embed
    // 2) userFeature array
    const branchInput = tf.input({ shape: [1], name: "branchId", dtype: "int32" });
    const userInput = tf.input({ shape: [userDim], name: "userFeatures" });

    // Embedding for branchId
    const embeddingLayer = tf.layers.embedding({
      inputDim: maxBranches,
      outputDim: embeddingDim
    }).apply(branchInput) as tf.SymbolicTensor; 
    // Now embeddingLayer shape = [batch, 1, embeddingDim]

    // flatten
    const embeddedBranch = tf.layers.flatten().apply(embeddingLayer) as tf.SymbolicTensor;
    // now shape = [batch, embeddingDim]

    // concat with userInput
    const concat = tf.layers.concatenate().apply([embeddedBranch, userInput]) as tf.SymbolicTensor;
    // shape = [batch, embeddingDim + userDim]

    // now feed to hidden layers
    let hidden = tf.layers.dense({ units: hiddenUnits, activation: "relu" }).apply(concat);
    hidden = tf.layers.dense({ units: hiddenUnits, activation: "relu" }).apply(hidden);

    const output = tf.layers.dense({
      units: this.outputDim,
      activation: "linear"
    }).apply(hidden) as tf.SymbolicTensor;

    const model = tf.model({ inputs: [branchInput, userInput], outputs: output });
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: "meanSquaredError"
    });
    return model;
  }

  /**
   * Predict Q-values. We must separate input into branchId + userVec.
   * states shape: [batchSize, 1 + userDim]
   * The first column is branchId, next columns are user features
   */
  public predict(states: number[][]): tf.Tensor2D {
    return tf.tidy(() => {
      const branchTensor = tf.tensor2d(
        states.map(s => [s[0]]), // extract branchId
        [states.length, 1],
        "int32"
      );
      const userTensor = tf.tensor2d(
        states.map(s => s.slice(1)),  // rest
        [states.length, this.userDim]
      );

      const output = this.model.predict([branchTensor, userTensor]) as tf.Tensor2D;
      return output;
    });
  }

  public async trainOnBatch(states: number[][], targetQ: number[][]) {
    return tf.tidy(() => {
      const branchTensor = tf.tensor2d(
        states.map(s => [s[0]]), 
        [states.length, 1],
        "int32"
      );
      const userTensor = tf.tensor2d(
        states.map(s => s.slice(1)),
        [states.length, this.userDim]
      );
      const ys = tf.tensor2d(targetQ);

      return this.model.fit([branchTensor, userTensor], ys, {
        epochs: 1,
        verbose: 0
      });
    });
  }

  public getModel() {
    return this.model;
  }
}
