const WebSocket = require("ws");
const { userChats, chats, commonIsTyping } = require("../models/User.js");

function sendMessageToWebSocket(message, wss) {
  wss?.clients?.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

async function setupWebSocket(server) {
  const wss = new WebSocket.Server({
    server,
    clientTracking: true,
    keepAlive: true,
  });

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");

    ws.on("message", async (message) => {
      const { type, payload } = JSON.parse(message);

      const watch = userChats.watch();
      watch.on("change", async (change) => {
        if (change.documentKey._id.toString() === "common") {
          const updatedDocument = await userChats.findById("common");
          const lastMess = updatedDocument.chats[0];
          sendMessageToWebSocket(lastMess, wss);
        }
        if (
          type == "getChats" &&
          change.documentKey._id.toString() === payload.toString()
        ) {
          const updatedDocument = await userChats.findById(
            change.documentKey._id
          );
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(updatedDocument));
          }
        }
      });
      switch (type) {
        case "getChats":
          try {
            const commonChat = await userChats.findById("common");
            const commonLastMess = commonChat.chats[0];
            sendMessageToWebSocket(commonLastMess, wss);

            const chatList = await userChats.findById(payload);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify(chatList));
            }
          } catch (err) {
            sendMessageToWebSocket(err);
            console.log(err);
          }

          break;
        case "getMessages":
          const messageList = await chats.findById(payload);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(messageList));
          }

          const watch = chats.watch();
          watch.on("change", async (change) => {
            if (change.documentKey._id.toString() === payload.toString()) {
              const updatedDocument = await chats.findById(
                change.documentKey._id
              );

              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(updatedDocument));
              }
            } else if (change.documentKey._id.toString() === "common") {
              const commonChat = await chats.findById("common");
              sendMessageToWebSocket(commonChat, wss);
            }
          });

          break;
        case "changeCommonIsTyping":
          try {
            sendMessageToWebSocket(
              {
                commIsTyping: payload.isTyping,
                commTypeNickname: payload.nickname,
              },
              wss
            );
          } catch (er) {
            console.log(er);
          }

          break;
        case "privateIsTyping":
          try {
            await userChats.updateOne(
              { _id: payload.uid },
              {
                $set: {
                  [`chats.$[chat].${payload.chatId}.isTyping`]:
                    payload.isTyping,
                },
              },
              {
                arrayFilters: [
                  { [`chat.${payload.chatId}`]: { $exists: true } },
                ],
              }
            );
          } catch (err) {
            console.log(err);
          }
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
      chats.watch().close();
      userChats.watch().close();
    });
  });
}

module.exports = setupWebSocket;
