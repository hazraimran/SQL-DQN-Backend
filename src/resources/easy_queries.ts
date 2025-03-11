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
      { name: 'Jane Doe', status: null },
      { name: 'Morpheus', status: 'Captain' },
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
    ]
  },

  2: {
    // Fixed the expected field to match the columns (name, status)
    branchName: "Pattern Matching with LIKE",
    storyNarrative: `
      Neo needs to find rebels with names that start from the letter 'T'.
    `,
    expected: [
        { name: "Trinity", status: "PotentialRebel" },
    ]
  },

  3: {
    branchName: "Handling NULL values",
    storyNarrative: `
      Neo needs to find humans with unknown - 'null' status and set them to 'PotentialRebel'.
    `,
    expected: [
        { name: 'Jane Doe', status: null },
        "UPDATE 1",
    ]
    },

    4: {
    branchName: "ORDER BY clause",
    storyNarrative: `
      Neo needs to sort the rebels by their names.
    `,
    expected: [
        { name: 'Jane Doe', status: 'PotentialRebel' },
        { name: "Morpheus", status: "Captain" },
        { name: "Neo", status: "PotentialRebel" },
        { name: "Trinity", status: "PotentialRebel" },
    ]
    },

    5: {
    branchName: "INSERT Statement",
    storyNarrative: `
      Neo needs to add a new rebel to the 'residue' table.
    `,
    expected: [
        "INSERT 0 1"
    ]
    },

    6: {
    branchName: "UPDATE Statement",
    storyNarrative: `
      Neo needs to update the status of Trinity to 'Partner'.
    `,
    expected: [
        "UPDATE 1"
    ]
    },

    7: {
    branchName: "DELETE Statement",
    storyNarrative: `
      Neo needs to remove Jane Doe from the 'residue' table.
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