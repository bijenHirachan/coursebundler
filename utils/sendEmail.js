import { createTransport } from "nodemailer";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";

export const sendEmail = catchAsyncErrors(async (to, subject, text) => {
  const transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    to,
    subject,
    text,
    from: "myid@gmail.com",
  });
});
