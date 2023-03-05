import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { stripe } from "../server.js";

export const buySubscription = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.role === "admin")
    return next(new ErrorHandler("Admin can't subscribe", 400));

  const price_id =
    process.env.SUBSCRIPTION_PRICE_API_ID || "price_1MiGEQJIA08ekFVaazfxnws9";

  const customer = await stripe.customers.create({
    name: user.name,
  });
  // const subscription = await stripe.subscriptions.create({
  //   customer: "cus_NScV38unyBQU35",
  //   items: [{ price: price_id }],

  // });

  // console.log(subscription);
  // return res.json(subscription);
});
