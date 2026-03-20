let messageInput = document.getElementById("message-input");
let chatBox = document.getElementById("chat-box");
let fileInput = document.getElementById("file-input");
let submitBtn = document.getElementById("submit-btn");

let response = [
  ("All I Know Is", 10.0),
  ("Premak Basaat", 10.0),
  ("Widow of the Revolution: The Anna Larina Story", 10.0),
  ("Electric Burma", 10.0),
  ("Days of Géants", 10.0),
  ("Days of Géants II", 10.0),
  ("Pulling Power from the Sky: The Story of Makani", 10.0),
  ("Tari Sathe", 10.0),
  ("Don't Say Sorry", 10.0),
  ("Salzburg. Eine Kunstgeschichte.", 10.0),
];

submitBtn.addEventListener("click", function (event) {
  event.preventDefault();

  /*let text = "Hello, " + messageInput.value 
    chatBox.innerHTML = `<p>${text}</p>`*/

  for (row of response) {
    for (data in row) {
      chatBox.innerHTML += `<li>${row[data]}</li>`;
    }
  }
});
