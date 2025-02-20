"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorylineManager = void 0;
/**
 * Manages branching logic for Merchant vs Brave arcs.
 * We can add more roles and complexities later.
 */
class StorylineManager {
    addPracticeArc(role, stage, difficulty) {
        if (role === 0) {
            console.log(`(Merchant) Additional practice arc at stage=${stage}, diff=${difficulty}`);
        }
        else {
            console.log(`(Brave) Additional practice arc at stage=${stage}, diff=${difficulty}`);
        }
    }
    goToNextBigEvent(stage) {
        console.log(`Moving to next big event (stage=${stage + 1})`);
        return stage + 1;
    }
}
exports.StorylineManager = StorylineManager;
