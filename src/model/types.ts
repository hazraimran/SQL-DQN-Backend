/**
 * We segment the story by difficulty level, which also means
 * each difficulty = separate episode. So a "State" here is
 * (branchID, plus extra user features).
 */
export interface MerchantStoryState {
    branchId: number;        // identifies the branch in the current level
    userFeatures: number[];  // e.g., [some engagement metric, partial user data, etc.]
    timeSpent: number;       // how much time user has spent
    correctness: number;     // how well the user has done so far
  }
  
  /**
   * The environment can have multiple possible actions.
   * For simplicity, let's say "action" is which next branch to move to.
   * In reality, we might have 2..N branching choices.
   */
  export type MerchantStoryAction = number; // e.g., an integer ID from 0..(numBranches-1)
  
  /**
   * We'll store transitions in a replay buffer:
   */
  export interface Transition {
    state: MerchantStoryState;
    action: MerchantStoryAction;
    reward: number;
    nextState: MerchantStoryState;
    done: boolean;
  }
  