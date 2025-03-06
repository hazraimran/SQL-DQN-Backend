import { DifficultyInfo } from "./types";

export const DIFFICULTIES: DifficultyInfo[] = [
  {
    name: "Easy",
    maxSteps: 3,
    passThreshold: 0.3,
    scenario: `
EASY LEVEL: Identifying Rebels
Neo identifies potential rebels in the residue table. We do basic SQL queries
(SELECT, FROM, WHERE) to list them.
`
  },
  {
    name: "Medium",
    maxSteps: 4,
    passThreshold: 0.5,
    scenario: `
MEDIUM LEVEL: The Keymaker's Puzzle
Morpheus needs mission data from 'archives' and 'mission_logs' tables. We do a JOIN and GROUP BY.
`
  },
  {
    name: "Hard",
    maxSteps: 5,
    passThreshold: 0.7,
    scenario: `
HARD LEVEL: Agent Smith's Replication
We investigate advanced concepts: Window functions, CTEs, transactions.
`
  }
];