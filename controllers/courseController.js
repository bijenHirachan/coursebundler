import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import getDataUri from "../utils/dataUri.js";
import { Course } from "../models/Course.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import cloudinary from "cloudinary";
import { Stats } from "../models/Stats.js";

export const getAllCourses = catchAsyncErrors(async (req, res, next) => {
  const keyword = req.query.keyword || "";
  const category = req.query.category || "";

  const courses = await Course.find({
    title: {
      $regex: keyword,
      $options: "i",
    },
    category: {
      $regex: category,
      $options: "i",
    },
  }).select("-lectures");

  res.header("Access-Control-Allow-Origin", "*").status(200).json({
    success: true,
    courses,
  });
});

export const createCourse = catchAsyncErrors(async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;
  if (!title || !description || !category || !createdBy)
    return next(new ErrorHandler("Please enter all fields.", 400));

  const file = req.file;

  const fileUri = getDataUri(file);

  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

  await Course.create({
    title,
    description,
    category,
    createdBy,
    poster: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });

  res.header("Access-Control-Allow-Origin", "*").status(201).json({
    success: true,
    message: "Course created successfully.",
  });
});

export const deleteCourse = catchAsyncErrors(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) return next(new ErrorHandler("Course Not Found", 404));

  await cloudinary.v2.uploader.destroy(course.poster.public_id);

  for (let i = 0; i < course.lectures.length; i++) {
    const lecture = course.lectures[i];

    await cloudinary.v2.uploader.destroy(lecture.video.public_id, {
      resource_type: "video",
    });
  }

  await course.remove();

  res.header("Access-Control-Allow-Origin", "*").status(200).json({
    success: true,
    message: "Course deleted successfully.",
  });
});

export const getCourseLectures = catchAsyncErrors(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) return next(new ErrorHandler("Course not found", 404));

  course.views += 1;

  await course.save();

  res.header("Access-Control-Allow-Origin", "*").status(200).json({
    success: true,
    lectures: course.lectures,
  });
});

//max video size : 100mb(free)
export const addCourseLecture = catchAsyncErrors(async (req, res, next) => {
  const { title, description } = req.body;

  if (!title || !description)
    return next(new ErrorHandler("All fields are required", 400));
  const course = await Course.findById(req.params.id);

  if (!course) return next(new ErrorHandler("Course not found", 404));

  const file = req.file;

  const fileUri = getDataUri(file);

  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content, {
    resource_type: "video",
  });

  course.lectures.push({
    title,
    description,
    video: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });

  course.noOfVideos = course.lectures.length;

  await course.save();

  res.header("Access-Control-Allow-Origin", "*").status(200).json({
    success: true,
    message: "Lecture added",
  });
});

export const deleteLecture = catchAsyncErrors(async (req, res, next) => {
  const { courseId, lectureId } = req.query;

  if (!courseId || !lectureId)
    return next(new ErrorHandler("All fields are required", 400));

  const course = await Course.findById(courseId);

  if (!course) return next(new ErrorHandler("Course not found", 404));

  const lecture = course.lectures.find(
    (item) => item._id.toString() === lectureId.toString()
  );

  await cloudinary.v2.uploader.destroy(lecture.video.public_id, {
    resource_type: "video",
  });

  course.lectures = course.lectures.filter(
    (item) => item._id.toString() !== lectureId.toString()
  );

  course.noOfVideos = course.lectures.length;

  await course.save();

  res.header("Access-Control-Allow-Origin", "*").status(200).json({
    success: true,
    message: "Lecture deleted successfully",
  });
});

Course.watch().on("change", async () => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);
  const courses = await Course.find();

  let totalViews = 0;

  for (let i = 0; i < courses.length; i++) {
    totalViews += courses[i].views;
  }

  stats[0].views = totalViews;
  stats[0].createdAt = new Date(Date.now());

  await stats[0].save();
});
