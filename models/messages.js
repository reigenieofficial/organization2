const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    phoneNumber: String,
    messages: [
      {
        _id: false,
        body: String,
        dateTime: { type: Date, default: Date.now },
        status: String,
      }
    ]
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    collection: "messages",
  }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
