const express = require('express');
const { newMessage, getMessages, updateEmoji, getEmojiSingleMessage } = require('../controllers/messageController');
const { isAuthenticated } = require('../middlewares/auth');

const router = express();

router.route("/newMessage").post(isAuthenticated, newMessage);
router.route("/update/emoji").post(isAuthenticated, updateEmoji);
router.route("/messages/:chatId").get(isAuthenticated, getMessages);
router.route("/messages/single").post(isAuthenticated, getEmojiSingleMessage);


module.exports = router;