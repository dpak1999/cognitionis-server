/** @format */

import express from "express";
import { register } from "../controllers/auth.controller";

const router = express.Router();

router.get("/register", register);

module.exports = router;
