import { Pool } from "pg";
import { EnvState } from "../shared/types";
import { promptUserForQuery, compareRows } from "../shared/utilities";

export class MatrixSQLEnvironment {
  private currentState: EnvState;

  constructor(
    numQueries: number,
    private pool: Pool
  ) {
    this.currentState = {
      mastery: new Array(numQueries).fill(0.6),
      stepCount: 0,
      done: false
    };
  }

  public reset(): void {
    this.currentState.done = false;
    this.currentState.stepCount = 0;
    this.currentState.mastery = this.currentState.mastery.map(() => 0.6);
  }

  public getState(): EnvState {
    return this.currentState;
  }

  // // Agent will call this method to interact with the environment
  // public step(action: number): { nextState: EnvState; reward: number; } {

  //   const baseChance = (action === 0) ? 0.3 : 0.6;
  //   const success = (Math.random() < baseChance);

  //   let correctnessDelta = success ? 0.2 + Math.random() * 0.1 : 0;
  //   const oldCorrectness = this.currentState.correctness;
  //   let newCorrectness = oldCorrectness + correctnessDelta;
  //   if (newCorrectness > 1) newCorrectness = 1;
  //   const reward = 3 * (newCorrectness - oldCorrectness);

  //   this.currentState.stepCount++;
  //   this.currentState.correctness = newCorrectness;

  //   return { nextState: { ...this.currentState }, reward };
  // }

  /**
   * stepWithUserInput: the user enters an SQL query. We check the result with 'expectedRows'.
   * The reward is based on mastery, and the environment state is updated.
   */ 
  public async stepWithUserInput(action: number, expectedRows: any[]): Promise<{
    nextState: EnvState;
    reward: number;
  }> {
    this.currentState.stepCount++;

    const userQuery = await promptUserForQuery("Enter your SQL query: ");
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
    if (0.4 < oldMastery && oldMastery < 0.6) {
      reward += 1;
    }
    if (matched) {
      reward += masteryDelta * 2;
    }

    return { nextState: { ...this.currentState }, reward };
  }
}