import readline from "readline";
import { Transition } from "./types";
import fs from "fs";
import path from "path";


export function promptUserForQuery(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export function compareRows(actual: any[], expected: any[]): boolean {
  if (actual.length !== expected.length) return false;
  return JSON.stringify(expected).includes(JSON.stringify(actual));
}

// CSV format: mastery[0], mastery[1], mastery[2], ...(*10), action, reward,
// nextMastery[0], nextMastery[1], nextMastery[2], ...(*10)
export async function loadTransitionsFromCSV(csvPath: string): Promise<Transition[]> {
  const fullPath = path.resolve(csvPath);
  const content = fs.readFileSync(fullPath, "utf-8");
  const lines = content.trim().split("\n");
  // Skip header line
  lines.shift();

  const transitions: Transition[] = lines.map(line => {
    const parts = line.split(",").map(Number);
    const oldMastery = parts.slice(0, 10);
    const newMastery = parts.slice(12);
    return {
      state: {
        mastery: oldMastery,
        done: oldMastery.every(m => m >= 0.8)? true : false
      },
      action: parts[10],
      reward: parts[11],
      nextState: {
        mastery: newMastery,
        done: newMastery.every(m => m >= 0.8)? true : false
      }
    };
  }
  );
  return transitions;
}