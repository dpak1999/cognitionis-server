/** @format */

import express from "express";
import {
  makeInstructor,
  getAccountStatus,
  currentInstructor,
  instructorCourse,
} from "../controllers/instructor.controller";
import { requireSignin } from "../middlewares";

const router = express.Router();

router.post("/make-instructor", requireSignin, makeInstructor);
router.post("/get-account-status", requireSignin, getAccountStatus);
router.get("/current-instructor", requireSignin, currentInstructor);
router.get("/instructor-courses", requireSignin, instructorCourse);

module.exports = router;
