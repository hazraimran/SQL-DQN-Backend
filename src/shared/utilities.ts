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
  console.log("actual: ", actual);
  console.log("expected: ", expected);
  
  // Check if expected is a nested array (array of result sets)
  if (expected.length > 0 && Array.isArray(expected[0])) {
    // Look for any matching array in the expected results
    return expected.some(expectedSet => {
      // Check if this expected set matches our actual results
      return compareArraysDeep(actual, expectedSet);
    });
  }
  
  // If expected is a simple array, compare directly
  return compareArraysDeep(actual, expected);
}

// Helper to deeply compare two arrays of objects
function compareArraysDeep(arr1: any[], arr2: any[]): boolean {
  if (arr1.length !== arr2.length) return false;
  
  // Sort both arrays to ensure consistent comparison
  const sorted1 = [...arr1].sort((a, b) => JSON.stringify(a) > JSON.stringify(b) ? 1 : -1);
  const sorted2 = [...arr2].sort((a, b) => JSON.stringify(a) > JSON.stringify(b) ? 1 : -1);
  
  // Check if each element matches
  return sorted1.every((item, index) => {
    return JSON.stringify(item) === JSON.stringify(sorted2[index]);
  });
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