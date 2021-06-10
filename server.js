/** @format */

import express from "express";
import cors from "cors";
const colors = require("colors");
const morgan = require("morgan");
require("dotenv").config();

// initialize express app
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// routes
app.get("/", (req, res) => {
  res.send("home endpoint");
});

// server setup
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App listening on PORT ${port}`.underline.cyan.bold);
});
