/** @format */

import express from 'express';
import formidable from 'express-formidable';
import {
  uploadImage,
  removeImage,
  create,
  getSingleCourse,
  uploadVideo,
  removeVideo,
} from '../controllers/course.controller';
import { isInstructor, requireSignin } from '../middlewares';

const router = express.Router();

// image
router.post('/course/upload-image', uploadImage);
router.post('/course/remove-image', removeImage);

// course
router.post('/course', requireSignin, isInstructor, create);
router.get('/course/:slug', requireSignin, isInstructor, getSingleCourse);
router.post('/course/video-upload', requireSignin, formidable(), uploadVideo);
router.post('/course/remove-video', requireSignin, removeVideo);

module.exports = router;
