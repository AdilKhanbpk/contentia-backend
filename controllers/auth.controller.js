import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

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
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, "Email address is already in use.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await User.create({
    email,
    password: hashedPassword,
  });

  const user = newUser.select("-password");

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

  const user = await User.findOne({ email }).select("-password");

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const isPasswordCorrect = await user.ComparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken } = await generateTokens(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(200, { user, accessToken }, "User logged in successfully")
    );
});

export const logout = (req, res) => {
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, null, "User logged out successfully"));
};
