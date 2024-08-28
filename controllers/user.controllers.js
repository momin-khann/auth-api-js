import { asyncHandler } from "../utils/asyncHandler.js";
import bcryptjs from "bcryptjs";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const test = (req, res) => {
  res.send("Api is running!!");
};

// update user
export const updateUser = asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res
      .status(401)
      .json(new ApiError(401, "You can only update your account !!"));
  }

  const { password } = req.body;
  if (password) {
    req.body.password = bcryptjs.hashSync(password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        profilePicture: req.body.profilePicture,
      },
    },
    { new: true },
  );

  const { password: hashedPassword, ...rest } = updatedUser._doc;

  res
    .status(201)
    .json(new ApiResponse(200, rest, "User updated Successfully."));
});

// delete user
export const deleteUser = asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res
      .status(401)
      .json(new ApiError("You can only delete your account"));
  }

  await User.findByIdAndDelete(req.params.id);
  res.status(200).json(new ApiResponse(200, null, "User has been deleted..."));
});
