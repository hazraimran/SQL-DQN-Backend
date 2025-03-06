/**
 * A Transition represents a single step (state, action, reward, nextState, done)
 * for training the DQN.
 */
export interface Transition {
  state: number[];     // numerical representation of the current state
  action: number;      // which action was chosen (e.g., 0 or 1)
  reward: number;      // reward received after taking the action
  nextState: number[]; // next state after the action
  done: boolean;       // whether the episode ended after that step
}