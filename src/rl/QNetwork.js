"use strict";
// src/rl/QNetwork.ts (modified with an embedding approach)
Object.defineProperty(exports, "__esModule", { value: true });
exports.QNetwork = void 0;
const tf = require("@tensorflow/tfjs-node");
class QNetwork {
    constructor(maxBranches, userDim, outputDim, embeddingDim = 8, hiddenUnits = 16) {
        this.userDim = userDim; // dimension of [userFeatures..., timeSpent, correctness]
        this.embeddingDim = embeddingDim;
        this.outputDim = outputDim;
        // We'll build a TF model with a discrete embedding for the branchId
        // plus user feature input.
        this.model = this.buildModel(maxBranches, userDim, embeddingDim, hiddenUnits);
    }
    buildModel(maxBranches, userDim, embeddingDim, hiddenUnits) {
        // We'll define two separate inputs: 
        // 1) branchId as an integer to embed
        // 2) userFeature array
        const branchInput = tf.input({ shape: [1], name: "branchId", dtype: "int32" });
        const userInput = tf.input({ shape: [userDim], name: "userFeatures" });
        // Embedding for branchId
        const embeddingLayer = tf.layers.embedding({
            inputDim: maxBranches,
            outputDim: embeddingDim
        }).apply(branchInput);
        // Now embeddingLayer shape = [batch, 1, embeddingDim]
        // flatten
        const embeddedBranch = tf.layers.flatten().apply(embeddingLayer);
        // now shape = [batch, embeddingDim]
        // concat with userInput
        const concat = tf.layers.concatenate().apply([embeddedBranch, userInput]);
        // shape = [batch, embeddingDim + userDim]
        // now feed to hidden layers
        let hidden = tf.layers.dense({ units: hiddenUnits, activation: "relu" }).apply(concat);
        hidden = tf.layers.dense({ units: hiddenUnits, activation: "relu" }).apply(hidden);
        const output = tf.layers.dense({
            units: this.outputDim,
            activation: "linear"
        }).apply(hidden);
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
    predict(states) {
        return tf.tidy(() => {
            const branchTensor = tf.tensor2d(states.map(s => [s[0]]), // extract branchId
            [states.length, 1], "int32");
            const userTensor = tf.tensor2d(states.map(s => s.slice(1)), // rest
            [states.length, this.userDim]);
            const output = this.model.predict([branchTensor, userTensor]);
            return output;
        });
    }
    async trainOnBatch(states, targetQ) {
        return tf.tidy(() => {
            const branchTensor = tf.tensor2d(states.map(s => [s[0]]), [states.length, 1], "int32");
            const userTensor = tf.tensor2d(states.map(s => s.slice(1)), [states.length, this.userDim]);
            const ys = tf.tensor2d(targetQ);
            return this.model.fit([branchTensor, userTensor], ys, {
                epochs: 1,
                verbose: 0
            });
        });
    }
    getModel() {
        return this.model;
    }
}
exports.QNetwork = QNetwork;
