const express = require("express");
const Realtor = require("../models/realtor");
const multer = require('multer');
const xlsx = require('xlsx');
const router = express.Router();
const upload = multer();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilio_client = require('twilio')(accountSid, authToken);
const senderNumber = process.env.SENDERMOBILENUMBER;
const Message = require("../models/messages");
function formatPhoneNumber(phoneNumber) {
    const digits = phoneNumber.replace(/\D/g, '');
    const countryCode = digits.startsWith('+') ? '' : '+1';
    const formattedNumber = `${countryCode}${digits}`;

    return formattedNumber;
}
twilio_client.api.accounts(accountSid)
  .fetch()
  .then(account => {
    console.log('Twilio authentication successful. Account SID:', account.sid);
  })
  .catch(error => {
    console.error('Twilio authentication failed:', error);
  });
router.get("/find", async (req, res) => {
    try {
        const { by, keyword } = req.query;

        if (!by || !keyword) {
            return res.status(400).json({ error: 'Missing query parameters' });
        }

        let condition = {};
        var fields = "_id phoneNumber profileLink zipCode messageSeen";
        if(by === "phoneNumber"){
            const regexPattern = `\\+${keyword}`;
            condition[by] = { $regex: regexPattern, $options: 'i' };
        }else{
        condition[by] = { $regex: keyword, $options: 'i' };
        }
        const result = await Realtor.find(condition, fields);
        res.json(result);
    } catch (error) {
        console.error('Error finding realtors:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/upload', upload.single('excelFile'), async(req, res) => {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const filename = req.file.originalname;
    const zipCode = filename.substring(0, filename.lastIndexOf('.'));
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    let dataToUpload = [];
    data.forEach((item) => {
        if ( !item["Mobile Number"] || item["Mobile Number"] === undefined){
            
        }else{
        const formatPhoneNumbe = formatPhoneNumber(item["Mobile Number"])
        let oneRealtorData = {
            "name": item.Name,
            "phoneNumber": formatPhoneNumbe,
            "profileLink": item['Profile Link'],
            "zipCode": zipCode,
            "messages": [],
            "messageSeen": true,
        };
        dataToUpload.push(oneRealtorData); }
    });
    try {
        const savedRealtors = await Realtor.insertMany(dataToUpload);
        res.status(200).send('File uploaded and processed.');
    } catch (error) {
        if (error.name === 'ValidationError') {
            // Handle validation errors
            console.error('Validation Error:', error.message);
            res.status(400).send('Validation Error: ' + error.message);
        } else if (error.name === 'MongoError' && error.code === 11000) {
            // Handle duplicate key error (unique constraint violation)
            console.error('Duplicate Key Error:', error.message);
            res.status(409).send('Duplicate Key Error: ' + error.message);
        } else {
            // Handle other errors
            console.error('Error saving data:', error);
            res.status(500).send('Internal server error.');
        }
    }
});
router.post("/sendMessage", async (req, res) => {
    const { message, numbers } = req.body;
    try {
        const promises = numbers.map(async (number) => {
            try {
                const sentMessage = await twilio_client.messages.create({
                    from: senderNumber,
                    body: message,
                    to: number
                });
                let formattedPhone = sentMessage.to
                const existingMessage = await Realtor.findOneAndUpdate(
                    { phoneNumber: formattedPhone },
                    {
                      $push: {
                        messages: {
                          body: message,
                          dateTime: new Date(),
                          status: "sent"
                        }
                      },
                      $set: { messageSeen: true }
                    },
                    { upsert: true, new: true }
                  );
                await existingMessage.save();
                return sentMessage;
            } catch (error) {
                console.error(`Error sending message to ${number}:`, error);
                throw error;
            }
        });

        const sentMessages = await Promise.all(promises);
        res.status(200).json({ message: 'Messages sent successfully', sentMessages });
    } catch (error) {
        console.error('Error sending messages:', error);
        res.status(500).json({ error: 'Error sending messages.' });
    }
});


module.exports = router;