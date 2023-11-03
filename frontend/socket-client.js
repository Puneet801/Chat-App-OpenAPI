const socket = io();
const sendButton = document.getElementById("sendButton");

function sendMessage() {
  console.log("Sending Message");
  const messageInput = document.getElementById("message");
  let message = messageInput.value;

  fetch("/openai-interact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  })
    .then((response) => response.json())
    .then((data) => {
      message = "You: " + message;
      const assistantResponse = "Assistant: " + data.text.message.content;
      displayMessage(message, assistantResponse);
    })
    .catch((error) => {
      console.error("Error sending message to OpenAI:", error);
    });

  messageInput.value = "";
}

function displayMessage(prompt, assistantResponse) {
  const messageList = document.getElementById("message-list");
  const liPrompt = document.createElement("li");
  liPrompt.textContent = prompt;
  messageList.appendChild(liPrompt);
  const liAssistant = document.createElement("li");
  liAssistant.textContent = assistantResponse;
  messageList.appendChild(liAssistant);
}

function displayChatHistory(userIP) {
  fetch(`/chat-history?userIP=${userIP}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const messageList = document.getElementById("message-list");
      messageList.innerHTML = "";

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
  socket.emit("connection");
};
socket.on("user-ip", (userIP) => {
  displayChatHistory(userIP);
});
sendButton.addEventListener("click", () => {
  sendMessage();
});

socket.on("chat message", (message) => {
  displayMessage(message);
});
