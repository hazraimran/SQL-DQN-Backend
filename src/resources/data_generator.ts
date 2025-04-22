import fs from 'fs';
import path from 'path';

// Get number of concepts from command line arguments
const args = process.argv.slice(2);
const num_concepts = args.length > 0 ? parseInt(args[0], 10) : 5;

console.log(`Generating data for ${num_concepts} concept masteries...`);

// Initialize the first row of data with dynamic size
const initial_mastery: number[] = Array(num_concepts).fill(0.6);  // i instances of 0.6
const action_reward: number[] = [num_concepts - 1, 1.2];  // action and reward placeholders
// i instances with last one bumped to 0.7
const next_mastery: number[] = [...Array(num_concepts - 1).fill(0.6), 0.7];

// Combine all parts for the first row
const first_row: number[] = [...initial_mastery, ...action_reward, ...next_mastery];

// Initialize data with the first row
const data: number[][] = [first_row];

// Generate the remaining rows
for (let i = 1; i < 1000; i++) {
  // Copy the nextState values from the previous row to the current state
  const prev_row = data[i - 1];
  const state = prev_row.slice(num_concepts + 2);  // Skip the previous action and reward
  const new_state = [...state];

  // Random action between 0 and num_concepts-1
  const action = Math.floor(Math.random() * num_concepts);

  // Calculate reward based on action
  let reward = 0;
  if (0.4 < state[action] && state[action] < 0.6) {
    reward += 1;
  } else if (0.8 <= state[action]) {
    reward -= 2;
  }

  if (Math.random() < 0.1 || (action in [0, 1] && Math.random() < 0.9)) {
    reward -= 0.1;
    new_state[action] = Math.round(Math.max(0, Math.min(1, state[action] - 0.05)) * 10) / 10;
  } else {
    reward += 0.2;
    new_state[action] = Math.round(Math.max(0, Math.min(1, state[action] + 0.1)) * 10) / 10;
  }

  // Append the new row
  data.push([...state, action, Math.round(reward * 10) / 10, ...new_state]);

  // Stop if all masteries reach 0.7 or higher
  if (new_state.every(mastery => mastery >= 0.7)) {
    break;
  }
}

// Create dynamic header row based on num_concepts
const header: string[] = [];
for (let i = 0; i < num_concepts; i++) {
  header.push(`mastery[${i}]`);
}
header.push("action");
header.push("reward");
for (let i = 0; i < num_concepts; i++) {
  header.push(`newMastery[${i}]`);
}

// Convert data to CSV string
const csvContent = [
  header.join(','),
  ...data.map(row => row.join(','))
].join('\n');

// Write to CSV file
const outputPath = path.resolve('src/resources/generated_data.csv');
fs.writeFileSync(outputPath, csvContent);

console.log(`CSV file generated successfully with ${num_concepts} concept masteries!`);