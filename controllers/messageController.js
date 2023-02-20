const catchAsync = require("../middlewares/catchAsync");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const cloudinary = require("cloudinary");

// Send New Message
exports.newMessage = catchAsync(async (req, res, next) => {
  let defaultType = "text";
  let { chatId, content, type } = req.body;
  var urlImagesMessages = [];

  if (type === "image") {
    const contents = req.body.content;
    for (var i = 0; i < contents.length; i++) {
      let myCloud = await cloudinary.v2.uploader.upload(content[i], {
        folder: "messages",
        width: 150,
        crop: "scale",
        quality: 100,
      });

      urlImagesMessages.push(myCloud.secure_url);
    }
  }

  const msgData = {
    sender: req.user._id,
    chatId,
    content:
      type === "text"
        ? content
        : urlImagesMessages.length === 1
        ? urlImagesMessages[0]
        : urlImagesMessages.join(" * "),
    type: type ? type : defaultType,
    emoji: []
  };

  const newMessage = await Message.create(msgData);

  await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage });

  res.status(200).json({
    success: true,
    newMessage,
  });
});

exports.updateEmoji = catchAsync(async (req, res, next) => {
  const messages = await Message.findById(req.body.id)
  if(req.body.type) {
    const index = messages.emoji.findIndex((item, i) => {
      return item.sender.toString() === req.body.sender
    })
    if(index !== -1) {
      messages.emoji.splice(index, 1)
    }
  } else {
    const isOldEmoji = messages.emoji.some((item, i) => {
      return item.sender.toString() === req.body.sender
    })
  
    if(!isOldEmoji) {
      messages.emoji.push({sender: req.body.sender, emojiImage: req.body.emoji})
    } else {
      messages.emoji.map((item, i) => {
        if(item.sender.toString() === req.body.sender) {
          item.emojiImage = req.body.emoji
        }
      })
    }
    
  }
  await messages.save({new: true})
  res.status(200).json({
    success: true,
    messages,
  });

})


// Get All Messages
exports.getEmojiSingleMessage = catchAsync(async (req, res, next) => {

  const messages = await Message.findOne({_id: req.body.id}).populate({
    path: "emoji",
    populate: {
      path: "sender",
    },
  });


  res.status(200).json({
    success: true,
    messages,
  });
});

exports.getMessages = catchAsync(async (req, res, next) => {
  const messages = await Message.find({
    chatId: req.params.chatId,
  });

  res.status(200).json({
    success: true,
    messages,
  });
});
