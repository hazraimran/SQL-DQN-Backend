import { GameState } from "../model/GameState";
import { PuzzleDifficulty } from "../model/PuzzleDifficulty";
import { StorylineManager } from "../storyline/StorylineManager";
import { PuzzleGenerator } from "../puzzle/PuzzleGenerator";

/**
 * RL environment:
 *  - States: { role, storylineStage, sqlSkill, engagementTime, puzzleDifficulty }
 *  - Actions:
 *     0: Present puzzle (user attempts a query)
 *     1: Provide practice storyline (similar difficulty)
 *     2: Increase difficulty or move forward
 *     3: Move to next big event in storyline
 *
 * Step returns (newState, reward, done)
 */
export interface StepResult {
  nextState: GameState;
  reward: number;
  done: boolean;
}

export class SQLGameEnvironment {
  private static MAX_STAGE = 5;
  private static MAX_SKILL = 5;
  private static MAX_TIME = 200;

  private storylineManager: StorylineManager;
  private puzzleGenerator: PuzzleGenerator;
  private currentState: GameState;

  constructor() {
    this.storylineManager = new StorylineManager();
    this.puzzleGenerator = new PuzzleGenerator();
    // Initialize with a default
    this.currentState = {
      role: 0,
      storylineStage: 0,
      sqlSkill: 0,
      engagementTime: 0,
      puzzleDifficulty: 0,
    };
  }

  public reset(): GameState {
    // Start: random role 0 or 1
    const role = Math.random() < 0.5 ? 0 : 1;
    const stage = 0;
    const skill = 0;
    const engagementTime = 0;
    const puzzleDifficulty = 0; // start with EASY

    this.currentState = { role, storylineStage: stage, sqlSkill: skill, engagementTime, puzzleDifficulty };
    return this.currentState;
  }

  public step(action: number, userQuery: string | null = null): StepResult {
    let { role, storylineStage: stage, sqlSkill: skill, engagementTime: time, puzzleDifficulty: diff } = this.currentState;

    let reward = 0;
    let done = false;

    switch (action) {
      case 0:
        // 0: Present puzzle at current difficulty
        const puzzlePrompt = this.puzzleGenerator.generatePuzzlePrompt(role, diff as PuzzleDifficulty);

        if (userQuery) {
          // Evaluate user-submitted query
          const isCorrect = this.puzzleGenerator.evaluateUserQuery(userQuery, role, puzzlePrompt);
          if (isCorrect) {
            skill = Math.min(skill + 1, SQLGameEnvironment.MAX_SKILL);
            reward += 10; // correct query => bigger reward
          } else {
            reward += 2;  // partial reward for attempt
          }
        } else {
          // If no userQuery is given, we can treat as attempt/fail or skip
          reward += 1;
        }

        // Increase engagement time (spent on puzzle)
        time = Math.min(time + 5, SQLGameEnvironment.MAX_TIME);
        break;

      case 1:
        // 1: Provide practice storyline at same difficulty
        this.storylineManager.addPracticeArc(role, stage, diff);
        time = Math.min(time + 3, SQLGameEnvironment.MAX_TIME);
        reward += 5;
        break;

      case 2:
        // 2: Increase difficulty or move storyline forward (if skill is high)
        if (diff < 2) {
          diff++;
          reward += 3;
        } else {
          stage = Math.min(stage + 1, SQLGameEnvironment.MAX_STAGE);
          reward += 5;
        }
        time = Math.min(time + 2, SQLGameEnvironment.MAX_TIME);
        break;

      case 3:
        // 3: Move to next big event
        stage = this.storylineManager.goToNextBigEvent(stage);
        if (stage >= SQLGameEnvironment.MAX_STAGE) {
          done = true;
          reward += 20; // big finale bonus
        } else {
          reward += 8;
        }
        time = Math.min(time + 4, SQLGameEnvironment.MAX_TIME);
        break;

      default:
        // no-op
        break;
    }

    // Update current state
    this.currentState = {
      role,
      storylineStage: stage,
      sqlSkill: skill,
      engagementTime: time,
      puzzleDifficulty: diff,
    };

    return {
      nextState: { ...this.currentState },
      reward,
      done,
    };
  }

  public getCurrentState(): GameState {
    return this.currentState;
  }
}
