import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadFileToCloudinary } from "../utils/Cloudinary.js";
import { isValidId, resolvePath } from "../utils/commonHelpers.js";
import { createFolder } from "../utils/googleDrive.js";

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
        authProvider: "credentials",
        ...rest,
    });

    const user = await User.findById(newUser._id).select("-password");

    const { accessToken, refreshToken } = await generateTokens(newUser._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
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

    const userWithoutPassword = await User.findById(user._id).select(
        "-password"
    );

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
    // console.log(filePath);

    isValidId(req.user._id);

    if (!filePath) {
        throw new ApiError(400, "Please upload a file");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const uploadedFile = await uploadFileToCloudinary(filePath);

    // console.log(uploadedFile);

    await user.updateOne({
        $set: {
            profilePic: uploadedFile?.secure_url,
        },
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Profile picture updated successfully")
        );
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
    // console.log(req.user);
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
        .json(
            new ApiResponse(200, { accessToken }, "New access token generated")
        );
});
