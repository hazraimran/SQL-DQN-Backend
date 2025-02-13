package com.meowmeowland.environment;

public enum PuzzleDifficult {
    EASY(0),
    MEDIUM(1),
    HARD(2);

    private final int value;
    PuzzleDifficulty(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public static PuzzleDifficulty fromValue(int v) {
        switch(v) {
            case 0: return EASY;
            case 1: return MEDIUM;
            case 2: return HARD;
            default: return EASY; // Fallback
        }
    }
}
