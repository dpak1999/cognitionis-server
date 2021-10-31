/** @format */
import AWS from 'aws-sdk';
import { nanoid } from 'nanoid';
import slugify from 'slugify';
import { readFileSync } from 'fs';
import Course from '../models/Course';
import User from '../models/User';
import Completed from '../models/Completed';

const stripe = require('stripe')(process.env.STRIPE_SECRET);

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

const S3 = new AWS.S3(awsConfig);

export const uploadImage = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) return res.status(400).send('No image found');

    // remove noisy text
    const base64Data = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );

    const type = image.split(';')[0].split('/')[1];

    // image params
    const params = {
      Bucket: 'cognitionis-bucket',
      Key: `${nanoid()}.${type}`,
      Body: base64Data,
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: `image/${type}`,
    };

    // upload to AWS S3
    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }

      res.send(data);
    });
  } catch (error) {
    console.log(error);
  }
};

export const removeImage = async (req, res) => {
  try {
    const { image } = req.body;

    const params = {
      Bucket: image.Bucket,
      Key: image.Key,
    };

    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }
      res.send({ ok: true });
    });
  } catch (error) {
    console.log(error);
  }
};

export const create = async (req, res) => {
  try {
    const existingCourse = await Course.findOne({
      slug: slugify(req.body.name.toLowerCase()),
    });

    if (existingCourse)
      return res.status(400).send('There is already a course with this title');

    const course = await new Course({
      slug: slugify(req.body.name),
      instructor: req.user._id,
      ...req.body,
    }).save();

    res.json(course);
  } catch (error) {
    console.log(error);
    return res.status(400).send('Unable to create course. Please try again');
  }
};

export const getSingleCourse = async (req, res) => {
  try {
    const getSingleCourse = await Course.findOne({
      slug: req.params.slug,
    })
      .populate('instructor', '_id name')
      .exec();
    res.json(getSingleCourse);
  } catch (error) {
    console.log(error);
    return res.status(400).send('Unable to create course. Please try again');
  }
};

export const uploadVideo = async (req, res) => {
  try {
    if (req.user._id != req.params.instructorId) {
      return res.status(400).send('Unauthorized');
    }

    const { video } = req.files;

    if (!video) return res.status(400).send('No video found');

    // video params
    const params = {
      Bucket: 'cognitionis-bucket',
      Key: `${nanoid()}.${video.type.split('/')[1]}`,
      Body: readFileSync(video.path),
      ACL: 'public-read',
      ContentType: video.type,
    };

    // upload to s3
    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      }

      res.send(data);
    });
  } catch (error) {
    console.log(error);
  }
};

export const removeVideo = async (req, res) => {
  try {
    if (req.user._id != req.params.instructorId) {
      return res.status(400).send('Unauthorized');
    }

    const { Bucket, Key } = req.body;

    // video params
    const params = {
      Bucket,
      Key,
    };

    // upload to s3
    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      }

      res.send({ ok: true });
    });
  } catch (error) {
    console.log(error);
  }
};

export const addLesson = async (req, res) => {
  try {
    const { slug, instructorId } = req.params;
    const { title, content, video } = req.body;

    if (req.user._id != instructorId) {
      return res.status(400).send('Unauthorized');
    }

    const updated = await Course.findOneAndUpdate(
      { slug },
      {
        $push: { lessons: { title, slug: slugify(title), content, video } },
      },
      { new: true }
    )
      .populate('instructor', '_id name')
      .exec();

    res.json(updated);
  } catch (error) {
    console.log(error);
    return res.status(400).send('Unable to create lesson. Please try again');
  }
};

export const update = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ slug }).exec();

    if (req.user._id != course.instructor) {
      return res.status(400).send('Unauthorized');
    }

    const updated = await Course.findOneAndUpdate({ slug }, req.body, {
      new: true,
    }).exec();

    res.json();
  } catch (error) {
    console.log(error);
    return res.status(400).send('Unable to upodate course. Please try again');
  }
};

export const removeLesson = async (req, res) => {
  try {
    const { slug, lessonId } = req.params;
    const course = await Course.findOne({ slug }).exec();

    if (req.user._id != course.instructor) {
      return res.status(400).send('Unauthorized');
    }

    await Course.findByIdAndUpdate(course._id, {
      $pull: {
        lessons: { _id: lessonId },
      },
    }).exec();

    res.json({ ok: true });
  } catch (error) {
    console.log(error);
    return res.status(400).send('Unable to upodate course. Please try again');
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { slug } = req.params;
    const { _id, title, content, video, free_preview } = req.body;
    const course = await Course.findOne({ slug }).select('instructor').exec();

    if (req.user._id != course.instructor._id) {
      return res.status(400).send('Unauthorized');
    }

    const updated = await Course.updateOne(
      { 'lessons._id': _id },
      {
        $set: {
          'lessons.$.title': title,
          'lessons.$.content': content,
          'lessons.$.video': video,
          'lessons.$.free_preview': free_preview,
        },
      },
      { new: true }
    ).exec();

    res.json({ ok: true });
  } catch (error) {
    console.log(error);
    return res.status(400).send('Unable to update lesson. Please try again');
  }
};

