import asyncHandler from "../utils/asyncHandler.js";
import Creator from "../models/creator.model.js";
import Orders from "../models/orders.model.js";
import Notifications from "../models/admin/adminNotification.model.js";
import ApiError from "../utils/ApiError.js";
import { cookieOptions } from "./user.controller.js";
import ApiResponse from "../utils/ApiResponse.js";
import { isValidId } from "../utils/commonHelpers.js";
import {
    listAllFilesInFolder,
    uploadFilesToFolder,
    createFolder,
    getFolderIdByName,
    listSpecificFolderInParentFolder,
    getCreatorFolderUrl,
} from "../utils/googleDrive.js";
import {
    deleteFileFromCloudinary,
    uploadFileToCloudinary,
    uploadMultipleFilesToCloudinary,
} from "../utils/Cloudinary.js";
import { sendNotification } from "./admin/adminNotification.controller.js";
import User from "../models/user.model.js";
import { notificationTemplates } from "../helpers/notificationTemplates.js";
import Order from "../models/orders.model.js";
import mongoose from "mongoose";
import { generateOtp } from "../utils/generateOtp.js";
import { sendOtp, handleSmsError } from "../utils/netgsmServiceOtp.js";

/**
 * Generates and returns a new access token for the given creator user ID
 * @param {ObjectId} userId - The MongoDB ObjectId of the creator user
 * @returns {Promise<Object>} - An object with the new access token
 * @throws {ApiError} - If the user is not found
 */
export const generateTokens = async (userId) => {
    const user = await Creator.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.AccessToken();
    await user.save({ validateBeforeSave: false });

    return { accessToken };
};

const loginCreator = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Please provide email and password");
    }

    const user = await Creator.findOne({ email });

    if (!user) {
        throw new ApiError(400, "Either email or password is incorrect");
    }

    const isPasswordCorrect = await user.ComparePassword(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Either email or password is incorrect");
    }

    // Check if creator has completed OTP verification
    if (!user.isPhoneVerified) {
        throw new ApiError(403, "Creator is not verified. Please complete OTP verification.");
    }

    // Check admin approval status
    if (user.isVerified === "pending" || user.isVerified === "rejected") {
        throw new ApiError(401, "Your account is not approved yet by admin");
    }

    const { accessToken } = await generateTokens(user._id);

    const userWithoutPassword = await Creator.findById(user._id).select(
        "-password"
    );

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { userWithoutPassword, accessToken },
                "Creator logged in successfully"
            )
        );
});

