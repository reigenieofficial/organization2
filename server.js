

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const connectDb = require('./config/database');
const realtorRoute = require("./routes/findRealtors")
const messageRoutes = require("./routes/handleMessage");
const app = express();
const port = 3000;
const cors = require('cors');
connectDb();
app.use(cors());
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/realtor", realtorRoute);
app.use("/message", messageRoutes);
app.get('*', async (request, response) => {
  response.render('index');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});