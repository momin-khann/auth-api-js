import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
export const signup = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  if (!newUser)
    throw new ApiError(400, "Something went wrong While registering User.");
  await newUser.save();

  return res
    .status(201)
    .json(new ApiResponse(200, newUser, "User Registered Successfully"));
});

export const signin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const validUser = await User.findOne({ email });
  if (!validUser) throw new ApiError(404, "User not Found.");

  const validPassword = bcryptjs.compareSync(password, validUser.password);
  if (!validPassword) throw new ApiError(401, "Wrong Credentials");

  const token = jwt.sign(
    {
      id: validUser._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_SECRET_EXPIRY },
  );

  const { password: hashedPassword, ...rest } = validUser._doc;

  const expiryDate = new Date(Date.now() + 3600000); // 1 hour

  res
    .cookie("access_token", token, { httpOnly: true, expires: expiryDate })
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
