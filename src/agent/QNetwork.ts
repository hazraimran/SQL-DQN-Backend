import * as tf from "@tensorflow/tfjs-node";

/**
 * QNetwork defines the neural net for approximating the Q-values:
 * Q(state) => [Q-value for each possible action].
 * We'll define a small feed-forward net. Input = 3 dims,
 * output = 10 possible actions.
 */
export class QNetwork {
  private model: tf.LayersModel;

  constructor(private inputDim: number, private outputDim: number) {
    this.model = this.buildModel();
  }

  /**
   * buildModel: Creates a simple feed-forward network with two hidden layers.
   * Activation is ReLU in hidden layers and linear for the output layer.
   */
  private buildModel(): tf.LayersModel {
    const model = tf.sequential();
    model.add(
      tf.layers.dense({
        units: 32,
        inputShape: [this.inputDim],
        activation: "relu"
      })
    );
    model.add(
      tf.layers.dense({
        units: 32,
        activation: "relu"
      })
    );
    model.add(
      tf.layers.dense({
        units: this.outputDim,
        activation: "linear"
      })
    );
    // Compile the model with Adam optimizer and MSE loss
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: "meanSquaredError"
    });
    return model;
  }

  /**
   * predict: Runs a forward pass on the input states to get Q-values for each action.
   */
  public predict(states: number[][]): tf.Tensor2D {
    return tf.tidy(() => {
      const inputTensor = tf.tensor2d(states, [states.length, this.inputDim]);
      return this.model.predict(inputTensor) as tf.Tensor2D;
    });
  }

  /**
   * trainOnBatch: Trains the network on a batch of states and target Q-values.
   */
  public async trainOnBatch(states: number[][], targets: number[][]) {
    const xs = tf.tensor2d(states, [states.length, this.inputDim]);
    const ys = tf.tensor2d(targets, [states.length, this.outputDim]);
    await this.model.fit(xs, ys, { epochs: 1, verbose: 0 });
    xs.dispose();
    ys.dispose();
  }

  public getModel(): tf.LayersModel {
    return this.model;
  }
}