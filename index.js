require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

const connectDB = require('./config/db');

app.get('/', (req, res) => {
  res.send('Hello World!');
});

connectDB();

app.listen(port, () => {
  console.log(`RentEasy app listening at http://localhost:${port}`);
});
