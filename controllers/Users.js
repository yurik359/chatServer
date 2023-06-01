const { userCreate, userChats } = require("../models/User");

class usersController {
  async registration(req, res) {
    const { nickname, password } = req.body;

    const userExists = await userCreate.findOne({ nickname });

    if (userExists) {
      res.status(409).send({ message: "User already exists" });
      return;
    }
    try {
      const user = await userCreate.create({ nickname, password });
      console.log(user);

      userChats.create({
        _id: user._id,
        chats: [
          {
            common: {
              lastMessage: {
                value: "",
              },
              userInfo: {
                nickname: "common chat",
                id: "common",
              },
            },
          },
        ],
      });
      res.status(201).send({ user });
    } catch (e) {
      console.error(e);
      res.status(400).json(e);
    }
  }

  async login(req, res) {
    const { nickname, password } = req.body;

    const user = await userCreate.findOne({ nickname });
    if (!user || user.password !== password) {
      res.status(401).send({ message: "Invalid credentials" });
      return;
    }

    res.status(200).send({ message: "Login successful", user });
  }
}

module.exports = usersController;
