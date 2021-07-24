/** @format */

import express from "express";
import cors from "cors";
import { readdirSync } from "fs";
import mongoose from "mongoose";
import csrf from "csurf";
import cookieParser from "cookie-parser";
const colors = require("colors");
const morgan = require("morgan");
require("dotenv").config();

// initialize express app
const csrfProtection = csrf({ cookie: true });
const app = express();

// DB conn
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log("DB CONNECTED".magenta.bold))
  .catch((err) => console.log(`${err.message}`.red.bold));

// middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// routes
readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

// csrf
app.use(csrfProtection);
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// server setup
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App listening on PORT ${port}`.underline.cyan.bold);
});
