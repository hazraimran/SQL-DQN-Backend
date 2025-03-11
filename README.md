# MatrixSQL-DQN

## Description
This is a simple game/ framework for demonstration purpose that I designed for CS7675. MatrixSQL-DQN is a text-based adventure game where players solve SQL puzzles to progress through a narrative set in the Matrix universe. A DQN-based reinforcement learning agent manages puzzle selection, ensuring that the difficulty scales with the user’s capabilities. Also, although for demonstration purpose it is following the Matrix universe now, the game itself as a framework is designed to be extensible, allowing for custom themes and stories to be plugged in.

## Features
- **Reinforcement Learning Integration**: The DQNAgent responds to the user’s performance by deciding which puzzle to present next.
- **SQL puzzles**: Players solve puzzles by running SQL queries to interact with the game world.
- **Difficulty levels**: Puzzles are categorized into easy, medium, and hard levels based on SQL concepts.
- **Story-driven gameplay**: The game has a narrative that unfolds as players progress through the puzzles.
- **Self-defined theme**: As a framework, you can plug in your own theme and story to create a custom game experience.

## Usage
1. Clone the repository.
2. Install the dependencies using `npm install`.
3. Run the server using `npx tsx src/main.ts`.
4. Follow the instructions on the console to interact with the game.

## Project Structure
```bash
matrix-sql-dqn/
│
├── package.json
├── src/
│   ├── agent/
│   │   ├── DQNAgent.ts          # DQN logic (chooseAction, training, replay buffer)
│   │   ├── ReplayBuffer.ts
│   │   └── QNetwork.ts
│   ├── environment/
│   │   └── MatrixSQLEnvironment.ts  # Handles transitions and state for the puzzles
│   ├── resources/
│   │   ├── easy_queries.ts      # Easy-level query definitions
│   │   └── data_generator.py    # Offline data generation
│   ├── shared/
│   │   ├── difficulties.ts      # Game difficulty definitions
│   │   ├── types.ts             # Shared types and interfaces
│   │   └── utilities.ts             # Shared utility functions
│   └── main.ts                  # Entry point and main game logic
├── README.md
```

## To-Do
- [ ] Integrate LLM model for generating storylines based on specific queries and theme.
- [ ] Add queries for the medium and hard levels.
- [x] Modify the current storyline to let each query have a correct answer.
- [ ] Check why the DQN agent will choose the same action once when the mastery is equal to 1.
- [x] Delete unnecessary attributes in the `MatrixSQLEnvironment`.
- [x] Split into two functions to handle online and offline interactions.

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