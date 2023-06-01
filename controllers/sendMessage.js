const { chats, userChats, commonIsTyping } = require("../models/User");

const sendMessage = async (req, res) => {
  const {
    chatId,
    message: { id, value, senderId, date, nickname },
    usersInfo: {
      currentUserUid,
      user: { userUid, userNickname },
    },
  } = req.body;

  try {
    if (chatId == null) return;
    await chats.updateOne(
      { _id: chatId },
      {
        $push: {
          messages: {
            id,
            value,
            senderId,
            nickname,
            date,
          },
        },
      }
    );

    const options = {
      arrayFilters: [{ [`chat.${chatId}`]: { $exists: true } }],
    };
    const update = {
      $set: {
        [`chats.$[chat].${chatId}.lastMessage.value`]: value,
        [`chats.$[chat].${chatId}.date`]: date,
        [`chats.$[chat].${chatId}.isTyping`]: false,
      },
    };
    await userChats.updateOne({ _id: currentUserUid }, update, options);

    await userChats.updateOne({ _id: userUid }, update, options);

    if (userNickname == "common chat") {
      await userChats.updateOne(
        { _id: "common" },
        { $set: { [`chats.0.lastMessage.value`]: value } }
      );
      const comChat = await userChats.findById("common");

      res.send({ lastComMess: comChat.chats[0].lastMessage.value });
      await commonIsTyping.updateOne(
        { _id: "common" },
        {
          $set: { isTyping: false, nickname: "" },
        }
      );
    }
  } catch (err) {
    console.log("error ", err);
  }
};

module.exports = sendMessage;
