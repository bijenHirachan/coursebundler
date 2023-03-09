import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { Stats } from "../models/Stats.js";

export const contact = catchAsyncErrors(async (req, res, next) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message)
    return next(new ErrorHandler("All fields are required", 400));

  const to = process.env.MY_MAIL;
  const subject = "Contact from CourseBundler";

  const text = `I'm ${name} and my email is ${email}. \n ${message}`;

  await sendEmail(to, subject, text);

  res
    .header("Access-Control-Allow-Origin", process.env.FRONTEND_URL)
    .status(200)
    .json({
      success: true,
      message: "Your message has been sent.",
    });
});

export const requestCourse = catchAsyncErrors(async (req, res, next) => {
  const { name, email, course } = req.body;

  if (!name || !email || !course)
    return next(new ErrorHandler("All fields are required", 400));

  const to = process.env.MY_MAIL;
  const subject = "Request for a course on CourseBundler";

  const text = `I'm ${name} and my email is ${email}. \n ${course}`;

  await sendEmail(to, subject, text);

  res
    .header("Access-Control-Allow-Origin", process.env.FRONTEND_URL)
    .status(200)
    .json({
      success: true,
      message: "Your request has been sent.",
    });
});

export const getDashboardStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await Stats.find().sort({ createdAt: "desc" }).limit(12);

  const statsData = [];

  for (let i = 0; i < stats.length; i++) {
    statsData.unshift(stats[i]);
  }

  const requiredSize = 12 - stats.length;

  for (let i = 0; i < requiredSize; i++) {
    statsData.unshift({
      users: 0,
      subscriptions: 0,
      views: 0,
    });
  }

  const usersCount = statsData[11].users;
  const subscriptionsCount = statsData[11].subscriptions;
  const viewsCount = statsData[11].views;

  let usersProfit = true,
    viewsProfit = true,
    subscriptionsProfit = true;
  let usersPercentage = 0,
    viewsPercentage = 0,
    subscriptionsPercentage = 0;

  if (statsData[10].users === 0) usersPercentage = usersCount * 100;
  if (statsData[10].subscriptions === 0)
    subscriptionsPercentage = subscriptionsCount * 100;
  if (statsData[10].views === 0) viewsPercentage = viewsCount * 100;
  else {
    const difference = {
      users: statsData[11].users - statsData[10].users,
      subscriptions: statsData[11].subscriptions - statsData[10].subscriptions,
      views: statsData[11].views - statsData[10].views,
    };

    usersPercentage = (difference.users / statsData[10].users) * 100;
    subscriptionsPercentage =
      (difference.subscriptions / statsData[10].subscriptions) * 100;
    viewsPercentage = (difference.views / statsData[10].views) * 100;

    if (usersPercentage < 0) usersProfit = false;
    if (viewsPercentage < 0) viewsProfit = false;
    if (subscriptionsPercentage < 0) subscriptionsProfit = false;
  }

  res
    .header("Access-Control-Allow-Origin", process.env.FRONTEND_URL)
    .status(200)
    .json({
      success: true,
      statsData,
      usersCount,
      subscriptionsCount,
      viewsCount,
      subscriptionsPercentage,
      viewsPercentage,
      usersPercentage,
      subscriptionsProfit,
      viewsProfit,
      usersProfit,
    });
});
