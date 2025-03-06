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

## SQL Concepts by Difficulty

### Easy Level
- Basic SELECT, FROM, WHERE
- Simple ORDER BY
- Basic INSERT, UPDATE, DELETE

### Medium Level
- JOINs (INNER, LEFT, RIGHT)
- GROUP BY and aggregate functions (COUNT, SUM, etc.)
- Subqueries in WHERE clauses

### Hard Level
- Window functions (ROW_NUMBER, RANK, etc.)
- Common Table Expressions (CTEs)
- Advanced subqueries (correlated subqueries)
- Transaction management and locking

## Matrix-Themed Story
In a dystopian future controlled by sentient machines, Neo awakens to find that multiple anomalies are emerging in the Matrix—pockets of unexplained data that threaten to corrupt the simulated world. Morpheus tasks you, the player, with helping Neo investigate these anomalies by running SQL queries to gather intelligence. Each challenge aligns with an SQL difficulty level.

---

### Easy Level: Identifying Rebels
**Plot**: Neo identifies a small group of potential rebels hidden among ordinary citizens in the residue table. You need to confirm their identities.

**Goal**: Execute a basic query to list these newly discovered rebels.

```SQL
SELECT name, status
FROM residue
WHERE status = 'PotentialRebel';
```

**Story Impact**: This helps Neo pinpoint who to rescue from the Matrix first.

---

### Medium Level: The Keymaker's Puzzle
**Plot**: Morpheus asks you to uncover old mission data scattered between the archives and mission_logs tables. The logs are incomplete, so combine them using proper joins, then reveal how many times the Keymaker was mentioned.

**Goal**: Perform a JOIN and an aggregate function.

```SQL
SELECT a.entry_id, a.mission_name, l-log_count
FROM archives a
JOIN (
  SELECT mission_name, COUNT(*) AS log_count
  FROM mission_logs
  WHERE reference LIKE '%Keymaker%'
  GROUP BY mission_name
) l ON a.mission_name = l.mission_name;
```

**Story Impact**: Understanding references to the Keymaker helps guide Neo to the next critical plot point.

---

### Hard Level: Agent Smith's Replication
**Plot**: Neo suspects a deeper conspiracy. He needs advanced analytics on Agent Smith’s replication events. The data is stored in multi_agent_events, but the events must be combined using a **Common Table Expression (CTE)** and a **window function** to reveal how frequently Smith replicates over time.

**Goal**: Investigate Smith replication using advanced SQL.

```SQL
WITH replication_events AS (
    SELECT agent_id, timestamp, location
    FROM multi_agent_events
    WHERE agent_replication = true
)
SELECT
    agent_id,
    location,
    timestamp,
    ROW_NUMBER() OVER (PARTITION BY agent_id ORDER BY timestamp) AS replication_rank
FROM replication_events
ORDER BY replication_rank;
```

**Story Impact**: By analyzing the rank of each replication event, Neo and Trinity can predict where and when Smith will appear next—crucial knowledge for planning an ambush and maintaining the integrity of the Matrix.

## Schema
```SQL
CREATE TABLE residue (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    status VARCHAR(50)
);
```

```SQL
CREATE TABLE archives (
    entry_id SERIAL PRIMARY KEY,
    mission_name VARCHAR(50),
    mission_description TEXT
);
```

```SQL
CREATE TABLE mission_logs (
    log_id SERIAL PRIMARY KEY,
    mission_name VARCHAR(50),
    reference TEXT
);
```

```SQL
CREATE TABLE multi_agent_events (
    event_id SERIAL PRIMARY KEY,
    agent_id INT,
    timestamp TIMESTAMP,
    location VARCHAR(50),
    agent_replication BOOLEAN
);
```