const createCreator = asyncHandler(async (req, res) => {
    let {
        fullName,
        password,
        tckn,
        email,
        dateOfBirth,
        phoneNumber,
        addressDetails,
        userAgreement,
        accountType,
        invoiceType,
        paymentInformation,
        billingInformation,
        preferences,
        ...rest
    } = req.body;

    // Set default invoiceType if not provided
    if (!invoiceType) {
        invoiceType = accountType || "individual";
    }

    if (
        !fullName ||
        !password ||
        // !tckn ||
        !email ||
        // !dateOfBirth ||
        // !phoneNumber ||
        !userAgreement ||
        !accountType ||
        !invoiceType
    ) {
        console.log("❌ Missing required fields:", {
            fullName: !!fullName,
            password: !!password,
            // tckn: !!tckn,
            email: !!email,
            // dateOfBirth: !!dateOfBirth,
            // phoneNumber: !!phoneNumber,
            userAgreement: !!userAgreement,
            accountType: !!accountType,
            invoiceType: !!invoiceType
        });
        throw new ApiError(400, "Please fill all the required fields");
    }

    // Check for existing phone-verified creator (email/phone truly taken)
    const existingVerifiedCreator = await Creator.findOne({
        $or: [
            { email, isPhoneVerified: true },
            { phoneNumber, isPhoneVerified: true }
        ]
    });

    if (existingVerifiedCreator) {
        if (existingVerifiedCreator.email === email) {
            throw new ApiError(400, "Email address is already in use.");
        }
        if (existingVerifiedCreator.phoneNumber === phoneNumber) {
            throw new ApiError(400, "Phone number is already in use.");
        }
    }

    // Check for existing unverified creator by email first (primary check)
    let existingUnverifiedCreator = await Creator.findOne({
        email,
        isPhoneVerified: false
    });

    // If not found by email, check by phone number
    if (!existingUnverifiedCreator) {
        existingUnverifiedCreator = await Creator.findOne({
            phoneNumber,
            isPhoneVerified: false
        });
    }

    console.log('🔍 Existing unverified creator found:', !!existingUnverifiedCreator);

    if (accountType === "individual") {

        if (!paymentInformation?.ibanNumber || !paymentInformation?.address) {
            throw new ApiError(
                400,
                "Please fill ibanNumber and address for individual account type"
            );
        }

        if (!paymentInformation?.fullName || !paymentInformation?.trId) {
            throw new ApiError(
                400,
                "Please fill fullName and trId for individual account type"
            );
        }
    } else if (accountType === "institutional") {
        if (
            !paymentInformation?.companyName ||
            !paymentInformation?.taxNumber ||
            !paymentInformation?.taxOffice
        ) {
            throw new ApiError(
                400,
                "Please fill companyName, taxNumber, and taxOffice for institutional account type"
            );
        }
    } else {
        throw new ApiError(
            400,
            "Account type must be 'individual' or 'institutional'"
        );
    }

    if (
        preferences?.contentInformation?.contentType === "product" ||
        preferences?.contentInformation?.contentType === "space"
    ) {
        if (!preferences.contentInformation.addressDetails) {
            throw new ApiError(
                400,
                "Address details are required for product or space"
            );
        }
    }

    if (preferences?.socialInformation.contentType === "yes") {
        if (!preferences.socialInformation.platforms) {
            throw new ApiError(400, "Please fill platforms for social media");
        }
    }

    const allAdminIds = await User.find({ role: "admin" }).select("_id");

    let newUser;
    if (existingUnverifiedCreator) {
        console.log('🔄 Updating existing unverified creator:', existingUnverifiedCreator._id);
        // Update existing unverified creator
        newUser = await Creator.findByIdAndUpdate(
            existingUnverifiedCreator._id,
            {
                fullName,
                password,
                tckn,
                email: email.trim().toLowerCase(),
                dateOfBirth,
                phoneNumber,
                userAgreement,
                addressDetails,
                accountType,
                invoiceType,
                paymentInformation,
                billingInformation,
                preferences,
                isVerified: "pending", // Admin approval status
                isPhoneVerified: false, // OTP verification status
                verified: false, // Keep this field as well
                ...rest,
            },
            { new: true }
        );
    } else {
        console.log('✨ Creating new creator');
        // Create new creator
        newUser = await Creator.create({
            fullName,
            password,
            tckn,
            email: email.trim().toLowerCase(),
            dateOfBirth,
            phoneNumber,
            userAgreement,
            addressDetails,
            accountType,
            invoiceType,
            paymentInformation,
            billingInformation,
            preferences,
            isVerified: "pending", // Admin approval status
            isPhoneVerified: false, // OTP verification status
            verified: false, // Keep this field as well
            ...rest,
        });
    }

    const notificationData = notificationTemplates.creatorRegistration({
        targetUsers: allAdminIds.map((admin) => admin._id),
        metadata: {
            creatorId: newUser._id,
            creatorName: newUser.fullName,
            creatorEmail: newUser.email,
            creatorPhoneNumber: newUser.phoneNumber,
            creatorAddress: addressDetails,
        },
    });

    await sendNotification(notificationData);

    // Automatically send OTP after successful registration
    let otpSent = false;
    let otpError = null;

    try {
        console.log('📱 Automatically sending OTP to:', newUser.phoneNumber);

        // Generate OTP
        const verificationCode = generateOtp();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Send OTP using Netgsm
        const smsResult = await sendOtp(newUser.phoneNumber, verificationCode);

        if (smsResult.success) {
            // Update creator with OTP details
            newUser.verificationCode = verificationCode;
            newUser.otpExpiresAt = otpExpiresAt;
            newUser.otpJobID = smsResult.jobID;
            await newUser.save({ validateBeforeSave: false });

            otpSent = true;
            console.log('✅ OTP sent automatically during registration');
        } else {
            console.error('❌ Failed to send OTP during registration:', smsResult);
            otpError = smsResult.error || 'Failed to send verification code';
        }
    } catch (error) {
        console.error('❌ Error sending OTP during registration:', error.message);
        otpError = 'Failed to send verification code';
    }

    return res.status(201).json({
        status: 201,
        data: {
            creator: {
                ...newUser.toObject(),
                password: undefined,
                verificationCode: undefined
            },
            phoneNumber: newUser.phoneNumber,
            requiresOtpVerification: true,
            otpSent: otpSent,
            otpError: otpError
        },
        message: otpSent
            ? "Creator registration successful. Verification code sent to your phone."
            : "Creator registration successful. Please request verification code manually.",
    });
});

// Send Initial OTP to Creator (called when creator reaches OTP page)
const sendCreatorOtp = asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        throw new ApiError(400, "Phone number is required");
    }

    // Find creator by phone number
    const creator = await Creator.findOne({ phoneNumber });

    if (!creator) {
        throw new ApiError(404, "Creator not found");
    }

    // Check if creator is already verified
    if (creator.isPhoneVerified) {
        throw new ApiError(400, "Creator is already verified");
    }

    // Generate OTP
    const verificationCode = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Send OTP using Netgsm
    const smsResult = await sendOtp(phoneNumber, verificationCode);
    if (!smsResult.success) {
        console.error('SMS send failed:', smsResult);
        const { statusCode, errorMessage } = handleSmsError(smsResult);
        throw new ApiError(statusCode, errorMessage);
    }

    console.log('SMS sent successfully:', smsResult);

    // Update creator with OTP details
    creator.verificationCode = verificationCode;
    creator.otpExpiresAt = otpExpiresAt;
    creator.otpJobID = smsResult.jobID;
    await creator.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { phoneNumber },
                "Verification code sent successfully"
            )
        );
}); 

