import User from "../models/user.model.js";
// import router from "../routes/user.routes.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadFileToCloudinary } from "../utils/Cloudinary.js";
import { isValidId, resolvePath } from "../utils/commonHelpers.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendOtp, handleSmsError } from "../utils/netgsmServiceOtp.js";

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

export const generateTokens = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  const accessToken = user.AccessToken();
  const refreshToken = user.RefreshToken();
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const signup = asyncHandler(async (req, res) => {
  const { email, password, phoneNumber, ...rest } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password");
  }

  // Check for existing verified user
  const existingVerifiedUser = await User.findOne({
    $or: [
      { email, isPhoneVerified: true },
      ...(phoneNumber ? [{ phoneNumber, isPhoneVerified: true }] : []),
    ],
  });

  if (existingVerifiedUser) {
    if (existingVerifiedUser.email === email) {
      throw new ApiError(400, "Email address is already in use.");
    }
    if (phoneNumber && existingVerifiedUser.phoneNumber === phoneNumber) {
      throw new ApiError(400, "Phone number is already in use.");
    }
  }

  // Check for existing unverified user
  const existingUnverifiedUser = await User.findOne({
    $or: [
      { email, isPhoneVerified: false },
      ...(phoneNumber ? [{ phoneNumber, isPhoneVerified: false }] : []),
    ],
  });

  // Generate OTP
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 40 * 5 * 60 * 1000);

  // Send OTP using Netgsm
  const smsResult = await sendOtp(phoneNumber, verificationCode);
  if (!smsResult.success) {
    throw new ApiError(500, smsResult.error || "Failed to send OTP");
  }

  let user;
  if (existingUnverifiedUser) {
    user = await User.findByIdAndUpdate(
      existingUnverifiedUser._id,
      {
        email,
        password,
        phoneNumber,
        verificationCode,
        otpExpiresAt,
        otpJobID: smsResult.jobID,
        ...rest,
      },
      { new: true }
    );
  } else {
    user = await User.create({
      email,
      password,
      phoneNumber,
      verificationCode,
      otpExpiresAt,
      otpJobID: smsResult.jobID,
      isPhoneVerified: false,
      authProvider: "credentials",
      ...rest,
    });
  }

  const userWithoutPassword = await User.findById(user._id).select("-password");
  const { accessToken, refreshToken } = await generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: userWithoutPassword, accessToken },
        "User registered successfully. OTP sent."
      )
    );
});

// export const resendOtop = asyncHandler(async (req, res) => {
//   const { phoneNumber, ...rest } = req.body;
//   const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
//   const otpExpiresAt = new Date(Date.now() + 40 * 5 * 60 * 1000);


//     if (existingUnverifiedUser) {
//       let user;
//       user = await User.findByIdAndUpdate(
//         existingUnverifiedUser._id,
//         {
//           verificationCode,
//           otpExpiresAt,
//           otpJobID: smsResult.jobID,
//           ...rest,
//         },
//         { new: true }
//       );
//     } 
//     resendOtpfunction(phoneNumber, verificationCode);
// }
// )

export const verifyOtp = asyncHandler(async (req, res) => {
  const { phoneNumber, verificationCode } = req.body;
console.log("phoneNumber, verificationCode", phoneNumber, verificationCode)

  if (!phoneNumber || !verificationCode) {
    throw new ApiError(400, "Phone number and verification code are required");
  }

  // Find user by phone number
  const user = await User.findOne({ phoneNumber });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // // Check if user is already verified 
  // if (user.isPhoneVerified) {
  //   router.post("/")
  //   throw new ApiError(400, "User is already verified");

  // }

  // Check if OTP has expired
  // if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
  //   throw new ApiError(400, "Verification code has expired. Please request a new one");
  // }

  // Verify the OTP code
  console.log("user.verificationCode", user);
  
if (Number(user.verificationCode) !== Number(verificationCode)) {
  throw new ApiError(400, "Invalid verification code");
}

  // Update user verification status
  user.isPhoneVerified = true;
  user.verified = true; // Set verified true on OTP verification
  user.verificationCode = undefined; // Clear the verification code
  user.otpExpiresAt = undefined; // Clear the expiration time
  await user.save({ validateBeforeSave: false });

  // Get user without password
  const userWithoutPassword = await User.findById(user._id).select("-password");

  // Generate new tokens (optional - if you want fresh tokens after verification)
  const { accessToken, refreshToken } = await generateTokens(user._id);

  // Update refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: userWithoutPassword, accessToken },
        "Phone number verified successfully"
      )
    );
});

// Optional: Resend OTP controller
export const resendOtp = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    throw new ApiError(400, "Phone number is required");
  }

  // Find user
  const user = await User.findOne({ phoneNumber });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // if (user.isPhoneVerified) {
  //   router.post("/");
  //   throw new ApiError(400, "User is already verified");
  // }

  // Generate new OTP
  const verificationCode = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  const smsResult = await sendOtp(user.phoneNumber, verificationCode);

  if (!smsResult.success) {
    console.error('SMS resend failed:', smsResult);
    const { statusCode, errorMessage } = handleSmsError(smsResult);
    throw new ApiError(statusCode, errorMessage);
  }

  console.log('SMS resent successfully:', smsResult);

  // Update user with new OTP
  user.verificationCode = verificationCode;
  user.otpExpiresAt = otpExpiresAt;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Verification code sent successfully"
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

  if (!user.verified) {
    throw new ApiError(403, "User is not verified. Please complete OTP verification.");
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
  const { ...rest } = req.body;

  isValidId(req.user._id);

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: rest },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated Successfully"));
});

export const changeProfilePic = asyncHandler(async (req, res) => {
  const filePath = req.file.path;

  isValidId(req.user._id);

  if (!filePath) {
    throw new ApiError(400, "Please upload a file");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const uploadedFile = await uploadFileToCloudinary(filePath);

  await user.updateOne({
    $set: {
      profilePic: uploadedFile?.secure_url,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile picture updated successfully"));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    throw new ApiError(400, "Please provide all the required fields");
  }

  isValidId(req.user._id);

  const user = await User.findById(req.user._id);

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

export const getProfile = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User retrieved successfully"));
});

export const getNewAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError(400, "Please provide a refresh token");
  }

  const user = await User.findOne({ refreshToken });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { accessToken } = await generateTokens(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(new ApiResponse(200, { accessToken }, "New access token generated"));
});