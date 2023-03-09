export const sendToken = (res, user, message, statusCode = 200) => {
  const token = user.getJWTToken();

  const options = {
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  res
    .header("Access-Control-Allow-Origin", process.env.FRONTEND_URL)
    .status(201)
    .cookie("token", token, options)
    .json({
      success: true,
      message,
      user,
    });
};
