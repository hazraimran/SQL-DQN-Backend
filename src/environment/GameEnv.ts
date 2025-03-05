import { BranchNode } from "../model/BranchGraph";
import { DifficultyConfig } from "../model/DifficultyConfig";

export class MerchantStoryEnv {
    private numQueries: number = 0;
    private correctQueries: number = 0;
    private branchGraph: BranchNode[];
    private difficulty: DifficultyConfig;

    constructor(branchGraph: BranchNode[], difficulty: DifficultyConfig) {
        this.branchGraph = branchGraph;
        this.difficulty = difficulty;
    }

    public runEpisode(usrInput: string): BranchNode {
        if (verifyUserInput(usrInput)) {
            this.correctQueries += 1;
        } else {
        }
        this.numQueries += 1;
    }
}