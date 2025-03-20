const easyQueries = {
  0: {
    branchName: "basic SELECT and FROM",
    storyNarrative: `
      Neo is on a mission to identify potential rebels in the Matrix.
      He needs to query the 'residue' table to find them.
    `,
    expected: [
      { name: "Neo", status: "PotentialRebel" },
      { name: "Trinity", status: "PotentialRebel" },
      { name: 'Jane Doe', status: "PotentialRebel" },
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
    branchName: "pattern matching with LIKE",
    storyNarrative: `
      Neo needs to find rebels with names that start from the letter 'T'.
    `,
    expected: [
        { name: "Trinity", status: "PotentialRebel" },
    ]
  },

  3: {
    branchName: "handle NULL values",
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
    branchName: "basic TRANSACTION usage (ROLLBACK)",
    storyNarrative: `
      Neo needs to perform a transaction that should be rolled back.
    `,
    expected: [
        "START TRANSACTION",
        "ROLLBACK",
    ]
    },

    9: {
    branchName: "basic TRANSACTION usage (COMMIT)",
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


async function initAgentEnv() {
    const resp = await fetch("/api/init");
    const data = await resp.json();
    console.log("Init response:", data);
}

// handle "Submit" button
document.addEventListener("DOMContentLoaded", () => {
    // Insert modal HTML
    const modalHtml = `
    <div id="settingsModal" style="
      position: fixed; 
      top: 0; left: 0; 
      width: 100%; height: 100%; 
      background-color: rgba(0,0,0,0.5);
      display: flex; 
      justify-content: center; 
      align-items: center;
      z-index: 9999;">
      <div style="
        background: #fff; 
        padding: 20px; 
        border-radius: 6px;
        width: 300px;">
        <h3>Game Settings</h3>
        <label>Theme:</label><br/>
        <input type="text" id="themeInput" /><br/><br/>

        <!-- Schema Table UI -->
        <label>Schema (table details):</label><br/>
        <div id="schemaBuilder">
          <label>Table Name:</label>
          <input type="text" id="tableNameInput" /><br/><br/>

          <table id="columnsTable">
            <thead>
              <tr>
                <th>Column Name</th>
                <th>Type</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><input type="text" class="colName" /></td>
                <td><input type="text" class="colType" /></td>
                <td><button type="button" class="add-col-btn">+</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <br/>

        <label>Concepts:</label><br/>
        <label><input type="checkbox" class="conceptCheckbox" value="joins" /> JOINS</label><br/>
        <label><input type="checkbox" class="conceptCheckbox" value="groupBy" /> GROUP BY</label><br/>
        <label><input type="checkbox" class="conceptCheckbox" value="window" /> Window Functions</label><br/><br/>

        <button id="saveSettingsBtn">Save</button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);

  const modal = document.getElementById("settingsModal");
  const themeInput = document.getElementById("themeInput");
  const schemaInput = document.getElementById("schemaInput");
  const conceptCheckboxes = document.querySelectorAll(".conceptCheckbox");
  const saveBtn = document.getElementById("saveSettingsBtn");

  saveBtn.addEventListener("click", async () => {
    const theme = themeInput.value.trim();
    const tableName = document.getElementById("tableNameInput").value.trim();
    const columnsTableRows = document.querySelectorAll("#columnsTable tbody tr");

    const columns = [];
    columnsTableRows.forEach((row) => {
      const colName = row.querySelector(".colName")?.value.trim() || "";
      const colType = row.querySelector(".colType")?.value.trim() || "";
      if (colName) {
        columns.push({ colName, colType });
      }
    });

    const concepts = [];
    conceptCheckboxes.forEach(chk => { if (chk.checked) concepts.push(chk.value); });

    // Build the final schema object or string as needed
    const schema = {
      tableName,
      columns
    };

    // Example: POST to / with { theme, schema, concepts }
    const resp = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme, schema, concepts })
    });
    if (resp.ok) {
      console.log("Settings saved successfully.");
      modal.style.display = "none";
    } else {
      console.error("Error saving settings.");
    }
  });

    const submitBtn = document.getElementById("submit-btn");
    const queryInput = document.getElementById("user-query");
    const outputElem = document.getElementById("db-output");
    const masteryElem = document.getElementById("mastery-display");

    // Initialize agent & environment on load
    initAgentEnv();

    submitBtn.addEventListener("click", async () => {
        // Optionally ask agent for recommended action first
        // let getActionResp = await fetch("/api/getAction");
        // let recommended = await getActionResp.json();
        // let action = recommended.action;  // e.g. how the agent picks ?

        // For demonstration, let's pick action=0 if user is not specifying
        let action = 0;

        // read user query from input
        const userQuery = queryInput.value;
        if (!userQuery.trim()) {
            alert("Please enter an SQL query.");
            return;
        }

        // call /game with { action, userQuery }
        const resp = await fetch("/game", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, userQuery }),
        });
        const data = await resp.json();

        if (data.error) {
            outputElem.textContent = "Error: " + data.error;
            return;
        }
        // Show the updated mastery and reward
        masteryElem.textContent =
            "New mastery: " +
            data.newMastery.map((m) => m.toFixed(2)).join(", ");
        
        outputElem.textContent = "Query: " + easyQueries[data.action].storyNarrative + "\n" + "Chosen Action: " + data.action + "\n";

        // optionally, you might also show the actual DB rows if the server returned them
        if (data.dbOutput) {
            outputElem.textContent += "\n" + data.dbOutput;
        }
    });
});

// Listen for clicks on the + (add column) or - (remove) buttons
document.addEventListener("click", (ev) => {
  if (ev.target.classList.contains("add-col-btn")) {
    ev.preventDefault();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="text" class="colName" /></td>
      <td><input type="text" class="colType" /></td>
      <td><button type="button" class="remove-col-btn">-</button></td>
    `;
    const tbody = document.querySelector("#columnsTable tbody");
    tbody.appendChild(row);
  } else if (ev.target.classList.contains("remove-col-btn")) {
    ev.preventDefault();
    ev.target.closest("tr").remove();
  }
});
