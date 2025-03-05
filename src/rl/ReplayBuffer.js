"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplayBuffer = void 0;
class ReplayBuffer {
    constructor(capacity) {
        this.buffer = [];
        this.capacity = capacity;
        this.position = 0;
    }
    push(transition) {
        if (this.buffer.length < this.capacity) {
            this.buffer.push(transition);
        }
        else {
            this.buffer[this.position] = transition;
        }
        this.position = (this.position + 1) % this.capacity;
    }
    sample(batchSize) {
        const sampleTransitions = [];
        for (let i = 0; i < batchSize; i++) {
            const randIndex = Math.floor(Math.random() * this.buffer.length);
            sampleTransitions.push(this.buffer[randIndex]);
        }
        return sampleTransitions;
    }
    size() {
        return this.buffer.length;
    }
}
exports.ReplayBuffer = ReplayBuffer;
