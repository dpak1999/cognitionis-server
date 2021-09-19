/** @format */

import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema;

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      minLength: 3,
      maxLength: 300,
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    content: {
      type: {},
      minLength: 200,
    },
    video: {},
    free_preview: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const courseScehma = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      minLength: 3,
      maxLength: 300,
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    description: {
      type: {},
      minLength: 200,
      required: true,
    },
    price: {
      type: Number,
      default: 9.99,
    },
    image: {},
    category: String,
    published: {
      type: Boolean,
      default: false,
    },
    paid: {
      type: Boolean,
      default: true,
    },
    instructor: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    lessons: [lessonSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseScehma);
