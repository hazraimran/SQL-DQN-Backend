import { DifficultyInfo } from "./types";

export const DIFFICULTIES: DifficultyInfo[] = [
  {
    name: "Easy",
    passThreshold: 0.8,
    scenario: `
EASY LEVEL: Assist Neo with Basic SQL
We start with simple SELECTs and simple WHERE clauses.
`
  },
  {
    name: "Medium",
    passThreshold: 0.8,
    scenario: `
MEDIUM LEVEL: The Keymaker's Puzzle - JOINs and Aggregates
We dive into JOINs, GROUP BY, and HAVING clauses.
`
  },
  {
    name: "Hard",
    passThreshold: 0.8,
    scenario: `
HARD LEVEL: Agent Smith's Replication - Subqueries and Unions
We investigate advanced concepts: Window functions and CTEs.
`
  }
];