const mongoose = require("mongoose");
const { Schema } = mongoose;

const realtor = new Schema(
  {
    name: String,
    phoneNumber: String,
    profileLink: String,
    zipCode: String,
    messages: [
      {
        _id: false,
        body: String,
        dateTime: { type: Date, default: Date.now },
        status: String,
      }
    ],
    messageSeen: { type: Boolean, default: true }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    collection: "collection1",
  }
);

const Realtor = mongoose.model("collection1", realtor);

module.exports = Realtor;
