import { DifficultyInfo } from "./types";

export const DIFFICULTIES: DifficultyInfo[] = [
  {
    name: "Easy",
    scenario: `
EASY LEVEL: Assist Neo with Basic SQL
We start with simple SELECTs and simple WHERE clauses.
`
  },
  {
    name: "Medium",
    scenario: `
MEDIUM LEVEL: The Keymaker's Puzzle - JOINs and Aggregates
We dive into JOINs, GROUP BY, and HAVING clauses.
`
  },
  {
    name: "Hard",
    scenario: `
HARD LEVEL: Agent Smith's Replication - Subqueries and Unions
We investigate advanced concepts: Window functions and CTEs.
`
  }
];