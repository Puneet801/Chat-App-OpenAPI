const socket = io();
const sendButton = document.getElementById("sendButton");

// Function to send a message
function sendMessage() {
  console.log("Sending Message");
  const messageInput = document.getElementById("message");
  let message = messageInput.value;
  // Send the message to the server's /openai-interact endpoint
  fetch("/openai-interact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Display the generated text from the OpenAI API
      message = "You: " + message;
      const assistantResponse = "Assistant: " + data.text.message.content;
      displayMessage(message, assistantResponse);
    })
    .catch((error) => {
      console.error("Error sending message to OpenAI:", error);
    });

  // Clear the message input field
  messageInput.value = "";
}

// Function to display a received message
function displayMessage(prompt, assistantResponse) {
  const messageList = document.getElementById("message-list");
  const liPrompt = document.createElement("li");
  liPrompt.textContent = prompt;
  messageList.appendChild(liPrompt);
  const liAssistant = document.createElement("li");
  liAssistant.textContent = assistantResponse;
  messageList.appendChild(liAssistant);
}

// Function to retrieve and display chat history
function displayChatHistory(userIP) {
  // Make an API request to fetch the chat history for the user
  fetch(`/chat-history?userIP=${userIP}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const messageList = document.getElementById("message-list");
      messageList.innerHTML = ""; // Clear the message list

      // Iterate through chat history and display messages
      data.forEach((chatMessage) => {
        const li = document.createElement("li");
        li.textContent = chatMessage.message;
        messageList.appendChild(li);
      });
    })
    .catch((error) => {
      console.error("Error fetching chat history:", error);
    });
}

window.onload = () => {
  socket.emit("connection"); // Ask the server for the user's IP
};
socket.on("user-ip", (userIP) => {
  // Include userIP in the request body when sending messages

  displayChatHistory(userIP);
});

// When the user connects, display their chat history
// socket.on("connect", () => {
// Assuming you have the user's IP address available (e.g., through a variable)
//   const userIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
//   displayChatHistory(userIP);
// });

// Add a click event listener to the button for sending a new message
sendButton.addEventListener("click", () => {
  sendMessage();
});

// Listen for incoming 'chat message' events from the server
socket.on("chat message", (message) => {
  displayMessage(message);
});
