const express = require("express");
const usersController = require("../controllers/Users.js");
const userController = new usersController();
const findSelect = require("../controllers/findSelectUser.js");
const sendMessage = require("../controllers/sendMessage.js");
const path = require("path");

const router = express.Router();

router.post("/register", userController.registration);
router.post("/login", userController.login);
router.post("/findUser", findSelect.findUser);
router.post("/selectUser", findSelect.selecUser);
router.post("/sendMessage", sendMessage);
router.get("/getMemberList", findSelect.getCommonMembers);

router.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/build/index.html"));
});

module.exports = router;
