import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  message: String,
});

const chatUserSchema = new mongoose.Schema({
  userIP: {
    type: String,
    unique: true,
    required: true,
  },
  chatHistory: [chatMessageSchema],
});

const ChatUser = mongoose.model("ChatUser", chatUserSchema);
const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

export { ChatMessage, ChatUser };
