package main.java.com.meowmeowland.rl;

import com.example.sqlgame.environment.SQLGameEnvironment;
import com.example.sqlgame.environment.SQLGameEnvironment.StepResult;
import com.example.sqlgame.model.GameState;

public class QLearningAgent {
    
    private QLearning qLearning;
    private SQLGameEnvironment environment;
    private int numStates;
    private int numActions;

    public QLearningAgent(SQLGameEnvironment environment, int numStates, int numActions,
                          double alpha, double gamma, double epsilon,
                          double epsilonDecay, double epsilonMin) {
        this.environment = environment;
        this.numStates = numStates;
        this.numActions = numActions;
        this.qLearning = new QLearning(numStates, numActions, alpha, gamma, epsilon, epsilonDecay, epsilonMin);
    }

    public void train(int episodes) {
        for (int ep = 0; ep < episodes; ep++) {
            GameState state = environment.reset();
            int currentStateIndex = qLearning.encodeState(state);
            boolean done = false;

            while (!done) {
                // Choose action with epsilon-greedy
                int action = qLearning.chooseAction(currentStateIndex);

                // Step the environment
                StepResult result = environment.step(action);
                GameState nextState = result.nextState;
                double reward = result.reward;
                done = result.done;

                // Encode next state
                int nextStateIndex = qLearning.encodeState(nextState);

                // Update Q
                qLearning.updateQ(currentStateIndex, action, reward, nextStateIndex, done);

                // Move on
                currentStateIndex = nextStateIndex;
            }
            // Decay epsilon after each episode
            qLearning.decayEpsilon();
        }
    }

    public double[][] getQTable() {
        return qLearning.getQTable();
    }
}
