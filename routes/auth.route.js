/** @format */

import express from "express";
import { login, register, logout } from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;
