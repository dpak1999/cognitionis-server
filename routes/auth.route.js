/** @format */

import express from "express";
import {
  login,
  register,
  logout,
  currentUser,
  sendTestEmail,
} from "../controllers/auth.controller";
import { requireSignin } from "../middlewares";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/current-user", requireSignin, currentUser);
router.get("/send-email", sendTestEmail);

module.exports = router;
