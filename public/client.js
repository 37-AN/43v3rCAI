// Get form elements
const dbForm = document.getElementById("databaseForm");
const dbResponseEl = document.getElementById("dbResponse");

// Handle form submission
dbForm.onsubmit = async function (event) {
  event.preventDefault();

  // Get the database name from the form
  const dbName = event.target.dbName.value;
  const body = JSON.stringify({ dbName });

  // Make request to server
  try {
    const newDBResponse = await fetch("/databases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
    const newDBData = await newDBResponse.json();
    appendApiResponse(newDBData, dbResponseEl);
  } catch (error) {
    console.error("Error:", error);
    appendApiResponse({ message: "error", error }, dbResponseEl);
  }
};

// Append API response to UI
const appendApiResponse = function (apiResponse, el) {
  // Clear previous responses
  el.innerHTML = '';
  
  // Add success message to UI
  const newParagraphSuccessMsg = document.createElement("p");
  newParagraphSuccessMsg.innerHTML = "Result: " + apiResponse.message;
  el.appendChild(newParagraphSuccessMsg);

  // See browser console for more information if there's an error
  if (apiResponse.message === "error") return;

  // Add ID of Notion item to UI
  const newParagraphId = document.createElement("p");
  newParagraphId.innerHTML = "ID: " + apiResponse.data.id;
  el.appendChild(newParagraphId);

  // Add URL of Notion item to UI
  if (apiResponse.data.url) {
    const newAnchorTag = document.createElement("a");
    newAnchorTag.setAttribute("href", apiResponse.data.url);
    newAnchorTag.innerText = apiResponse.data.url;
    el.appendChild(newAnchorTag);
  }
}; 