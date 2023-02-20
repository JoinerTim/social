const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat"
        },
        content: {
            type: String,
            trim: true,
            required: true,
        },
        type: {
            type: String
        },
        emoji: [
            {
                sender: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                emojiImage: {
                    type: String,
                    default: ""
                }
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);