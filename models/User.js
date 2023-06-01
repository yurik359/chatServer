const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema({
  nickname: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const userChatsSchema = new Schema(
  {
    _id: { type: String, required: true, unique: true },
    chats: [],
  },
  { timestamps: true, _id: false }
);

const chatsSchema = new Schema(
  {
    _id: { type: String, required: true, unique: true },
    messages: { type: Array },
  },
  { timestamps: true, _id: false }
);

const commonIsTyping = new Schema(
  {
    _id: { type: String, required: true, unique: true },
    isTyping: { type: Boolean },
    nickname: { type: String },
  },
  { _id: false }
);

module.exports = {
  userCreate: mongoose.model("users", userSchema),
  userChats: mongoose.model("userChats", userChatsSchema, "userChats"),
  chats: mongoose.model("chats", chatsSchema, "chats"),
  commonIsTyping: mongoose.model(
    "commonChatIsTyping",
    commonIsTyping,
    "commonChatIsTyping"
  ),
};
