let messageInput = document.getElementById("message-input");
let chatBox = document.getElementById("chat-box");
let fileInput = document.getElementById("file-input");
let submitBtn = document.getElementById("submit-btn");

/*
async function getData() {
  let response = await fetch("http://127.0.0.1:5000/ask")
  let data = await response.json()
  console.log(data)
}
*/

// send button function
submitBtn.addEventListener("click", function(){

  chatBox.innerText = messageInput.value

})
