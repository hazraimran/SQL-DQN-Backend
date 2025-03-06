export const easyQueries = {
  "explore schemas": {
    query: "\\d",
    expected: [
      { schema_name: "public" },
      { schema_name: "information_schema" }
    ]
  },

  "basic SELECT and FROM": {
    query: "SELECT name, status FROM residue;",
    expected: [
      { name: "Neo", status: "PotentialRebel" },
    //   { name: "Trinity", status: "PotentialRebel" },
    //   { name: "Morpheus", status: "Captain" }
    ]
  },

  "basic WHERE clause": {
    query: "SELECT name, status FROM residue WHERE status = 'PotentialRebel';",
    expected: [
      { name: "Neo", status: "PotentialRebel" },
    //   { name: "Trinity", status: "PotentialRebel" }
    ]
  },

  "Pattern Matching with LIKE": {
    // Fixed the expected field to match the columns (name, status)
    query: "SELECT name, status FROM residue WHERE name LIKE 'N%';",
    expected: [
      { name: "Neo", status: "PotentialRebel" }
    ]
  }
};