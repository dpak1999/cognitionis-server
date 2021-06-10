/** @format */

import express from "express";
import cors from "cors";
import { readdirSync } from "fs";
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
readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

// server setup
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App listening on PORT ${port}`.underline.cyan.bold);
});
