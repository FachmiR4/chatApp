const express = require('express');
const router = express.Router();

const { catchErrors } = require('../handlers/errorHandlers');
const chatroomController = require("../controllers/chatroomController");
const messageController = require("../controllers/messageController")

const auth = require('../middlewares/auth');

router.get("/viewChatrooms", auth, catchErrors(chatroomController.getAllChatrooms));
router.post("/createChatroom", auth, catchErrors(chatroomController.createChatroom));
router.post("/sendMessage", auth, catchErrors(messageController.sendMessage));

module.exports = router;