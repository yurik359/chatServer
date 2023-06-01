const express = require("express");
const app = express();
const routes = require("./routes/routes");
const path = require("path");
const mongoose = require("mongoose");
const url =
  "mongodb+srv://yurik52222:04291999@cluster0.hge96yf.mongodb.net/chatik?retryWrites=true&w=majority";
const cors = require("cors");
const setupWebSocket = require("./websocket/websocket.js");

app.use(cors());
app.use(express.static(path.join(__dirname, "../client/build")));
app.use(express.json());
app.use("/", routes);

const start = async () => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const server = app.listen(4000, () => {
      console.log("Server started on port 4000");
    });
    setupWebSocket(server);
  } catch (error) {
    console.log(error);
  }
};

start();
