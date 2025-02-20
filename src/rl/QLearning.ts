/**
 * Manages a Q-table for discrete states and actions.
 * The developer must define how to "encode" a GameState to a single integer index.
 */
export class QLearning {
    private alpha: number;         // learning rate
    private gamma: number;         // discount factor
    private epsilon: number;       // exploration rate
    private epsilonDecay: number;
    private epsilonMin: number;
    private numStates: number;
    private numActions: number;
    private qTable: number[][];
  
    constructor(
      numStates: number,
      numActions: number,
      alpha: number,
      gamma: number,
      epsilon: number,
      epsilonDecay: number,
      epsilonMin: number
    ) {
      this.numStates = numStates;
      this.numActions = numActions;
      this.alpha = alpha;
      this.gamma = gamma;
      this.epsilon = epsilon;
      this.epsilonDecay = epsilonDecay;
      this.epsilonMin = epsilonMin;
  
      this.qTable = Array.from({ length: numStates }, () => Array(numActions).fill(0));
    }
  
    public chooseAction(stateIndex: number): number {
      // Epsilon-greedy
      if (Math.random() < this.epsilon) {
        return Math.floor(Math.random() * this.numActions);
      }
      return this.argMax(this.qTable[stateIndex]);
    }
  
    public updateQ(
      currentStateIndex: number,
      action: number,
      reward: number,
      nextStateIndex: number,
      done: boolean
    ) {
      const oldValue = this.qTable[currentStateIndex][action];
      let nextMax = 0;
      if (!done) {
        const bestNext = this.argMax(this.qTable[nextStateIndex]);
        nextMax = this.qTable[nextStateIndex][bestNext];
      }
      const newValue = oldValue + this.alpha * (reward + this.gamma * nextMax - oldValue);
      this.qTable[currentStateIndex][action] = newValue;
    }
  
    public decayEpsilon(): void {
      if (this.epsilon > this.epsilonMin) {
        this.epsilon *= this.epsilonDecay;
      }
    }
  
    private argMax(arr: number[]): number {
      let bestIndex = 0;
      let bestVal = arr[0];
      for (let i = 1; i < arr.length; i++) {
        if (arr[i] > bestVal) {
          bestVal = arr[i];
          bestIndex = i;
        }
      }
      return bestIndex;
    }
  
    public getQTable(): number[][] {
      return this.qTable;
    }
  }
  