const mongoose = require("mongoose");
const dotenv = require("dotenv");  //require dotenv package
dotenv.config({ path: "./.env" }); //import config.env file

const DBURI = process.env.MURI;  

mongoose.set('strictQuery', false);
const connectDb = () => {
  mongoose
    .connect(DBURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((conn) => {
      console.log(`Successfully Connected DB to HOST : ${conn.connection.host}`);
    });
};

module.exports = connectDb;