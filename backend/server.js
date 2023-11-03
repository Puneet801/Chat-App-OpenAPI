import express from "express";
import http from "http";
import { Server } from "socket.io";
import { dirname } from "path";
import * as path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import { ChatUser, ChatMessage } from "./schema.js";
import mongooseConnection from "./db.js";

//OpenAPI API Key = "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"
//OpenAI API Key Atul = "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"
const openAIAPIKey = "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";

const app = express();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server);

const openai = new OpenAI({ apiKey: openAIAPIKey });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static("frontend"));
app.use(express.json());

app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "..", "frontend", "index.html");
  res.sendFile(filePath);
});

app.post("/openai-interact", async (req, res) => {
  try {
    const { message } = req.body;
    const userIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Make a call to the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: message }],
    });

    // Extract the generated text from the response
    const generatedText = response.choices[0];
    console.log(generatedText);
    const user = await ChatUser.findOne({ userIP }).exec();
    if (user) {
      // User exists, add the new message to their chat history
      const newUserMessage = new ChatMessage({ message: "User: " + message });
      const newAssistantMessage = new ChatMessage({
        message: "Assistant: " + generatedText.message.content,
      });
      user.chatHistory.push(newUserMessage);
      user.chatHistory.push(newAssistantMessage);
      await user.save();
    } else {
      // User doesn't exist, create a new user with the chat history
      const newUser = new ChatUser({
        userIP,
        chatHistory: [
          { message: "User : " + message },
          { message: "Assistant: " + generatedText.message.content },
        ],
      });
      await newUser.save();
    }

    // Send the generated text as the response
    res.json({ text: generatedText });
  } catch (error) {
    console.error("Error interacting with OpenAI:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Example route to retrieve chat history for a user
app.get("/chat-history", async (req, res) => {
  const { userIP } = req.query;

  try {
    const user = await ChatUser.findOne({ userIP }).exec();
    if (user) {
      const chatHistory = user.chatHistory; // This is the user's chat history
      res.json(chatHistory);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("Error retrieving chat history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");
  const userIP =
    socket.handshake.headers["x-forwarded-for"] || socket.handshake.address;
  socket.emit("user-ip", userIP);
  socket.on("chat message", (message) => {
    io.emit("chat message", message);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

process.on("SIGINT", () => {
  closeConnection();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
