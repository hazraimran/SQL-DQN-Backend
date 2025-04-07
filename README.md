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
- [ ] Check why the DQN agent will choose the same action once when the mastery is equal to 1.
- [ ] Final version: get `theme`, `concepts` and `schema` from user, then generate a similar layout of existing games to let students play.
- [ ] Write tests, fix bugs and check for edge cases.

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
### Cyberpunk
- `residue`
    | column_name | data_type    |
    | ----------- | ------------ |
    | name        | VARCHAR (50) |
    | status      | VARCHAR (50) |

    | name     | status              |
    | -------- | ------------------- |
    | Neo      | PotentialRebel      |
    | Trinity  | PotentialRebel      |
    | Morpheus | Captain             |
    | Jane Doe | null                |
    | Smith    | EliminationProtocol |
    
- `archives`
    | column_name         | data_type    |
    | ------------------- | ------------ |
    | mission_id          | INT          |
    | mission_name        | VARCHAR (50) |
    | mission_description | TEXT         |

    | mission_id | mission_name         | mission_description                              |
    | ---------- | -------------------- | ------------------------------------------------ |
    | 1          | Free The Mind        | An attempt to awaken humanity.                   |
    | 2          | Locate The Key-maker | Securing the Keymaker for the Source.            |
    | 3          | Defend Zion          | Protect the last human city from Sentinels.      |
    | 4          | Rescue Operator      | An operator has gone missing in the field.       |
    | 5          | Eliminate Virus      | Suspected virus detected within the Matrix code. |

- `mission_logs`
    | column_name  | data_type   |
    | ------------ | ----------- |
    | mission_name | VARCHAR(50) |
    | agent_id     | INT         |
    | reference    | TEXT        |

    | mission_name    | agent_id | reference                                     |
    | --------------- | -------- | --------------------------------------------- |
    | Free The Mind   | 101      | Operation started, Morpheus leads             |
    | Free The Mind   | 101      | Strange glitch observed in downtown           |
    | Defend Zion     | 103      | Sentinel swarm approaching main gate          |
    | Eliminate Virus | 102      | Agent Smith anomaly flagged for investigation |
    
- `multi_agent_events`
    | column_name       | data_type   |
    | ----------------- | ----------- |
    | agent_id          | INT         |
    | timestamp         | TIMESTAMP   |
    | location          | VARCHAR(50) |
    | agent_replication | BOOLEAN     |
    
    | agent_id | timestamp           | location      | agent_replication |
    | -------- | -------- | ------------------- | --------------- |
    | 101      | 2023-01-01 09:15:00 | Downtown      | FALSE             |
    | 101      | 2023-01-01 09:30:00 | Downtown      | FALSE             |
    | 102      | 2023-01-01 10:00:00 | Rooftop       | TRUE              |
    | 102      | 2023-01-01 10:15:00 | SubwayStation | TRUE              |
    | 103      | 2023-01-01 10:30:00 | NULL          | FALSE             |
