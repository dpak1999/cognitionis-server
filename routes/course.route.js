/** @format */

import express from "express";
import {
  uploadImage,
  removeImage,
  create,
  getSingleCourse,
} from "../controllers/course.controller";
import { isInstructor, requireSignin } from "../middlewares";

const router = express.Router();

// image
router.post("/course/upload-image", uploadImage);
router.post("/course/remove-image", removeImage);

// course
router.post("/course", requireSignin, isInstructor, create);
router.get("/course/:slug", requireSignin, isInstructor, getSingleCourse);

module.exports = router;
