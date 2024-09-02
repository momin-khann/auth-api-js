import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { sendVerificationEmail, sendWelcomeEmail } from "../email/emails.js";

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const otp = Math.floor(100_000 + Math.random() * 900_000).toString();

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    verificationToken: otp,
    verificationTokenExpiresAt: Date.now() + 10 * 60 * 60 * 1000, // 10 minutes expiry
  });

  if (!newUser)
    throw new ApiError(400, "Something went wrong While registering User.");

  await sendVerificationEmail(email, otp);

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        "User created successfully.",
        "User Registered Successfully",
      ),
    );
});

export const signin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const validUser = await User.findOne({ email });
  if (!validUser) throw new ApiError(404, "User not Found.");

  const validPassword = bcryptjs.compareSync(password, validUser.password);
  if (!validPassword) throw new ApiError(401, "Wrong Credentials");

  const token = jwt.sign(
    {
      _id: validUser._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_SECRET_EXPIRY },
  );

  const { password: hashedPassword, ...rest } = validUser._doc;

  const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

  res
    .cookie("access_token", token, {
      httpOnly: true,
      secure: true,
      expires: expiryDate,
    })
    .status(200)
    .json(new ApiResponse(200, rest, "Successful Login"));
});

export const google = asyncHandler(async (req, res) => {
  const { name, email, photo } = req.body;

  const validUser = await User.findOne({ email });
  if (validUser) {
    const token = jwt.sign(
      {
        id: validUser._id,
        email: validUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_SECRET_EXPIRY },
    );

    const { password, ...rest } = validUser._doc;

    const expiryDate = new Date(Date.now() + 3600000); // 1 hour
    res
      .cookie("access_token", token, {
        httpOnly: true,
        expiresIn: process.env.JWT_SECRET_EXPIRY,
      })
      .status(200)
      .json(new ApiResponse(200, rest, "Successful Login"));
  } else {
    const generatedPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
    const newUser = new User({
      username: name.split(" ").join("-").toLowerCase(),
      email,
      password: hashedPassword,
      profilePicture: photo,
    });

    if (!newUser)
      throw new ApiError(400, "Something went wrong While registering User.");
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
    const expiryDate = new Date(Date.now() + 3600000); // 1 hour

    return res
      .cookie("access_token", token, {
        httpOnly: true,
        expiresIn: process.env.JWT_SECRET_EXPIRY,
      })
      .status(201)
      .json(new ApiResponse(200, newUser, "User Registered Successfully"));
  }
});

export const signout = asyncHandler(async (req, res) => {
  res.clearCookie("access_token").status(200).json("Sign out Success");
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  const user = await User.findOne({
    verificationToken: otp,
    verificationTokenExpiresAt: { $gt: Date.now() },
  }).select("-createdAt -updatedAt -__v");

  if (!user) throw new ApiError(404, "User not Found.");

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiresAt = undefined;
  await user.save();

  const token = jwt.sign(
    {
      _id: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_SECRET_EXPIRY },
  );
  const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

  // await sendWelcomeEmail(user.email, user.name);

  res
    .cookie("access_token", token, {
      httpOnly: true,
      secure: true,
      expires: expiryDate,
    })
    .status(200)
    .json(new ApiResponse(200, user, "verified successfully"));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  try{
    const user = await User.findOne({email});
  }catch (error) {
    console.error("error: ", error.message);
  }
});

export const resetPassword = asyncHandler(async (req, res) => {});

export const verifyAuth = asyncHandler(async (req, res) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(200).json(new ApiResponse(200, null, "token not found"));
  }

  const decoded = jwt.verify(req.cookies?.access_token, process.env.JWT_SECRET);
  const user = await User.findById(decoded._id).select("-password");

  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  res.status(200).json(new ApiResponse(200, user, "User found."));
});
