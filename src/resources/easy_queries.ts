export const easyQueries = {
  0: {
    branchName: "basic SELECT and FROM",
    storyNarrative: `
      Neo is on a mission to identify potential rebels in the Matrix.
      He needs to query the 'residue' table to find them.
    `,
    expected: [
      { name: "Neo", status: "PotentialRebel" },
      { name: "Trinity", status: "PotentialRebel" },
      // { name: 'Jane Doe', status: null },
      // { name: 'Jane Doe', status: null },
    ]
  },

  1: {
    branchName: "basic WHERE clause",
    storyNarrative: `
      Neo needs to narrow down his search to only those rebels
      who have a high probability of being The One.
    `,
    expected: [
        { name: "Neo", status: "PotentialRebel" },
        { name: "Trinity", status: "PotentialRebel" },
        // { name: 'Jane Doe', status: null },
        // { name: 'Jane Doe', status: null },
    ]
  },

  2: {
    // Fixed the expected field to match the columns (name, status)
    branchName: "Pattern Matching with LIKE",
    storyNarrative: `
      Neo needs to find rebels with names that contain the letter 'e'.
    `,
    expected: [
        { name: "Neo", status: "PotentialRebel" },
        { name: "Trinity", status: "PotentialRebel" },
        // { name: 'Jane Doe', status: null },
        // { name: 'Jane Doe', status: null },
    ]
  },

  3: {
    branchName: "Handling NULL values",
    storyNarrative: `
      Neo needs to find rebels with unknown status.
    `,
    expected: [
        { name: "Neo", status: "PotentialRebel" },
        { name: "Trinity", status: "PotentialRebel" },
        // { name: 'Jane Doe', status: null },
        // { name: 'Jane Doe', status: null },
    ]
    },

    4: {
    branchName: "ORDER BY clause",
    storyNarrative: `
      Neo needs to sort the rebels by their names.
    `,
    expected: [
        { name: "Neo", status: "PotentialRebel" },
        { name: "Trinity", status: "PotentialRebel" },
        // { name: "Morpheus", status: "Captain" }
    ]
    },

    5: {
    branchName: "INSERT Statement",
    storyNarrative: `
      Neo needs to add a new rebel to the 'residue' table.
    `,
    expected: [
        "1 row inserted."
    ]
    },

    6: {
    branchName: "UPDATE Statement",
    storyNarrative: `
      Neo needs to update the status of a rebel in the 'residue' table.
    `,
    expected: [
        "1 row updated."
    ]
    },

    7: {
    branchName: "DELETE Statement",
    storyNarrative: `
      Neo needs to remove a rebel from the 'residue' table.
    `,
    expected: [
        "DELETE 1"
    ]
    },

    8: {
    branchName: "Basic TRANSACTION Usage (ROLLBACK)",
    storyNarrative: `
      Neo needs to perform a transaction that should be rolled back.
    `,
    expected: [
        "START TRANSACTION",
        "ROLLBACK",
    ]
    },

    9: {
    branchName: "Basic TRANSACTION Usage (COMMIT)",
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