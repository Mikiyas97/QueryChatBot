let messageInput = document.getElementById("message-input");
let chatBox = document.getElementById("chat-box");
let fileInput = document.getElementById("file-input");
let submitBtn = document.getElementById("submit-btn");
const form = document.querySelector("form");

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
  console.log(data.results);

  // show AI query
  chatBox.innerHTML += `
    <div class="flex justify-start">
      <div class="bg-gray-700 px-4 py-2 rounded-lg">
        ${data.query}
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
  }

  // scroll to bottom
  chatBox.scrollTop = chatBox.scrollHeight;
});