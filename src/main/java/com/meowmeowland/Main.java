package com.meowmeowland;

import com.example.sqlgame.environment.SQLGameEnvironment;
import com.example.sqlgame.model.GameState;
import com.example.sqlgame.rl.QLearningAgent;
import com.example.sqlgame.environment.SQLGameEnvironment.StepResult;

public class Main {

    public static void main(String[] args) {
        // Define environment & RL parameters
        SQLGameEnvironment env = new SQLGameEnvironment();
        // We define maxStateIndex from dimension ranges:
        // role(2) * stage(6) * skill(6) * time(101) * diff(3) = 2*6*6*101*3 = 21816
        // We'll use that as numStates
        int numStates = 2 * 6 * 6 * 101 * 3;
        int numActions = 4; // 0..3 in step()

        double alpha = 0.1;       // learning rate
        double gamma = 0.95;      // discount factor
        double epsilon = 1.0;     // initial exploration
        double epsilonDecay = 0.99;
        double epsilonMin = 0.01;

        QLearningAgent agent = new QLearningAgent(env, numStates, numActions,
                alpha, gamma, epsilon, epsilonDecay, epsilonMin);

        // Train for some episodes
        int episodes = 2000;
        agent.train(episodes);

        // Demo run
        demoRun(env, agent, 5);
    }

    private static void demoRun(SQLGameEnvironment env, QLearningAgent agent, int runs) {
        System.out.println("\n----- DEMO RUN -----");
        for (int i = 0; i < runs; i++) {
            GameState state = env.reset();
            boolean done = false;
            int stepCount = 0;
            System.out.println("Starting Demo Episode " + (i + 1));
            while (!done) {
                // In a real game, you might choose the best action from Q-Table now
                int stateIndex = agentStateEncode(agent, state);
                int bestAction = bestActionFromQ(agent, stateIndex);

                SQLGameEnvironment.StepResult result = env.step(bestAction);
                state = result.nextState;
                done = result.done;
                double reward = result.reward;

                System.out.printf(" Step %2d: Action=%d, Reward=%.2f, State=%s%n",
                                  stepCount, bestAction, reward, state.toString());
                stepCount++;
            }
            System.out.println("Episode finished\n");
        }
    }

    // Helper to encode the state (we can access the QLearning object reflectively or store it)
    private static int agentStateEncode(QLearningAgent agent, GameState state) {
        // We stored the QLearning inside the agent, but let's assume we can reflect or replicate the encoding logic.
        // For simplicity, replicate the encode here or expose a method to do so in the agent:
        // (Better design might just have a static utility method or unify the environment & agent encoding)
        return agentStateEncodeInternal(state);
    }

    private static int agentStateEncodeInternal(GameState s) {
        // Repeat the same logic used in QLearning.encodeState (keep consistent!)
        int roleFactor = s.getRole();
        int stageFactor = s.getStorylineStage();
        int skillFactor = s.getSqlSkill();
        int timeFactor = s.getEngagementTime();
        int diffFactor = s.getPuzzleDifficulty();

        int index = roleFactor;
        index += stageFactor * 2;
        index += skillFactor * 2 * 6;
        index += timeFactor * 2 * 6 * 6;
        index += diffFactor * 2 * 6 * 6 * 101;
        return index;
    }

    private static int bestActionFromQ(QLearningAgent agent, int stateIndex) {
        double[][] qTable = agent.getQTable();
        double[] actions = qTable[stateIndex];
        int bestAct = 0;
        double maxVal = actions[0];
        for (int i = 1; i < actions.length; i++) {
            if (actions[i] > maxVal) {
                maxVal = actions[i];
                bestAct = i;
            }
        }
        return bestAct;
    }
}