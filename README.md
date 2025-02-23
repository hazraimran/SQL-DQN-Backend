# MeowMeowLand

## Description
This is a simple game for demonstration purpose that I created for CS7675. The game is called MeowMeowLand and it is an interactive game where you explore the fantasy world and practice your SQL skills as a local character. You have to collect information and make choices to get through the game. The game is written in TypeScript and uses reinforcement learning algorithm to personalize game experience and provide adaptive consequent storylines. The game is not very long, but it is fun and I hope you enjoy playing it!

## Installation

## Usage

## Game Design

## Project Structure
```bash
dqn-merchant-story/
│
├── package.json
├── tsconfig.json
├── .gitignore
├── .env
│
└── src/
    ├── server/
    │   └── SessionServer.ts  # Minimal Express server & session mgmt
    ├── environment/
    │   └── MerchantStoryEnv.ts
    ├── rl/
    │   ├── ReplayBuffer.ts
    │   ├── DQNAgent.ts
    │   └── QNetwork.ts
    ├── model/
    │   ├── types.ts          # State, Action, Transition definitions
    │   └── BranchGraph.ts    # Branching graph w/ merges
    ├── index.ts              # Demo usage
    └── config/
        └── difficulties.ts   # Info about levels, thresholds, etc.
```

## To-Do
- [ ] Database: Create a database to store game data.
- [ ] Database: Store the `uri` of database in `.env` file.
- [ ] Change to Matrix theme?
- [ ] Modify `PuzzleGenerator.ts` by switching to a non-naive algorithm for generating puzzles.
- [ ] Change `GameData.model.ts` to align with the purpose of this game.
- [ ] Define how to "encode" a `GameState` to a single integer index in `QLearning.ts`.