/** @format */

import express from "express";
import { makeInstructor } from "../controllers/instructor.controller";
import { requireSignin } from "../middlewares";

const router = express.Router();

router.post("/make-instructor", requireSignin, makeInstructor);

module.exports = router;
