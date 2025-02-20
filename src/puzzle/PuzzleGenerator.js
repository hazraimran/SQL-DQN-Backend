"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuzzleGenerator = void 0;
const PuzzleDifficulty_1 = require("../model/PuzzleDifficulty");
/**
 * We define placeholders for:
 * - Generating puzzle statements
 * - Evaluating user-submitted SQL against a role-specific schema
 */
class PuzzleGenerator {
    /**
     * Generate a puzzle prompt depending on role & difficulty.
     *
     * e.g., Merchant: SELECT * FROM grass_medicine WHERE ...
     * Brave: SELECT * FROM weapons WHERE ...
     * This returns a "prompt" or instructions the user must solve.
     */
    generatePuzzlePrompt(role, difficulty) {
        // Simplified placeholder
        if (role === 0) {
            // Merchant
            switch (difficulty) {
                case PuzzleDifficulty_1.PuzzleDifficulty.EASY:
                    return "Find the first 5 items in 'grass_medicine' table.";
                case PuzzleDifficulty_1.PuzzleDifficulty.MEDIUM:
                    return "Get 'prize' records where the cost is greater than 100.";
                case PuzzleDifficulty_1.PuzzleDifficulty.HARD:
                default:
                    return "Join 'customer' and 'prize' to list all customers who bought item X.";
            }
        }
        else {
            // Brave
            switch (difficulty) {
                case PuzzleDifficulty_1.PuzzleDifficulty.EASY:
                    return "Select * from 'weapons' where type='sword';";
                case PuzzleDifficulty_1.PuzzleDifficulty.MEDIUM:
                    return "Find 'usage' records used in the last 3 quests.";
                case PuzzleDifficulty_1.PuzzleDifficulty.HARD:
                default:
                    return "Join 'teammates' and 'weapons' to find top damage combos.";
            }
        }
    }
    /**
     * Evaluate a user-submitted query.
     * We only do naive checks here. In production, use a real SQL parser or a sandboxed DB environment.
     *
     * @param userQuery The query string from the user
     * @param role The player's role (0=merchant,1=brave) to decide which schema to check
     * @returns boolean: whether query is "correct"
     */
    evaluateUserQuery(userQuery, role, puzzlePrompt) {
        // Very naive approach: check if user query references correct tables or keywords
        // In real code, parse the query with a library or check actual DB results.
        // Example: For merchant, we expect references to grass_medicine, prize, or customer
        // For brave, we expect references to weapons, usage, or teammates
        let requiredTables = [];
        if (role === 0) {
            requiredTables = ["grass_medicine", "prize", "customer"];
        }
        else {
            requiredTables = ["weapons", "usage", "teammates"];
        }
        const queryLower = userQuery.toLowerCase();
        // Naive check: does the query contain at least one relevant table name from the puzzle prompt?
        // The puzzlePrompt itself can guide us which table is needed.
        // We just check if any table from the role is present in the user's query. 
        // You could parse puzzlePrompt to see exactly which table is required.
        for (const table of requiredTables) {
            if (puzzlePrompt.toLowerCase().includes(table) && queryLower.includes(table)) {
                // If puzzle prompt references "customer", user must mention "customer"
                // This is a simplistic approach that you can refine.
                return true;
            }
        }
        return false;
    }
}
exports.PuzzleGenerator = PuzzleGenerator;
