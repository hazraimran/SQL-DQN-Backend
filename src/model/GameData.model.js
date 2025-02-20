"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const GameDataSchema = new mongoose_1.Schema({
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
exports.default = mongoose_1.default.model("GameData", GameDataSchema);
