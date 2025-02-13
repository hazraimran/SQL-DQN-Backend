package main.java.com.meowmeowland.rl;

import com.example.sqlgame.environment.SQLGameEnvironment;
import com.example.sqlgame.model.GameState;

import java.util.Random;

/**
 * Basic Q-Learning logic with a Q-table.
 * We'll discretize the states, so we need a way to map (GameState) to an index.
 */
public class QLearning {
    
    // Hyperparameters
    private double alpha;         // Learning rate
    private double gamma;         // Discount factor
    private double epsilon;       // Exploration rate
    private double epsilonDecay;
    private double epsilonMin;
    private int numStates;        // we define a state encoding scheme
    private int numActions;

    private double[][] qTable;
    private Random rand = new Random();

    public QLearning(int numStates, int numActions,
                     double alpha, double gamma, double epsilon,
                     double epsilonDecay, double epsilonMin) {
        this.numStates = numStates;
        this.numActions = numActions;
        this.alpha = alpha;
        this.gamma = gamma;
        this.epsilon = epsilon;
        this.epsilonDecay = epsilonDecay;
        this.epsilonMin = epsilonMin;

        // Initialize Q-table
        qTable = new double[numStates][numActions];
    }

    public int chooseAction(int stateIndex) {
        // Epsilon-greedy
        if (rand.nextDouble() < epsilon) {
            return rand.nextInt(numActions);
        } else {
            return argMax(qTable[stateIndex]);
        }
    }

    public void updateQ(int currentStateIndex, int action, double reward, int nextStateIndex, boolean done) {
        double oldValue = qTable[currentStateIndex][action];
        double nextMax = 0.0;
        if (!done) {
            nextMax = qTable[nextStateIndex][argMax(qTable[nextStateIndex])];
        }
        double newValue = oldValue + alpha * (reward + gamma * nextMax - oldValue);
        qTable[currentStateIndex][action] = newValue;
    }

    public void decayEpsilon() {
        if (epsilon > epsilonMin) {
            epsilon *= epsilonDecay;
        }
    }

    // Helper to encode GameState -> index
    // In a real system, you'd carefully define the dimension ranges
    public int encodeState(GameState s) {
        // Example dimension ranges (for demonstration):
        // role: 2  (0..1)
        // stage: 6 (0..5)
        // skill: 6 (0..5)
        // time: 101(0..100) -> to keep it simple
        // diff: 3  (0..2)

        int roleFactor = s.getRole();           // 0..1
        int stageFactor = s.getStorylineStage(); // 0..5
        int skillFactor = s.getSqlSkill();       // 0..5
        int timeFactor = s.getEngagementTime();  // 0..100
        int diffFactor = s.getPuzzleDifficulty();// 0..2

        // We'll flatten this:
        // index = roleFactor
        //        + stageFactor   * 2
        //        + skillFactor   * 2 * 6
        //        + timeFactor    * 2 * 6 * 6
        //        + diffFactor    * 2 * 6 * 6 * 101
        // It's crucial to keep the ranges consistent with environment constraints.

        int index = roleFactor;
        index += stageFactor * 2; 
        index += skillFactor * 2 * 6;
        index += timeFactor * 2 * 6 * 6;
        index += diffFactor * 2 * 6 * 6 * 101;
        return index;
    }

    private int argMax(double[] arr) {
        int bestIndex = 0;
        double maxVal = arr[0];
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > maxVal) {
                maxVal = arr[i];
                bestIndex = i;
            }
        }
        return bestIndex;
    }

    public double[][] getQTable() {
        return qTable;
    }
}
