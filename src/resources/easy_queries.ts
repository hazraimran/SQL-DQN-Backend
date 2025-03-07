export const easyQueries = {
  "basic SELECT and FROM": {
    branchId: 0.0,
    storyNarrative: `
      Neo is on a mission to identify potential rebels in the Matrix.
      He needs to query the 'residue' table to find them.
    `,
    expected: [
      { name: "Neo", status: "PotentialRebel" },
      { name: "Trinity", status: "PotentialRebel" },
      { name: 'Jane Doe', status: null },
      { name: 'Jane Doe', status: null },
    ]
  },

  "basic WHERE clause": {
    branchId: 0.1,
    storyNarrative: `
      Neo needs to narrow down his search to only those rebels
      who have a high probability of being The One.
    `,
    expected: [
        { name: "Neo", status: "PotentialRebel" },
        { name: "Trinity", status: "PotentialRebel" },
        { name: 'Jane Doe', status: null },
        { name: 'Jane Doe', status: null },
    ]
  },

  "Pattern Matching with LIKE": {
    // Fixed the expected field to match the columns (name, status)
    branchId: 0.2,
    storyNarrative: `
      Neo needs to find rebels with names that contain the letter 'e'.
    `,
    expected: [
        { name: "Neo", status: "PotentialRebel" },
        { name: "Trinity", status: "PotentialRebel" },
        { name: 'Jane Doe', status: null },
        { name: 'Jane Doe', status: null },
    ]
  },

  "Handling NULL values": {
    branchId: 0.3,
    storyNarrative: `
      Neo needs to find rebels with unknown status.
    `,
    expected: [
        { name: "Neo", status: "PotentialRebel" },
        { name: "Trinity", status: "PotentialRebel" },
        { name: 'Jane Doe', status: null },
        { name: 'Jane Doe', status: null },
    ]
    },

    "ORDER BY": {
    branchId: 0.4,
    storyNarrative: `
      Neo needs to sort the rebels by their names.
    `,
    expected: [
        { name: "Neo", status: "PotentialRebel" },
        { name: "Trinity", status: "PotentialRebel" },
        { name: "Morpheus", status: "Captain" }
    ]
    },

    "INSERT Statement": {
    branchId: 0.5,
    storyNarrative: `
      Neo needs to add a new rebel to the 'residue' table.
    `,
    expected: [
        "1 row inserted."
    ]
    },

    "UPDATE Statement": {
    branchId: 0.6,
    storyNarrative: `
      Neo needs to update the status of a rebel in the 'residue' table.
    `,
    expected: [
        "1 row updated."
    ]
    },

    "DELETE Statement": {
    branchId: 0.7,
    storyNarrative: `
      Neo needs to remove a rebel from the 'residue' table.
    `,
    expected: [
        "1 row deleted."
    ]
    },

    "Basic TRANSACTION Usage (ROLLBACK)": {
    branchId: 0.8,
    storyNarrative: `
      Neo needs to perform a transaction that should be rolled back.
    `,
    expected: [
        "START TRANSACTION",
        "ROLLBACK",
    ]
    },

    "Basic TRANSACTION Usage (COMMIT)": {
    branchId: 0.9,
    storyNarrative: `
      Neo needs to perform a transaction
      that should be committed.
    `,
    expected: [
        "START TRANSACTION",
        "COMMIT",
    ]
    },
};