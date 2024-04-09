const express = require("express");
const Message = require("../models/messages");
const Realtor = require("../models/realtor");
const router = express.Router();
function formatPhoneNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/\D/g, "");
  const areaCode = cleaned.slice(1, 4);
  const firstPart = cleaned.slice(4, 7);
  const secondPart = cleaned.slice(7);
  const formatted = `(${areaCode}) ${firstPart}-${secondPart}`;
  return formatted;
}
function formatPhoneNumber1(phoneNumber) {
    const match = phoneNumber.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    } else {
        return phoneNumber;
    }
}
router.post("/save", async (req, res) => {
  try {
    const { From, To, Body } = req.body;
    const formattedPhone = From;
    const existingMessage = await Realtor.findOneAndUpdate(
        { phoneNumber: formattedPhone },
        {
          $push: {
            messages: {
              body: Body,
              dateTime: new Date(),
              status: "recieved"
            }
          },
          $set: { messageSeen: false }
        },
        { upsert: true, new: true }
      );
    await existingMessage.save();

    res.status(200).json({ message: "Message saved successfully", data: existingMessage });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/get", async (req, res) => {
  let { phoneNumber } = req.query;
  try {
    phoneNumber = formatPhoneNumber1(phoneNumber);
    var fields = "messages"
    const message = await Realtor.findOneAndUpdate(
        { phoneNumber: `${phoneNumber}` },
        { $set: { messageSeen: true } },
        { new: true, fields: fields }
    );
    if (message) {
      res.status(200).json({ data: message.messages });
    } else {
      res.status(200).json({ data: [] });
    }
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