// Creator OTP Verification
const verifyCreatorOtp = asyncHandler(async (req, res) => {
    const { phoneNumber, verificationCode } = req.body;
    console.log("phoneNumber, verificationCode", phoneNumber, verificationCode);

    if (!phoneNumber || !verificationCode) {
        throw new ApiError(400, "Phone number and verification code are required");
    }

    // Find creator by phone number
    const creator = await Creator.findOne({ phoneNumber });

    if (!creator) {
        throw new ApiError(404, "Creator not found");
    }

    // Check if OTP has expired (optional - you can uncomment if needed)
    // if (creator.otpExpiresAt && new Date() > creator.otpExpiresAt) {
    //     throw new ApiError(400, "Verification code has expired. Please request a new one");
    // }

    // Verify the OTP code
    console.log("creator.verificationCode", creator.verificationCode);

    if (Number(creator.verificationCode) !== Number(verificationCode)) {
        throw new ApiError(400, "Invalid verification code");
    }

    // Update creator verification status
    creator.isPhoneVerified = true; // Mark phone as verified
    creator.verified = true; // Also set verified field for compatibility
    creator.verificationCode = undefined; // Clear the verification code
    creator.otpExpiresAt = undefined; // Clear the expiration time
    await creator.save({ validateBeforeSave: false });

    // Get creator without password
    const creatorWithoutPassword = await Creator.findById(creator._id).select("-password");

    // Generate new tokens
    const { accessToken } = await generateTokens(creator._id);

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { creator: creatorWithoutPassword, accessToken },
                "Phone number verified successfully"
            )
        );
});

// Creator Resend OTP
const resendCreatorOtp = asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        throw new ApiError(400, "Phone number is required");
    }

    // Find creator
    const creator = await Creator.findOne({ phoneNumber });

    if (!creator) {
        throw new ApiError(404, "Creator not found");
    }

    // Generate new OTP
    const verificationCode = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const smsResult = await sendOtp(creator.phoneNumber, verificationCode);

    if (!smsResult.success) {
        console.error('SMS resend failed:', smsResult);
        const { statusCode, errorMessage } = handleSmsError(smsResult);
        throw new ApiError(statusCode, errorMessage);
    }

    console.log('SMS resent successfully:', smsResult);

    // Update creator with new OTP
    creator.verificationCode = verificationCode;
    creator.otpExpiresAt = otpExpiresAt;
    creator.otpJobID = smsResult.jobID;
    await creator.save({ validateBeforeSave: false });

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

const updateCreator = asyncHandler(async (req, res) => {
    const creatorId = req.user._id;
    isValidId(creatorId);

    const updateData = req.body;
    console.log("🚀 ~ updateCreator ~ updateData:", updateData)

    const setFields = {};
    for (const [key, value] of Object.entries(updateData)) {
        if (key === "email") {
            const emailPattern =
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailPattern.test(value)) {
                throw new ApiError(400, "Invalid email format.");
            }

            const trimmedEmail = value.trim().toLowerCase();
            const emailExists = await Creator.findOne({
                email: trimmedEmail,
                _id: { $ne: creatorId },
            });

            if (emailExists) {
                throw new ApiError(400, "Email already exists.");
            } else {
                setFields[key] = value;
            }
        } else if (key === "password") {
            throw new ApiError(
                400,
                "Password updates are not allowed in this endpoint."
            );
        }
        //  else if (key === "dateOfBirth") {
        //     const dateOfBirth = new Date(value);
        //     const now = new Date();

        //     if (dateOfBirth > now) {
        //         throw new ApiError(
        //             400,
        //             "Date of birth cannot be in the future."
        //         );
        //     }

        //     setFields[key] = dateOfBirth;
        // }
        else if (typeof value === "object" && !Array.isArray(value)) {
            for (const [nestedKey, nestedValue] of Object.entries(value)) {
                setFields[`${key}.${nestedKey}`] = nestedValue;
            }
        } else {
            setFields[key] = value;
        }
    }

    const updatedCreator = await Creator.findByIdAndUpdate(
        creatorId,
        { $set: setFields },
        { new: true }
    );

    if (!updatedCreator) {
        throw new ApiError(404, "Creator not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedCreator, "Creator updated successfully")
        );
});

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        throw new ApiError(400, "Please provide all the required fields");
    }

    isValidId(req.user._id);

    const creator = await Creator.findById(req.user._id);
    if (!creator) {
        throw new ApiError(404, "Creator not found");
    }

    const isPasswordCorrect = await creator.ComparePassword(currentPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Current password is incorrect");
    }

    if (newPassword !== confirmNewPassword) {
        throw new ApiError(400, "Passwords do not match");
    }

    creator.password = newPassword;
    await creator.save();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Password changed successfully"));
});

const applyForOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    if (!orderId) {
        throw new ApiError(400, "Please provide orderId");
    }

    isValidId(orderId);

    const order = await Orders.findById(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const creator = await Creator.findById(req.user._id);

    if (!creator) {
        throw new ApiError(404, "Creator not found");
    }

    const isAlreadyApplied = order.appliedCreators.includes(creator._id);
    const isAlreadyAssigned = order.assignedCreators.includes(creator._id);
    const isAlreadyRejected = order.rejectedCreators.includes(creator._id);

    if (isAlreadyApplied) {
        throw new ApiError(400, "You have already applied for this order");
    }

    if (isAlreadyAssigned) {
        throw new ApiError(400, "You have already been assigned to this order");
    }

    if (isAlreadyRejected) {
        throw new ApiError(
            400,
            "You have already been rejected for this order"
        );
    }

    const allAdminIds = await User.find({ role: "admin" }).select("_id");
    const notificationData = notificationTemplates.creatorApplyForOrder({
        targetUsers: allAdminIds.map((admin) => admin._id),
        metadata: {
            creatorId: creator._id,
            creatorEmail: creator.email,
            creatorName: creator.fullName,
            creatorPhoneNumber: creator.phoneNumber,
            orderId: order._id,
        },
    });

    await sendNotification(notificationData);

    order.appliedCreators.push(creator._id);

    await order.save();

    return res
        .status(200)
        .json(new ApiResponse(200, order, "You Have Applied Successfully"));
});

const getAllAppliedOrders = asyncHandler(async (req, res) => {
    const creatorId = req.user._id;

    isValidId(creatorId);

    const appliedOrders = await Orders.find({
        appliedCreators: creatorId,
    })
        .sort({ createdAt: -1 })

        .populate({
            path: "associatedBrands",
            select: "-associatedOrders",
        });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                appliedOrders,
                "Applied orders retrieved successfully"
            )
        );
});

const myRejectedOrders = asyncHandler(async (req, res) => {
    const creatorId = req.user._id;

    isValidId(creatorId);

    const rejectedOrders = await Orders.find({
        rejectedCreators: creatorId,
    })
        .sort({ createdAt: -1 })

        .populate({
            path: "associatedBrands",
            select: "-associatedOrders",
        });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                rejectedOrders,
                "Rejected orders retrieved successfully"
            )
        );
});

const myAssignedOrders = asyncHandler(async (req, res) => {
    const creatorId = req.user._id;

    isValidId(creatorId);

    const assignedOrders = await Orders.find({
        assignedCreators: creatorId,
    })
        .sort({ createdAt: -1 })

        .populate({
            path: "associatedBrands",
            select: "-associatedOrders",
        });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                assignedOrders,
                "Assigned orders retrieved successfully"
            )
        );
});

const changeProfilePicture = asyncHandler(async (req, res) => {
    const creatorId = req.user._id;

    isValidId(creatorId);

    const creator = await Creator.findById(creatorId);

    if (!creator) {
        throw new ApiError(404, "Creator not found");
    }

    const profilePath = req.file.path;

    const uploadedImage = await uploadFileToCloudinary(profilePath, {
        folder: "creator-profile",
        resource_type: "image",
    });

    if (!uploadedImage) {
        throw new ApiError(500, "Failed to upload profile picture");
    }

    creator.profilePic = uploadedImage?.secure_url;

    await creator.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                creator,
                "Profile picture updated successfully"
            )
        );
});


// const uploadContentToOrder = asyncHandler(async (req, res) => {
//     const { orderId } = req.params;
//     const creatorId = req.user._id;
//     const ordernote = req.creatorNoteOnOrder

//     isValidId(orderId);
//     isValidId(creatorId);

//     const order = await Order.findById(orderId);
//     if (!order) {
//         throw new ApiError(404, "Order not found");
//     }

//     const creator = await Creator.findById(creatorId);
//     if (!creator) {
//         throw new ApiError(404, "Creator not found");
//     }

//     if (!req.files || req.files.length === 0) {
//         throw new ApiError(400, "No files uploaded");
//     }

//     const filesPath = req.files.map((file) => file.path);

//     // UPLOAD TO GOOGLE DRIVE LOGIC
//     // try {
//     //     let orderFolderId = await getFolderIdByName(orderId);
//     //     if (!orderFolderId) {
//     //         orderFolderId = await createFolder(orderId);
//     //     }

//     //     let creatorFolderId = await getFolderIdByName(creatorId, orderFolderId); // Pass the parent folder ID
//     //     if (!creatorFolderId) {
//     //         creatorFolderId = await createFolder(creatorId, orderFolderId);
//     //     }

//     //     const uploadedFilesToGoogleDrive = await uploadFilesToFolder(
//     //         creatorFolderId,
//     //         filesPath
//     //     );

//     //     if (
//     //         !uploadedFilesToGoogleDrive ||
//     //         uploadedFilesToGoogleDrive.length === 0
//     //     ) {
//     //         throw new ApiError(500, "Failed to upload files to Google Drive");
//     //     }

//     //     const fileUrlsFromGoogleDrive = uploadedFilesToGoogleDrive.map(
//     //         (file) =>
//     //             `https://drive.google.com/uc?id=${file.id}&export=download`
//     //     );


//     //     order.uploadFiles.push({
//     //         uploadedBy: creatorId,
//     //         fileUrls: fileUrlsFromGoogleDrive,
//     //         uploadedDate: new Date(),
//     //     });
//     //     await order.save();

//     //     return res.status(200).json(
//     //         new ApiResponse(
//     //             200,
//     //             {
//     //                 order,
//     //             },
//     //             "Content uploaded successfully to Google Drive"
//     //         )
//     //     );
//     // } catch (error) {
//     //     throw new ApiError(500, `Google Drive upload error: ${error.message}`);
//     // }

