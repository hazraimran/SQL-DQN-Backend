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

        <label>Schema:</label><br/>
        <input type="text" id="schemaInput" /><br/><br/>

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
    const schema = schemaInput.value.trim();
    const concepts = [];

    conceptCheckboxes.forEach(chk => {
      if (chk.checked) {
        concepts.push(chk.value);
      }
    });

    // Post the form data to /settings
    const resp = await fetch("/settings", {
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

        // call /api/submitQuery with { action, userQuery }
        const resp = await fetch("/api/submitQuery", {
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
        outputElem.textContent = "Chosen Action: " + data.action + "\n";

        // optionally, you might also show the actual DB rows if the server returned them
        if (data.dbOutput) {
            outputElem.textContent += "\n" + data.dbOutput;
        }
    });
});
