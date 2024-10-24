import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { isValidId } from "../utils/commonHelpers.js";
import { findById, updateById } from "../utils/dbHelpers.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict", // Prevent CSRF attacks
};

const generateTokens = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const accessToken = user.AccessToken();
  await user.save({ validateBeforeSave: false });

  return { accessToken };
};

export const signup = asyncHandler(async (req, res, next) => {
  const { email, password, ...rest } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, "Email address is already in use.");
  }

  const newUser = await User.create({
    email,
    password,
    ...rest,
  });

  const user = await User.findById(newUser._id).select("-password");

  const { accessToken } = await generateTokens(newUser._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user, accessToken },
        "User registered successfully"
      )
    );
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const isPasswordCorrect = await user.ComparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken } = await generateTokens(user._id);

  const userWithoutPassword = await User.findById(user._id).select("-password");

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { userWithoutPassword, accessToken },
        "User logged in successfully"
      )
    );
});

export const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { ...rest } = req.body;

  isValidId(userId);

  const updatedUser = await updateById(User, userId, rest);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated Successfully"));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    throw new ApiError(400, "Please provide all the required fields");
  }

  isValidId(req.user._id);

  const user = await findById(User, req.user._id);

  const isPasswordCorrect = await user.ComparePassword(currentPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Current password is incorrect");
  }

  if (newPassword !== confirmNewPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
});

export const logout = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});
