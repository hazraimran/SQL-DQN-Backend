import { Transition } from "../types/types";

/**
 * ReplayBuffer stores and samples transitions for training the DQN.
 */
export class ReplayBuffer {
  private buffer: Transition[];
  private capacity: number;  // max number of transitions to hold
  private position: number;  // index for the circular buffer

  constructor(capacity: number) {
    this.buffer = [];
    this.capacity = capacity;
    this.position = 0;
  }

  /**
   * push: Add a new transition to the buffer.
   * If buffer is at capacity, overwrite the oldest transition.
   */
  public push(transition: Transition) {
    if (this.buffer.length < this.capacity) {
      this.buffer.push(transition);
    } else {
      this.buffer[this.position] = transition;
    }
    this.position = (this.position + 1) % this.capacity;
  }

  /**
   * sample: Randomly draws 'batchSize' transitions from the buffer.
   */
  public sample(batchSize: number): Transition[] {
    const result: Transition[] = [];
    const size = this.buffer.length;
    if (size === 0) return result;

    for (let i = 0; i < batchSize; i++) {
      const idx = Math.floor(Math.random() * size);
      result.push(this.buffer[idx]);
    }
    return result;
  }

  public size(): number {
    return this.buffer.length;
  }
}