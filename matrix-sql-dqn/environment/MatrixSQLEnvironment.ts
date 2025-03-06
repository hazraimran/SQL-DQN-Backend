import { Pool } from "pg";
import { EnvState } from "./types";
import { DIFFICULTIES } from "./difficulties";
import { promptUserForQuery, compareRows } from "./utilities";

export class MatrixSQLEnvironment {
  private currentState: EnvState;
  private done: boolean;

  constructor(
    private difficultyIndex: number,
    private pool: Pool
  ) {
    this.currentState = {
      difficultyIndex,
      stepCount: 0,
      correctness: 0
    };
    this.done = false;
  }

  public reset(): EnvState {
    this.currentState.stepCount = 0;
    this.currentState.correctness = 0;
    this.done = false;
    return { ...this.currentState };
  }

  public isDone(): boolean {
    return this.done;
  }

  public getState(): EnvState {
    return { ...this.currentState };
  }

  // Example step() method
  public step(action: number): { nextState: EnvState; reward: number; done: boolean } {
    if (this.done) {
      return { nextState: { ...this.currentState }, reward: 0, done: true };
    }

    const info = DIFFICULTIES[this.currentState.difficultyIndex];
    const baseChance = (action === 0) ? 0.3 : 0.6;
    const success = (Math.random() < baseChance);

    let correctnessDelta = success ? 0.2 + Math.random() * 0.1 : 0;
    const oldCorrectness = this.currentState.correctness;
    let newCorrectness = oldCorrectness + correctnessDelta;
    if (newCorrectness > 1) newCorrectness = 1;
    const reward = 3 * (newCorrectness - oldCorrectness);

    this.currentState.stepCount++;
    this.currentState.correctness = newCorrectness;
    if (this.currentState.stepCount >= info.maxSteps) {
      this.done = true;
    }
    return { nextState: { ...this.currentState }, reward, done: this.done };
  }

  // Example stepWithUserInput() method
  public async stepWithUserInput(expectedRows: any[]): Promise<{ nextState: EnvState; reward: number; done: boolean }> {
    if (this.done) {
      return { nextState: { ...this.currentState }, reward: 0, done: true };
    }
    const userQuery = await promptUserForQuery("Enter your SQL query: ");
    let rows: any[] = [];

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

    this.currentState.stepCount++;
    if (this.currentState.stepCount >= DIFFICULTIES[this.currentState.difficultyIndex].maxSteps) {
      this.done = true;
    }

    const reward = 3 * correctnessDelta;
    return { nextState: { ...this.currentState }, reward, done: this.done };
  }
}