import { Pool } from "pg";
import { EnvState } from "../types/types";
import { compareRows } from "../services/training.service";

export class SQLEnvironment {
  private currentState: EnvState;

  constructor(
    numQueries: number,
    private pool: Pool
  ) {
    this.currentState = {
      mastery: new Array(numQueries).fill(0.2),
      done: false
    };
  }

  public reset(): void {
    this.currentState.done = false;
    this.currentState.mastery = this.currentState.mastery.map(() => 0.2);
  }

  public getState(): EnvState {
    return this.currentState;
  }

  /**
   * stepWithUserInput: the user enters an SQL query. We check the result with 'expectedRows'.
   * The reward is based on mastery, and the environment state is updated.
   */ 
  public async stepWithUserInput(action: number, expectedRows: any[], rows: string[], attempts: number, hintsUsed: boolean): Promise<{
    nextState: EnvState;
    reward: number;
    correct: boolean;
  }> {
    console.log("currentState Mastery:", this.currentState.mastery);
    const matched = compareRows(rows, expectedRows);
    console.log("User query matched:", matched);
    const oldMastery = this.currentState.mastery[action];

    let masteryDelta = 0.02; // default

    if (matched) {
      if (attempts === 0) {
        masteryDelta = 0.1;
      } else if (attempts === 1) {
        masteryDelta = 0.07;
      } else if (attempts === 2) {
        masteryDelta = 0.04;
      }
      // Subtract 0.02 if hint is used, but don't go below 0.02
      if (hintsUsed) {
        masteryDelta = Math.max(0.02, masteryDelta - 0.02);
      }
    } else {
      masteryDelta = 0.02; // incorrect answer, minimal progress
    }

    // Clamp the mastery in [0,1]
    this.currentState.mastery[action] = Math.max(0.0, Math.min(1, oldMastery + masteryDelta));

    let reward = 0;
    if (0.4 <= oldMastery && oldMastery <= 0.6) {
      reward += 1;
    } else if (oldMastery >=0.75) {
      reward -= 2;
    }

    if (matched) {
      reward += masteryDelta * 2;
    }

    // if all mastery >= 0.8, we can consider environment done
    if (this.currentState.mastery.every(m => m >= 0.8)) {
      this.currentState.done = true;
    }

    return { nextState: {...this.currentState}, reward, correct: matched };
  }
}