//     try {
//         let orderFolderId = await getFolderIdByName(orderId);
//         if (!orderFolderId) {
//             orderFolderId = await createFolder(orderId);
//         }

//         let creatorFolderId = await getFolderIdByName(creatorId, orderFolderId);
//         if (!creatorFolderId) {
//             creatorFolderId = await createFolder(creatorId, orderFolderId);
//         }

//         const uploadedFilesToGoogleDrive = await uploadFilesToFolder(
//             creatorFolderId,
//             filesPath
//         );

//         if (
//             !uploadedFilesToGoogleDrive ||
//             uploadedFilesToGoogleDrive.length === 0
//         ) {
//             throw new ApiError(500, "Failed to upload files to Google Drive");
//         }

//         const creatorFolderUrl = await getCreatorFolderUrl(orderId, creatorId);

//         order.uploadFiles.push({
//             uploadedBy: creatorId,
//             fileUrls: creatorFolderUrl,
//             uploadedDate: new Date(),
//             creatorNoteOnOrder : ordernote,
//         });
//         const existingUpload = order.uploadFiles.find(upload => upload.uploadedBy.toString() === creatorId.toString());

//         if (!existingUpload) {
//             // Only push if there's no existing record for this creator
//             order.uploadFiles.push({
//                 uploadedBy: creatorId,
//                 fileUrls: creatorFolderUrl,
//                 uploadedDate: new Date(),
//             });
//         } else {
//             // Optionally, update the timestamp or fileUrls if needed
//             existingUpload.uploadedDate = new Date();
//             existingUpload.fileUrls = creatorFolderUrl; // Or append to an array if you're saving individual files
//         }

//         await order.save();

//         return res.status(200).json(
//             new ApiResponse(
//                 200,
//                 {
//                     order,
//                 },
//                 "Content uploaded successfully to Google Drive"
//             )
//         );
//     } catch (error) {
//         throw new ApiError(500, `Google Drive upload error: ${error.message}`);
//     }

// });





// const uploadContentToOrder = asyncHandler(async (req, res) => {
//     const { orderId } = req.params;
//     const creatorId = req.user._id;
//     const creatorNoteOnOrder = req.body.creatorNoteOnOrder; // Make sure you're sending this from frontend

//     isValidId(orderId);
//     isValidId(creatorId);

//     const order = await Order.findById(orderId);
//     if (!order) {
//         throw new ApiError(404, "Order not found");
//     }

//     const creator = await Creator.findById(creatorId);
//     if (!creator) {
//         throw new ApiError(404, "Creator not found");
//     }

//     if (!req.files || req.files.length === 0) {
//         throw new ApiError(400, "No files uploaded");
//     }

//     const filesPath = req.files.map((file) => file.path);

//     try {
//         // Step 1: Ensure Order and Creator folders exist
//         let orderFolderId = await getFolderIdByName(orderId);
//         if (!orderFolderId) {
//             orderFolderId = await createFolder(orderId);
//         }

//         let creatorFolderId = await getFolderIdByName(creatorId, orderFolderId);
//         if (!creatorFolderId) {
//             creatorFolderId = await createFolder(creatorId, orderFolderId);
//         }

//         // Step 2: Upload files to Google Drive
//         const uploadedFilesToGoogleDrive = await uploadFilesToFolder(
//             creatorFolderId,
//             filesPath
//         );

//         if (!uploadedFilesToGoogleDrive || uploadedFilesToGoogleDrive.length === 0) {
//             throw new ApiError(500, "Failed to upload files to Google Drive");
//         }

//         // Step 3: Get the creator's folder URL
//         const creatorFolderUrl = await getCreatorFolderUrl(orderId, creatorId);

//         // Step 4: Check if this creator already has an upload entry
//         const existingUpload = order.uploadFiles.find(
//             (upload) => upload.uploadedBy.toString() === creatorId.toString()
//         );

//         if (existingUpload) {
//             // ✅ Update existing entry
//             existingUpload.uploadedDate = new Date();
//             existingUpload.creatorNoteOnOrder = creatorNoteOnOrder || existingUpload.creatorNoteOnOrder;
//             existingUpload.fileUrls = creatorFolderUrl; // Only if you want to refresh the folder link
//         } else {
//             // ✅ Add new entry only if none exists
//             order.uploadFiles.push({
//                 uploadedBy: creatorId,
//                 fileUrls: creatorFolderUrl,
//                 uploadedDate: new Date(),
//                 creatorNoteOnOrder: creatorNoteOnOrder || "",
//             });
//         }

//         await order.save();

//         return res.status(200).json(
//             new ApiResponse(
//                 200,
//                 { order },
//                 "Content uploaded successfully to Google Drive"
//             )
//         );
//     } catch (error) {
//         throw new ApiError(500, `Google Drive upload error: ${error.message}`);
//     }
// });

const uploadContentToOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const creatorId = req.user._id;
    const creatorNoteOnOrder = req.body.creatorNoteOnOrder;

    isValidId(orderId);
    isValidId(creatorId);

    const [order, creator] = await Promise.all([
        Order.findById(orderId),
        Creator.findById(creatorId),
    ]);

    if (!order) throw new ApiError(404, "Order not found");
    if (!creator) throw new ApiError(404, "Creator not found");

    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "No files uploaded");
    }

    const filesPath = req.files.map((file) => file.path);

    try {
        // Step 1: Ensure order folder
        let orderFolderId = await getFolderIdByName(orderId);
        if (!orderFolderId) {
            orderFolderId = await createFolder(orderId);
        }

        // Step 2: Check if creator folder exists
        let creatorFolderId = await getFolderIdByName(creatorId, orderFolderId);
        const isNewFolder = !creatorFolderId;

        // Step 3: Create creator folder only if it doesn't exist
        if (!creatorFolderId) {
            creatorFolderId = await createFolder(creatorId, orderFolderId);
        }

        // Step 4: Upload files to Google Drive
        const uploadedFilesToGoogleDrive = await uploadFilesToFolder(
            creatorFolderId,
            filesPath
        );

        if (!uploadedFilesToGoogleDrive || uploadedFilesToGoogleDrive.length === 0) {
            throw new ApiError(500, "Failed to upload files to Google Drive");
        }

        const creatorFolderUrl = await getCreatorFolderUrl(orderId, creatorId);

        // Step 5: Modify database depending on folder existence
        const existingUpload = order.uploadFiles.find(
            (upload) => upload.uploadedBy.toString() === creatorId.toString()
        );

        if (isNewFolder || !existingUpload) {
            // ✅ New folder: add new entry
            order.uploadFiles.push({
                uploadedBy: creatorId,
                fileUrls: creatorFolderUrl,
                uploadedDate: new Date(),
                creatorNoteOnOrder: creatorNoteOnOrder || "",
            });
        } else {
            // ✅ Existing folder: only update note and date
            existingUpload.uploadedDate = new Date();
            existingUpload.creatorNoteOnOrder = creatorNoteOnOrder || existingUpload.creatorNoteOnOrder;
            // Do NOT push a new entry
        }

        await order.save();

        return res.status(200).json(
            new ApiResponse(200, { order }, "Content uploaded successfully to Google Drive")
        );
    } catch (error) {
        throw new ApiError(500, `Google Drive upload error: ${error.message}`);
    }
});


const completeTheOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { creatorNoteOnOrder } = req.body;
    const creatorId = req.user._id;

    if (!creatorNoteOnOrder) {
        throw new ApiError(400, "Please provide creator note on order");
    }

    isValidId(orderId);
    isValidId(creatorId);

    const [order, creator] = await Promise.all([
        Order.findById(orderId),
        Creator.findById(creatorId),
    ]);

    if (!order) throw new ApiError(404, "Order not found");
    if (!creator) throw new ApiError(404, "Creator not found");

    if (order.orderStatus === "completed") {
        throw new ApiError(400, "Order is already completed");
    }

    if (order.quotaLeft <= 0) {
        throw new ApiError(400, "Order quota already completed");
    }

    // Update order progress
    order.creatorNoteOnOrder = creatorNoteOnOrder;

    order.quotaLeft -= 1;

    if (order.quotaLeft <= 0) {
        order.quotaLeft = 0; // safeguard
        order.orderStatus = "completed";
    }

    await order.save();

    const adminUsers = await User.find({ role: "admin" }).select("_id");

    const metadata = {
        creatorId: creator._id,
        creatorName: creator.fullName,
        creatorEmail: creator.email,
        creatorPhoneNumber: creator.phoneNumber,
        orderId: order._id,
    };

    await Promise.all([
        sendNotification(
            notificationTemplates.orderCompletionByCreatorToAdmin({
                orderTitle: order.briefContent.brandName || "Order",
                targetUsers: adminUsers.map((admin) => admin._id),
                metadata,
            })
        ),
        sendNotification(
            notificationTemplates.orderCompletionByCreator({
                orderTitle: order.briefContent.brandName || "Order",
                targetUsers: [order.orderOwner],
                metadata,
            })
        ),
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order completed successfully"));
});


// const completeTheOrder = asyncHandler(async (req, res) => {
//     const { orderId } = req.params;
//     const creatorId = req.user._id;

//     isValidId(orderId);
//     isValidId(creatorId);

//     const [order, creator] = await Promise.all([
//         Order.findById(orderId),
//         Creator.findById(creatorId),
//     ]);

//     if (!order) throw new ApiError(404, "Order not found");
//     if (!creator) throw new ApiError(404, "Creator not found");

//     if (order.orderStatus === "completed") {
//         throw new ApiError(400, "Order is already completed");
//     }

//     if (order.quotaLeft <= 0) {
//         throw new ApiError(400, "Order quota already completed");
//     }

//     // ✅ Check if at least one upload file has a non-empty creatorNoteOnOrder
//     const hasValidNote = order.uploadFiles?.some(file => file.creatorNoteOnOrder?.trim());
//     if (!hasValidNote) {
//         throw new ApiError(400, "At least one creator note on order is required");
//     }

//     // ✅ Decrement quota and complete the order if necessary
//     order.quotaLeft -= 1;

//     if (order.quotaLeft <= 0) {
//         order.quotaLeft = 0;
//         order.orderStatus = "completed";
//     }

