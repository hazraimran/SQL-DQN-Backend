import mongoose, { Schema, Document } from "mongoose";

/**
 * Basic structure to store some game data. 
 * This is purely illustrative; you'll customize fields as needed.
 */
export interface IGameData extends Document {
  userId: string;
  timestamp: Date;
  action: number;
  reward: number;
  state: {
    role: number;
    storylineStage: number;
    sqlSkill: number;
    engagementTime: number;
    puzzleDifficulty: number;
  };
}

const GameDataSchema: Schema = new Schema({
  userId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  action: { type: Number, required: true },
  reward: { type: Number, required: true },
  state: {
    role: { type: Number, required: true },
    storylineStage: { type: Number, required: true },
    sqlSkill: { type: Number, required: true },
    engagementTime: { type: Number, required: true },
    puzzleDifficulty: { type: Number, required: true },
  },
});

export default mongoose.model<IGameData>("GameData", GameDataSchema);
