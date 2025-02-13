package com.meowmeowland.model;

/**
 * Represents the state of the game for RL.
 * We store:
 *  - role: 0 = Merchant, 1 = Brave
 *  - storylineStage: tracks major plot progress
 *  - sqlSkill: integer measure of skill
 *  - engagementTime: how much time spent (simplified as an integer for demonstration)
 *  - puzzleDifficulty: 0 = EASY, 1 = MEDIUM, 2 = HARD
 */
public class GameState {
    private int role;               // 0 or 1 for now
    private int storylineStage;     // e.g., 0..5
    private int sqlSkill;           // 0..5 scale
    private int engagementTime;     // time spent
    private int puzzleDifficulty;   // 0=easy,1=med,2=hard

    public GameState(int role, int storylineStage, int sqlSkill, int engagementTime, int puzzleDifficulty) {
        this.role = role;
        this.storylineStage = storylineStage;
        this.sqlSkill = sqlSkill;
        this.engagementTime = engagementTime;
        this.puzzleDifficulty = puzzleDifficulty;
    }

    // --- Getters / Setters ---
    public int getRole() {
        return role;
    }
    public void setRole(int role) {
        this.role = role;
    }

    public int getStorylineStage() {
        return storylineStage;
    }
    public void setStorylineStage(int storylineStage) {
        this.storylineStage = storylineStage;
    }

    public int getSqlSkill() {
        return sqlSkill;
    }
    public void setSqlSkill(int sqlSkill) {
        this.sqlSkill = sqlSkill;
    }

    public int getEngagementTime() {
        return engagementTime;
    }
    public void setEngagementTime(int engagementTime) {
        this.engagementTime = engagementTime;
    }

    public int getPuzzleDifficulty() {
        return puzzleDifficulty;
    }
    public void setPuzzleDifficulty(int puzzleDifficulty) {
        this.puzzleDifficulty = puzzleDifficulty;
    }

    @Override
    public String toString() {
        return String.format("GameState(role=%d, stage=%d, skill=%d, time=%d, diff=%d)",
                role, storylineStage, sqlSkill, engagementTime, puzzleDifficulty);
    }
}