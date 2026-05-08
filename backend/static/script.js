let messageInput = document.getElementById("message-input"); // MESSAGE INPUT FIELD
let chatBox = document.getElementById("chat-box"); // CHAT BOX CONTAINER
let submitBtn = document.getElementById("submit-btn"); // SUBMIT BUTTON
const form = document.querySelector("form"); // FORM ELEMENT
const uploadBtn = document.getElementById("upload-btn"); // + BUTTON
const fileInput = document.getElementById("file-input"); // HIDDEN FILE INPUT

// upload file to Flask to upload route
function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  fetch("/upload", {
    method: "POST",
    body: formData
  })
  .then(response => response.json())};

// render table for query output
function createTable(columns, results) {
  // table with light background and subtle borders
  let table = "<table class='min-w-full border border-gray-200 rounded-lg bg-white'>";

  // table header
  table += "<thead class='bg-gray-100'>";
  table += "<tr>";
  columns.forEach(col => {
    table += `<th class='border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-700'>${col}</th>`;
  });
  table += "</tr></thead>";

  // table body
  table += "<tbody>";
  results.forEach(row => {
    table += "<tr class='hover:bg-gray-50'>";
    row.forEach(cell => {
      table += `<td class='border border-gray-200 px-4 py-2 text-sm text-gray-800'>${cell}</td>`;
    });
    table += "</tr>";
  });
  table += "</tbody></table>";

  return table;
}

// select file
uploadBtn.addEventListener("click", () => {
  fileInput.click();
});
// change if then upload
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0]; // selects the first file

  uploadFile(file); // call javascript upload function to send file to Flask
});


form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = messageInput.value.trim();
  if (!question) return;

  // show user message
  chatBox.innerHTML += `
    <div class="flex justify-end">
      <div class="bg-yellow-400 text-black px-4 py-2 rounded-lg">
        ${question}
      </div>
    </div>
  `;
  messageInput.value = "";

  // send to Flask
  const response = await fetch("/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question })
  });

  const data = await response.json();
  console.log(data);

  if (data.error) {
    chatBox.innerHTML += `
      <div class="flex justify-start">
        <div class="bg-red-500 text-white px-4 py-2 rounded-lg">
          Error: ${data.error}
        </div>
      </div>
    `;
  } else {
    // show AI explanation
    chatBox.innerHTML += `
      <div class="flex justify-start">
        <div class="bg-gray-800 text-white px-4 py-2 rounded-lg max-w-lg">
          <p class="text-sm font-medium mb-1 text-yellow-400">Assistant:</p>
          <p class="text-gray-200">${data.explanation}</p>
        </div>
      </div>
    `;

    // show results table if there are any
    if (data.results && data.results.length > 0) {
      chatBox.innerHTML += `
        <div class="flex justify-start mb-3 w-full">
          <div class="bg-black text-white-800 px-4 py-3 rounded-2xl max-w-full overflow-x-auto">
            ${createTable(data.columns, data.results)}
          </div>
        </div>
      `;
    } else if (data.results && data.results.length === 0) {
        chatBox.innerHTML += `
        <div class="flex justify-start">
          <div class="bg-gray-800 text-gray-400 px-4 py-2 rounded-lg italic">
            No results found.
          </div>
        </div>
      `;
    }
  }

  // scroll to bottom
  chatBox.scrollTop = chatBox.scrollHeight;
});