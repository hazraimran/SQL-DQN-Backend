package com.meowmeowland.environment;

import com.meowmeowland.model.GameState;
import com.meowmeowland.storyline.StorylineManager;
import com.meowmeowland.puzzle.PuzzleGenerator;

import java.util.Random;

/**
 * Manages the RL environment logic:
 *  - States: (role, storylineStage, skill, engagementTime, puzzleDifficulty)
 *  - Actions:
 *    0: Present puzzle
 *    1: Provide practice storyline (similar difficulty)
 *    2: Increase difficulty or move forward (if user is succeeding quickly)
 *    3: Branch storyline to next big event
 *
 *  We define step(...) that returns (newState, reward, done).
 */
public class SQLGameEnvironment {

    private static final int MAX_STAGE = 5;
    private static final int MAX_SKILL = 5;
    private static final int MAX_TIME = 100;  // Arbitrary upper bound for engagement
    private static final int ROLE_MERCHANT = 0;
    private static final int ROLE_BRAVE = 1;

    private final Random rand = new Random();
    private GameState currentState;
    private StorylineManager storylineManager;
    private PuzzleGenerator puzzleGenerator;

    public SQLGameEnvironment() {
        this.storylineManager = new StorylineManager();
        this.puzzleGenerator = new PuzzleGenerator();
    }

    /**
     * Reset environment to an initial state.
     * role = merchant(0) or brave(1) randomly for demonstration
     */
    public GameState reset() {
        int role = rand.nextBoolean() ? ROLE_MERCHANT : ROLE_BRAVE;
        int stage = 0;
        int skill = 0;
        int engagement = 0;
        int difficulty = 0; // start with EASY

        currentState = new GameState(role, stage, skill, engagement, difficulty);
        return currentState;
    }

    /**
     * Perform an action in the environment. Return [nextState, reward, done].
     */
    public StepResult step(int action) {
        int role = currentState.getRole();
        int stage = currentState.getStorylineStage();
        int skill = currentState.getSqlSkill();
        int timeSpent = currentState.getEngagementTime();
        int diff = currentState.getPuzzleDifficulty();

        boolean done = false;
        double reward = 0.0;

        switch (action) {
            case 0:
                // 0: Present a puzzle of current difficulty
                // We simulate user attempts
                boolean solved = puzzleGenerator.simulateUserSolving(diff, skill);
                if (solved) {
                    skill = Math.min(skill + 1, MAX_SKILL);
                    // Increase engagement time to represent spent time
                    timeSpent += 5; // e.g., user spent 5 units of time
                    reward += 10;   // correct query => higher reward
                } else {
                    // user spent time but failed => partial reward for time
                    timeSpent += 5;
                    reward += 2;    // small reward for "practice"
                }
                break;

            case 1:
                // 1: Provide practice storyline at the same difficulty
                // e.g., generate additional side quests or branching tasks
                storylineManager.addPracticeArc(role, stage, diff);
                // Engagement might go up because it's more comfortable
                timeSpent += 3;
                reward += 5;
                break;

            case 2:
                // 2: Increase difficulty or move forward if user is doing well
                if (diff < 2) {
                    diff++;
                    reward += 3; // Some moderate reward for progression
                } else {
                    // Already at hardest difficulty, maybe jump story stage
                    stage = Math.min(stage + 1, MAX_STAGE);
                    reward += 5;
                }
                timeSpent += 2;
                break;

            case 3:
                // 3: Move to next big event in the storyline
                stage = Math.min(stage + 1, MAX_STAGE);
                reward += 8;
                timeSpent += 4;
                break;

            default:
                // No-op
                break;
        }

        // Check if storyline is finished
        if (stage == MAX_STAGE) {
            done = true;
            reward += 20; // finishing the storyline gives big bonus
        }

        // Bound the engagement/time
        timeSpent = Math.min(timeSpent, MAX_TIME);

        // Update currentState
        currentState.setRole(role);
        currentState.setStorylineStage(stage);
        currentState.setSqlSkill(skill);
        currentState.setEngagementTime(timeSpent);
        currentState.setPuzzleDifficulty(diff);

        return new StepResult(new GameState(role, stage, skill, timeSpent, diff), reward, done);
    }

    public GameState getCurrentState() {
        return currentState;
    }

    public static class StepResult {
        public GameState nextState;
        public double reward;
        public boolean done;

        public StepResult(GameState nextState, double reward, boolean done) {
            this.nextState = nextState;
            this.reward = reward;
            this.done = done;
        }
    }
}
