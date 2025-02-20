/**
 * Manages branching logic for Merchant vs Brave arcs.
 * We can add more roles and complexities later.
 */
export class StorylineManager {
    public addPracticeArc(role: number, stage: number, difficulty: number): void {
      if (role === 0) {
        console.log(`(Merchant) Additional practice arc at stage=${stage}, diff=${difficulty}`);
      } else {
        console.log(`(Brave) Additional practice arc at stage=${stage}, diff=${difficulty}`);
      }
    }
  
    public goToNextBigEvent(stage: number): number {
      console.log(`Moving to next big event (stage=${stage+1})`);
      return stage + 1;
    }
  }
  