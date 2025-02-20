/**
 * Representation of the game state for RL.
 *
 * We store:
 * - role: 0 = Merchant, 1 = Brave
 * - storylineStage: integer from 0..(some max)
 * - sqlSkill: e.g., 0..5
 * - engagementTime: tracks time spent
 * - puzzleDifficulty: 0=EASY,1=MEDIUM,2=HARD
 */
export interface GameState {
    role: number;
    storylineStage: number;
    sqlSkill: number;
    engagementTime: number;
    puzzleDifficulty: number;
  }
  