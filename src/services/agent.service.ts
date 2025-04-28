import { DQNAgent } from '../agent/DQNAgent';
import { SQLEnvironment } from '../environment/SQLEnvironment';
import { Pool } from 'pg';
import { loadTransitionsFromCSV } from './training.service';
import { Transition } from '../types/types';

// Singleton instances for agent and environment
let agent: DQNAgent | null = null;
let env: SQLEnvironment | null = null;
let action: number;

/**
 * Pre-train agent with transitions from CSV file
 */
export async function preTrain(dqnAgent: DQNAgent, csvFile: string): Promise<void> {
  // console.log('Generating training data...');
  
  // Generate fresh training data with the specified number of query types
  // generateTrainingData(numQueryTypes);
  
  // console.log('Loading transitions from CSV...');
  // const csvPath = path.resolve('src/resources/generated_data.csv');
  const transitions = await loadTransitionsFromCSV(csvFile);

  console.log('Starting offline training (10 epochs) with batchSize=32...');
  await dqnAgent.offlineTrain(transitions);
  console.log('Offline training complete.');
}

/**
 * Initialize agent and environment with specified parameters
 */
export async function initAgentEnv(
  numQueryTypes: number, 
  pool: Pool, 
  preTrainAgent: boolean = true,
  masteryFile: string = ''
): Promise<number> {
  // Create environment
  env = new SQLEnvironment(numQueryTypes, pool);
  env.reset();

  // Create agent with matching dimensions
  const inputDim = numQueryTypes;
  const outputDim = numQueryTypes;
  agent = new DQNAgent(inputDim, outputDim, 5000);
  
  // Pre-train if requested
  if (preTrainAgent) {
    await preTrain(agent, masteryFile);
  }
  
  // Get initial state and choose action
  const oldState = env.getState();
  action = agent.chooseAction(oldState.mastery);
  console.log('Agent chose action from initAgentEnv:', action);
  return action;
}

/**
 * Get current agent instance
 */
export function getAgent(): DQNAgent | null {
  return agent;
}

/**
 * Get current environment instance
 */
export function getEnvironment(): SQLEnvironment | null {
  return env;
}

/**
 * Process a user query and update agent
 */
export async function processUserQuery(
  userQuery: string,
  pool: Pool,
  expected: any[] = []
): Promise<{
  nextState: any;
  action: number;
  reward: number;
  resultFromDB: any[];
  correct: boolean;
}> {
  if (!agent || !env) {
    throw new Error('Agent or Environment not initialized');
  }

  // Execute database query
  const resultFromDB = await pool.query(userQuery);

  // Get current state and choose action
  const oldState = env.getState();

  // Step the environment with user input
  const { nextState, reward, correct } = await env.stepWithUserInput(
    action,
    expected,
    resultFromDB.rows
  );

  console.log('Mastery from Next state:', nextState.mastery);

  action = agent.chooseAction(oldState.mastery);
  console.log('Agent chose action:', action);
  // Create transition and have agent observe it
  const transition: Transition = {
    state: oldState,
    action,
    reward,
    nextState
  };
  agent.observe(transition);

  // Train agent on batch
  await agent.trainBatch(16);

  return {
    nextState,
    action,
    reward,
    resultFromDB: resultFromDB.rows,
    correct
  };
}