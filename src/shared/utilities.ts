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

// CSV format: state[0], state[1], state[2], action, reward, nextState[0], nextState[1], nextState[2]
export async function loadTransitionsFromCSV(csvPath: string): Promise<Transition[]> {
  const fullPath = path.resolve(csvPath);
  const content = fs.readFileSync(fullPath, "utf-8");
  const lines = content.trim().split("\n");
  // Skip header line
  lines.shift();
  const transitions: Transition[] = lines.map(line => {
    const parts = line.split(",").map(Number);
    return {
      state: parts.slice(0, 3),
      action: parts[3],
      reward: parts[4],
      nextState: parts.slice(5)
    };
  }
  );
  return transitions;
}