//     await order.save();

//     const adminUsers = await User.find({ role: "admin" }).select("_id");

//     const metadata = {
//         creatorId: creator._id,
//         creatorName: creator.fullName,
//         creatorEmail: creator.email,
//         creatorPhoneNumber: creator.phoneNumber,
//         orderId: order._id,
//     };

//     await Promise.all([
//         sendNotification(
//             notificationTemplates.orderCompletionByCreatorToAdmin({
//                 orderTitle: order.briefContent.brandName || "Order",
//                 targetUsers: adminUsers.map((admin) => admin._id),
//                 metadata,
//             })
//         ),
//         sendNotification(
//             notificationTemplates.orderCompletionByCreator({
//                 orderTitle: order.briefContent.brandName || "Order",
//                 targetUsers: [order.orderOwner],
//                 metadata,
//             })
//         ),
//     ]);

//     return res
//         .status(200)
//         .json(new ApiResponse(200, order, "Order completed successfully"));
// });




const getNotifications = asyncHandler(async (req, res) => {
    const creatorId = req.user._id;

    isValidId(creatorId);

    const notifications = await Notifications.find({ creatorId });

    return res
        .status(200)
        .json(new ApiResponse(200, notifications, "Notifications retrieved"));
});

const addOrderToFavorites = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    isValidId(orderId);

    const creatorId = req.user._id;

    isValidId(creatorId);

    const creator = await Creator.findById(creatorId);

    if (!creator) {
        throw new ApiError(404, "Creator not found");
    }

    const order = await Orders.findById(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const isAlreadyFavorite = creator.favoriteOrders.includes(order._id);

    if (isAlreadyFavorite) {
        throw new ApiError(400, "Order is already in favorites");
    }

    creator.favoriteOrders.push(order._id);

    await creator.save();

    return res
        .status(200)
        .json(new ApiResponse(200, creator, "Order added to favorites"));
});

const removeOrderFromFavorites = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    isValidId(orderId);

    const creatorId = req.user._id;

    isValidId(creatorId);

    const creator = await Creator.findById(creatorId);

    if (!creator) {
        throw new ApiError(404, "Creator not found");
    }

    const order = await Orders.findById(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const isAlreadyFavorite = creator.favoriteOrders.includes(order._id);

    if (!isAlreadyFavorite) {
        throw new ApiError(400, "Order is not in favorites");
    }

    creator.favoriteOrders = creator.favoriteOrders.filter(
        (id) => id.toString() !== orderId.toString()
    );

    await creator.save();

    return res
        .status(200)
        .json(new ApiResponse(200, creator, "Order removed from favorites"));
});

const getAllMyFavoriteOrders = asyncHandler(async (req, res) => {
    const creatorId = req.user._id;

    isValidId(creatorId);

    const favoriteOrders = await Creator.findById(creatorId).populate({
        path: "favoriteOrders",
        populate: {
            path: "associatedBrands",
            select: "-associatedOrders",
        },
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, favoriteOrders, "Favorite orders retrieved")
        );
});

