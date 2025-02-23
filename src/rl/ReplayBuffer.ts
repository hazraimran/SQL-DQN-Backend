// src/rl/ReplayBuffer.ts
import { Transition } from "../model/types";

export class ReplayBuffer {
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
    const sampleTransitions: Transition[] = [];
    for (let i = 0; i < batchSize; i++) {
      const randIndex = Math.floor(Math.random() * this.buffer.length);
      sampleTransitions.push(this.buffer[randIndex]);
    }
    return sampleTransitions;
  }

  public size() {
    return this.buffer.length;
  }
}