export const publishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).select('instructor').exec();

    if (req.user._id != course.instructor._id) {
      return res.status(400).send('Unauthorized');
    }

    const updated = await Course.findByIdAndUpdate(
      courseId,
      {
        published: true,
      },
      { new: true }
    ).exec();

    res.json(updated);
  } catch (error) {
    console.log(error);
    return res.status(400).send('Unable to publish course. Please try again');
  }
};

export const unpublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).select('instructor').exec();

    if (req.user._id != course.instructor._id) {
      return res.status(400).send('Unauthorized');
    }

    const updated = await Course.findByIdAndUpdate(
      courseId,
      {
        published: false,
      },
      { new: true }
    ).exec();
    res.json(updated);
  } catch (error) {
    console.log(error);
    return res.status(400).send('Unable to unpublish course. Please try again');
  }
};

export const allCourses = async (req, res) => {
  try {
    const allCourses = await Course.find({ published: true })
      .populate('instructor', '_id name')
      .exec();

    res.json(allCourses);
  } catch (error) {
    console.log(error);
    return res.status(400).send('Unable to unpublish course. Please try again');
  }
};

export const checkEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;

    const user = await User.findById(req.user._id).exec();

    let ids = [];
    let length = user.courses && user.courses.length;
    for (let i = 0; i < length; i++) {
      ids.push(user.courses[i].toString());
    }

    res.json({
      status: ids.includes(courseId),
      course: await Course.findById(courseId).exec(),
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send('Unable to check enrollment. Please try again');
  }
};

export const freeEnrollment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).exec();
    if (course.paid) return;

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { courses: course._id },
      },
      { new: true }
    ).exec();

    res.json({
      course,
      message:
        'Congratulations !! You have successfully enrolled for this course',
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send('Unable to enroll. Please try again');
  }
};

export const paidEnrollment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate('instructor')
      .exec();
    if (!course.paid) return;

    const fee = (course.price * 25) / 100;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          name: course.name,
          amount: Math.round(course.price.toFixed(2) * 100),
          currency: 'inr',
          quantity: 1,
        },
      ],
      payment_intent_data: {
        // application_fee_amount: Math.round(fee.toFixed(2) * 100),
        transfer_data: {
          destination: course.instructor.stripe_account_id,
        },
      },
      success_url: `${process.env.STRIPE_SUCCESS_URL}/${course._id}`,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    await User.findByIdAndUpdate(req.user._id, {
      stripeSession: session,
    }).exec();

    res.send(session.id);
  } catch (error) {
    console.log(error);
    return res.status(400).send('Unable to enroll. Please try again');
  }
};

export const stripeSuccess = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).exec();
    const user = await User.findById(req.user._id).exec();

    if (!user.stripeSession.id) return res.sendStatus(400);

    const session = await stripe.checkout.sessions.retrieve(
      user.stripeSession.id
    );

    if (session.payment_status === 'paid') {
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { courses: course._id },
        $set: { stripeSession: {} },
      }).exec();
    }

    res.json({ success: true, course });
  } catch (error) {
    console.log(error);
    return res.json({ success: false });
  }
};

export const userCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).exec();
    const courses = await Course.find({ _id: { $in: user.courses } })
      .populate('instructor', '_id name')
      .exec();

    res.json(courses);
  } catch (error) {
    console.log(error);
    return res.status(400).send('Unable to fetch courses. Please try again');
  }
};

export const markCompleted = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;

    const existing = await Completed.findOne({
      user: req.user._id,
      course: courseId,
    }).exec();

    if (existing) {
      const updated = await Completed.findOneAndUpdate(
        {
          user: req.user._id,
          course: courseId,
        },
        {
          $addToSet: {
            lessons: lessonId,
          },
        }
      ).exec();
      res.json({ ok: true });
    } else {
      const created = await new Completed({
        user: req.user._id,
        course: courseId,
        lessons: lessonId,
      }).save();
      return res.json({ ok: true });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send('Unable to fetch courses. Please try again');
  }
};
