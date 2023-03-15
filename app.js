require("dotenv").config()
const express = require("express")
const app = express()
const apiRouter = require('./api');

// Setup your Middleware and API Router here

const morgan = require('morgan')
const cors = require("cors");

app.use(morgan('dev'));

app.use(cors());

app.use(express.json());

app.use((req, res, next) =>
{
    console.log("<____Body Logger START____>");
  console.log(req.body);
  console.log("<_____Body Logger END_____>");

  next();
});

app.use('/api', apiRouter);

app.use("*", (req, res) => {
    res.status(404).send({
      error: "404 - not found",
      message: "no route found for the request url",
    });
});

app.use((error, req, res, next) => {
    res.status(500);
    console.log("An Error has occurred");
  
    res.send({
      message: error.message,
    });
});

const client = require("./db/client.js");
client.connect();

module.exports = app;
