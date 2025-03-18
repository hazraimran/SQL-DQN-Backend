import { Pool } from "pg";
import { EnvState } from "../shared/types";
import { compareRows } from "../shared/utilities";

export class MatrixSQLEnvironment {
  private currentState: EnvState;

  constructor(
    numQueries: number,
    private pool: Pool
  ) {
    this.currentState = {
      mastery: new Array(numQueries).fill(0.6),
      done: false
    };
  }

  public reset(): void {
    this.currentState.done = false;
    this.currentState.mastery = this.currentState.mastery.map(() => 0.6);
  }

  public getState(): EnvState {
    return this.currentState;
  }

  /**
   * stepWithUserInput: the user enters an SQL query. We check the result with 'expectedRows'.
   * The reward is based on mastery, and the environment state is updated.
   */ 
  public async stepWithUserInput(action: number, expectedRows: any[], userQuery: string): Promise<{
    nextState: EnvState;
    reward: number;
  }> {
    // const userQuery = await promptUserForQuery("Enter your SQL query: ");
    let rows: string[] = [];

    try {
      const res = await this.pool.query(userQuery);
      rows = res.rows;
    } catch (err) {
      console.log("Query error:", err);
    }

    const matched = compareRows(rows, expectedRows);
    const oldMastery = this.currentState.mastery[action];

    const masteryDelta = matched ? 0.1 : -0.05;

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

    return { nextState: {...this.currentState}, reward };
  }
}