const getMyOrderFolderToUploadContent = asyncHandler(async (req, res) => {
    const creatorId = req.user._id;
    const { orderId } = req.params;

    isValidId(creatorId);

    isValidId(orderId);

    const order = await Orders.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const creator = await Creator.findById(creatorId);
    if (!creator) {
        throw new ApiError(404, "Creator not found");
    }

    const myFolder = await listSpecificFolderInParentFolder(orderId, creatorId);

    if (!myFolder) {
        throw new ApiError(404, "Folder not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, myFolder, "My folder retrieved"));
});

const totalAppliedAndAssignedOrders = asyncHandler(async (req, res) => {
    const creatorId = req.user._id;

    const totalOrders = await Order.countDocuments({
        $or: [{ assignedCreators: creatorId }, { appliedCreators: creatorId }],
    });

    return res
        .status(200)
        .json(new ApiResponse(200, totalOrders, "Total orders retrieved"));
});

const totalNumberOfUgcForCompletedOrders = asyncHandler(async (req, res) => {
    const creatorId = req.user._id;

    const result = await Order.aggregate([
        {
            $match: {
                orderStatus: "completed",
                assignedCreators: creatorId,
            },
        },
        {
            $group: {
                _id: null,
                totalUgc: { $sum: "$noOfUgc" },
            },
        },
    ]);

    const totalUgc = result.length > 0 ? result[0].totalUgc : 0;

    return res
        .status(200)
        .json(new ApiResponse(200, totalUgc, "Total UGC retrieved"));
});

const totalCompletedOrdersWithShareOption = asyncHandler(async (req, res) => {
    const creatorId = req.user._id;

    const totalOrders = await Order.countDocuments({
        orderStatus: "completed",
        "additionalServices.share": true,
        assignedCreators: creatorId,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, totalOrders, "Total orders retrieved"));
});

const totalAssignedOrders = asyncHandler(async (req, res) => {
    const creatorId = req.user._id;

    const totalOrders = await Order.countDocuments({
        assignedCreators: creatorId,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, totalOrders, "Total orders retrieved"));
});

const deleteCreatorAccount = asyncHandler(async (req, res) => {
    const creatorId = req.user._id;
    const creator = await Creator.findById(creatorId)

    if (creator?.profilePic) {
        await deleteFileFromCloudinary(creator?.profilePic);
    }

    const deletedCreator = await Creator.findByIdAndDelete(creator._id);
    if (!deletedCreator) {
        throw new ApiError(404, "Creator not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, deletedCreator, "Creator account deleted"));
})


const getDashboardChartDetails = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const productOrders = await Order.countDocuments({
        "preferences.contentType": "product",
        orderStatus: "completed",
        assignedCreators: { $in: [userId] },
    });

    const serviceOrders = await Order.countDocuments({
        "preferences.contentType": "service",
        orderStatus: "completed",
        assignedCreators: { $in: [userId] },
    });

    const locationOrders = await Order.countDocuments({
        "preferences.contentType": "location",
        orderStatus: "completed",
        assignedCreators: { $in: [userId] },
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, { productOrders, serviceOrders, locationOrders }, "Completed orders count retrieved successfully")
        );
});


const getTotalPriceEarnedByCreator = asyncHandler(async (req, res) => {
    const creatorId = req.user._id;
    const totalOrders = await Order.aggregate([
        {
            $match: {
                assignedCreators: creatorId,
                orderStatus: "completed",
            },
        },
        {
            $group: {
                _id: null,
                totalPrice: { $sum: "$totalPriceForCreator" },
            },
        },
    ]);

    if (totalOrders.length > 0) {
        const totalPrice = totalOrders[0].totalPrice;
        return res
            .status(200)
            .json(new ApiResponse(200, totalPrice, "Total price retrieved"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, 0, "Total price retrieved"));
})

const getCreatorStats = asyncHandler(async (req, res) => {
    const { creatorId } = req.params;

    isValidId(creatorId);

    const creator = await Creator.findById(creatorId);
    if (!creator) {
        throw new ApiError(404, "Creator not found");
    }

    const creatorTotalActiveOrder = await Order.countDocuments({
        assignedCreators: creatorId,
        orderStatus: "active",
    });

    const creatorTotalOrders = await Order.countDocuments({
        assignedCreators: creatorId,
    });

    const creatorTotalCompletedOrders = await Order.countDocuments({
        assignedCreators: creatorId,
        orderStatus: "completed",
    });

    const completedOrders = await Order.find({
        assignedCreators: creatorId,
        orderStatus: "completed"
    });

    const creatorAllStatusesOrders = await Order.countDocuments({
        $or: [
            { assignedCreators: creatorId },
            { appliedCreators: creatorId },
            { rejectedCreators: creatorId },
        ],
    });



    const totalNumberOfUgcsFromCompletedOrders = completedOrders.reduce((acc, order) => {
        return acc + (order.noOfUgc || 0);
    }, 0);


    const creatorCompletedOrderTotalPriceValue = await Order.aggregate([
        {
            $match: {
                assignedCreators: new mongoose.Types.ObjectId(String(creatorId)),
                orderStatus: "completed",
            },
        },
        {
            $group: {
                _id: null,
                totalPrice: { $sum: "$totalPriceForCreator" },
            },
        },
    ]);

    const creatorCompletedOrderTotalPrice = creatorCompletedOrderTotalPriceValue.length > 0 ? creatorCompletedOrderTotalPriceValue[0].totalPrice : 0;

    console.log("🚀 ~ getCreatorStats ~ creatorCompletedOrderTotalPrice:", creatorCompletedOrderTotalPrice)
    return res
        .status(200)
        .json(new ApiResponse(200, { totalNumberOfUgcsFromCompletedOrders, creatorTotalActiveOrder, creatorTotalOrders, creatorTotalCompletedOrders, creatorCompletedOrderTotalPrice, creatorAllStatusesOrders }, "Creator stats retrieved successfully"));
})

const getTotalOrdersOfCreator = asyncHandler(async (req, res) => {
    const creatorId = req.user._id;

    const orders = await Order.find({
        $or: [
            { assignedCreators: creatorId },
            { appliedCreators: creatorId },
            { rejectedCreators: creatorId },
        ],
    }).populate({
        path: "associatedBrands",
        select: "-associatedOrders",
    });

    return res
        .status(200)
        .json(new ApiResponse(200, orders, "Total orders retrieved successfully"));
})



export {
    loginCreator,
    createCreator,
    sendCreatorOtp,
    verifyCreatorOtp,
    resendCreatorOtp,
    updateCreator,
    applyForOrder,
    changePassword,
    getNotifications,
    changeProfilePicture,
    addOrderToFavorites,
    myAssignedOrders,
    myRejectedOrders,
    uploadContentToOrder,
    completeTheOrder,
    getAllAppliedOrders,
    removeOrderFromFavorites,
    getMyOrderFolderToUploadContent,
    getAllMyFavoriteOrders,
    totalAppliedAndAssignedOrders,
    totalNumberOfUgcForCompletedOrders,
    totalCompletedOrdersWithShareOption,
    totalAssignedOrders,
    deleteCreatorAccount,
    getDashboardChartDetails,
    getTotalPriceEarnedByCreator,
    getCreatorStats,
    getTotalOrdersOfCreator

};
