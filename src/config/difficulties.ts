export interface DifficultyConfig {
    name: string;           // e.g. "Easy", "Medium", "Hard"
    maxSteps: number;       // how many steps before episode ends
    correctnessThreshold: number; // if user ends with correctness above this, move to next
  }
  
  export const DIFFICULTIES: DifficultyConfig[] = [
    {
      name: "Easy",
      maxSteps: 5,
      correctnessThreshold: 0.3
    },
    {
      name: "Medium",
      maxSteps: 7,
      correctnessThreshold: 0.5
    },
    {
      name: "Hard",
      maxSteps: 10,
      correctnessThreshold: 0.7
    }
  ];
  