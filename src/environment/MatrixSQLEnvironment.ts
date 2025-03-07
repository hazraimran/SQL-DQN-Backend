import { Pool } from "pg";
import { EnvState } from "../shared/types";
import { DIFFICULTIES } from "./difficulties";
import { promptUserForQuery, compareRows } from "../shared/utilities";

export class MatrixSQLEnvironment {
  private currentState: EnvState;

  constructor(
    private difficultyIndex: number,
    private pool: Pool
  ) {
    this.currentState = {
      difficultyIndex,
      stepCount: 0,
      correctness: 0
    };
  }

  public reset(): EnvState {
    this.currentState = { difficultyIndex: this.difficultyIndex, stepCount: 0, correctness: 0 };
    return { ...this.currentState };
  }

  public getState(): EnvState {
    return { ...this.currentState };
  }

  // Agent will call this method to interact with the environment
  public step(action: number): { nextState: EnvState; reward: number; } {

    const baseChance = (action === 0) ? 0.3 : 0.6;
    const success = (Math.random() < baseChance);

    let correctnessDelta = success ? 0.2 + Math.random() * 0.1 : 0;
    const oldCorrectness = this.currentState.correctness;
    let newCorrectness = oldCorrectness + correctnessDelta;
    if (newCorrectness > 1) newCorrectness = 1;
    const reward = 3 * (newCorrectness - oldCorrectness);

    this.currentState.stepCount++;
    this.currentState.correctness = newCorrectness;

    return { nextState: { ...this.currentState }, reward };
  }

  /**
   * stepWithUserInput: the user enters an SQL query. We check correctness vs. 'expectedRows'.
   * The reward is based on correctness, and the environment state is updated.
   */ 
  public async stepWithUserInput(expectedRows: any[]): Promise<{
    nextState: EnvState;
    reward: number;
  }> {

    const userQuery = await promptUserForQuery("Enter your SQL query: ");
    let rows: string[] = [];

    try {
      const res = await this.pool.query(userQuery);
      rows = res.rows;
    } catch (err) {
      console.log("Query error:", err);
    }

    const matched = compareRows(rows, expectedRows);
    const oldCorrectness = this.currentState.correctness;

    const correctnessDelta = matched ? 0.3 : -0.1;
    let newCorrectness = oldCorrectness + correctnessDelta;

    // Clamp the correctness in [0,1]
    if (newCorrectness < 0) newCorrectness = 0;
    if (newCorrectness > 1) newCorrectness = 1;
    this.currentState.correctness = newCorrectness;

    const reward = 3 * correctnessDelta;
    return { nextState: { ...this.currentState }, reward };
  }
}