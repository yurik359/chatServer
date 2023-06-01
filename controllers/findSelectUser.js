const { userCreate, chats, userChats } = require("../models/User");
class findSelectUser {
  findUser = async (req, res) => {
    const { nickName } = req.body;

    try {
      const result = await userCreate.findOne({ nickname: nickName }).exec();
      const { _id, nickname } = result;
      if (result) {
        res.status(200).send({ _id, nickname });
      } else {
        res.status(404).send(null);
      }
    } catch (error) {
      res.send({ error });
    }
  };

  selecUser = async (req, res) => {
    const { combinedId, finedUserInfo, currentUserInfo } = req.body;

    const result = await chats.findOne({ _id: combinedId }).exec();
    if (!result) {
      try {
        await chats.create({
          _id: combinedId,
          messages: [],
        });
        await userChats.updateOne(
          { _id: currentUserInfo._id },
          {
            $push: {
              chats: {
                [combinedId]: {
                  userInfo: {
                    uid: finedUserInfo._id,
                    nickname: finedUserInfo.nickname,
                  },
                  date: Date.now(),
                },
              },
            },
          }
        );

        await userChats.updateOne(
          { _id: finedUserInfo._id },
          {
            $push: {
              chats: {
                [combinedId]: {
                  userInfo: {
                    uid: currentUserInfo._id,
                    nickname: currentUserInfo.nickname,
                  },
                  date: Date.now(),
                },
              },
            },
          }
        );
        res.status(200);
      } catch (error) {
        res.send(error);
      }
    }
  };

  async getCommonMembers(req, res) {
    try {
      // console.log('china')
      const documents = await userCreate.find({}, "nickname _id");

      res.send({ documents });
    } catch (err) {
      console.log(err);
      res.send({ err });
    }
  }
}

const findSlectObj = findSelectUser;
const findSelect = new findSlectObj();
module.exports = findSelect;
