export interface EnvState {
    mastery: number[];       // mastery of each concept (10 concepts)
    done: boolean;           // whether the environment is done
}

export interface DifficultyInfo {
  name: string;
  scenario: string;
}

/**
 * A Transition represents a single step (state, action, reward, nextState, done)
 * for training the DQN.
 */
export interface Transition {
  state: EnvState;     // numerical representation of the current state
  action: number;      // which action was chosen (e.g., 0 or 1)
  reward: number;      // reward received after taking the action
  nextState: EnvState; // next state after the action
}