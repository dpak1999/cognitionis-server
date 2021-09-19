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
  addLesson,
} from '../controllers/course.controller';
import { isInstructor, requireSignin } from '../middlewares';

const router = express.Router();

// image
router.post('/course/upload-image', uploadImage);
router.post('/course/remove-image', removeImage);

// course
router.post('/course', requireSignin, isInstructor, create);
router.get('/course/:slug', requireSignin, isInstructor, getSingleCourse);
router.post(
  '/course/video-upload/:instructorId',
  requireSignin,
  formidable(),
  uploadVideo
);
router.post('/course/remove-video/:instructorId', requireSignin, removeVideo);
router.post('/course/lesson/:slug/:instructorId', requireSignin, addLesson);

module.exports = router;
