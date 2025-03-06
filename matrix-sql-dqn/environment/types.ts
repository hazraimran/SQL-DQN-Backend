export interface EnvState {
  difficultyIndex: number;
  stepCount: number;
  correctness: number; // [0..1]
}

export interface DifficultyInfo {
  name: string;
  maxSteps: number;
  passThreshold: number;
  scenario: string;
}