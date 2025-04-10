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

// CSV format: mastery[0], mastery[1], mastery[2], ...mastery[i], action, reward,
// nextMastery[0], nextMastery[1], nextMastery[2], ...newMastery[i]
// i mastery values, 1 action, 1 reward, i next mastery values
export async function loadTransitionsFromCSV(csvPath: string): Promise<Transition[]> {
  const fullPath = path.resolve(csvPath);
  const content = fs.readFileSync(fullPath, "utf-8");
  const lines = content.trim().split("\n");
  
  // Parse header to determine structure
  const header = lines[0].split(",");
  
  // Find indices for important elements
  const masteryCount = header.filter(col => col.startsWith("mastery[")).length;
  const actionIndex = masteryCount;
  const rewardIndex = masteryCount + 1;
  const newMasteryStartIndex = masteryCount + 2;
  
  console.log(`Detected ${masteryCount} mastery dimensions in CSV`);
  
  // Skip header and parse all data rows
  const transitions: Transition[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const parts = line.split(",").map(Number);
    
    // Handle potential data format issues
    if (parts.length < newMasteryStartIndex + masteryCount) {
      console.warn(`Skipping line ${i}: insufficient data (expected ${newMasteryStartIndex + masteryCount} values, got ${parts.length})`);
      continue;
    }
    
    const oldMastery = parts.slice(0, masteryCount);
    const newMastery = parts.slice(newMasteryStartIndex, newMasteryStartIndex + masteryCount);
    
    transitions.push({
      state: {
        mastery: oldMastery,
        done: oldMastery.every(m => m >= 0.8)
      },
      action: parts[actionIndex],
      reward: parts[rewardIndex],
      nextState: {
        mastery: newMastery,
        done: newMastery.every(m => m >= 0.8)
      }
    });
  }
  
  console.log(`Loaded ${transitions.length} transitions with ${masteryCount} mastery dimensions`);
  return transitions;
}