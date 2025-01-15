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
} from "../utils/googleDrive.js";
import {
    uploadFileToCloudinary,
    uploadMultipleFilesToCloudinary,
} from "../utils/Cloudinary.js";
import { sendNotification } from "./admin/adminNotification.controller.js";
import User from "../models/user.model.js";
import { notificationTemplates } from "../helpers/notificationTemplates.js";
import Order from "../models/orders.model.js";

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

    if (user.isVerified === "pending" || user.isVerified === "rejected") {
        throw new ApiError(401, "Your account is not verified yet");
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
    const {
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

    if (
        !fullName ||
        !password ||
        !tckn ||
        !email ||
        !dateOfBirth ||
        !phoneNumber ||
        !userAgreement ||
        !accountType ||
        !invoiceType
    ) {
        throw new ApiError(400, "Please fill all the required fields");
    }

    if (
        !addressDetails ||
        !addressDetails?.addressOne ||
        !addressDetails?.addressTwo ||
        !addressDetails?.zipCode ||
        !addressDetails?.country
    ) {
        throw new ApiError(400, "Please fill address details");
    }

    const checkEmail = await Creator.findOne({ email });

    if (checkEmail) {
        throw new ApiError(400, "Email address is already in use.");
    }

    if (accountType === "individual") {
        // console.log("Account type:", accountType);

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
        // console.log("Account type:", accountType);
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

    if (invoiceType === "individual") {
        // console.log("Invoice type:", invoiceType);
        // console.log(billingInformation);

        if (
            !billingInformation?.invoiceStatus ||
            !billingInformation?.address
        ) {
            throw new ApiError(
                400,
                "Please fill invoiceStatus and address for individual invoice type"
            );
        }

        if (!billingInformation?.fullName) {
            throw new ApiError(
                400,
                "Please fill fullName for individual invoice type"
            );
        }
    } else if (invoiceType === "institutional") {
        // console.log("Invoice type:", invoiceType);
        if (
            !billingInformation?.companyName ||
            !billingInformation?.taxNumber ||
            !billingInformation?.taxOffice
        ) {
            throw new ApiError(
                400,
                "Please fill companyName, taxNumber, and taxOffice for institutional invoice type"
            );
        }
    } else {
        throw new ApiError(
            400,
            "Invoice type must be 'individual' or 'institutional'"
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

    const allAdminIds = await User.find({ role: "admin" }).select("_id");

    const newUser = await Creator.create({
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
        ...rest,
    });

    const notificationData = notificationTemplates.creatorRegistration({
        creatorName: fullName,
        creatorEmail: email,
        creatorPhoneNumber: phoneNumber,
        targetUsers: allAdminIds.map((admin) => admin._id),
        metadata: {
            creatorId: newUser._id,
            creatorAddress: addressDetails,
        },
    });

    await sendNotification(notificationData);

    return res.status(201).json({
        status: 201,
        data: newUser,
        message: "Creator user created successfully",
    });
});

const updateCreator = asyncHandler(async (req, res) => {
    const creatorId = req.user._id;
    isValidId(creatorId);

    const updateData = req.body;

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
        } else if (typeof value === "object" && !Array.isArray(value)) {
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

    if (order.orderStatus !== "pending") {
        throw new ApiError(400, "Order is not in a pending state");
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
        creatorName: creator.fullName,
        creatorEmail: creator.email,
        creatorPhoneNumber: creator.phoneNumber,
        targetUsers: allAdminIds.map((admin) => admin._id),
        metadata: {
            creatorId: creator._id,
            orderId: order._id,
        },
    });

    console.log("🚀 ~ applyForOrder ~ notificationData:", notificationData);
    await sendNotification(notificationData);

    order.appliedCreators.push(creator._id);

    await order.save();

    return res
        .status(200)
        .json(new ApiResponse(200, order, "You Have Applied Successfully"));
});

const getAllAppliedOrders = asyncHandler(async (req, res) => {
    const creatorId = req.user._id;

    console.log("Creator ID:", creatorId);
    isValidId(creatorId);

    const appliedOrders = await Orders.find({
        appliedCreators: creatorId,
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

const uploadContentToOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const creatorId = req.user._id;

    isValidId(orderId);
    isValidId(creatorId);

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const creator = await Creator.findById(creatorId);
    if (!creator) {
        throw new ApiError(404, "Creator not found");
    }

    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "No files uploaded");
    }

    const filesPath = req.files.map((file) => file.path);

    // UPLOAD TO GOOGLE DRIVE LOGIC
    try {
        // Check or create order folder
        let orderFolderId = await getFolderIdByName(orderId);
        if (!orderFolderId) {
            orderFolderId = await createFolder(orderId);
        }

        // Check or create creator folder within the order folder
        let creatorFolderId = await getFolderIdByName(creatorId, orderFolderId); // Pass the parent folder ID
        if (!creatorFolderId) {
            creatorFolderId = await createFolder(creatorId, orderFolderId);
        }

        // Upload files to the creator's folder
        const uploadedFilesToGoogleDrive = await uploadFilesToFolder(
            creatorFolderId,
            filesPath
        );

        if (
            !uploadedFilesToGoogleDrive ||
            uploadedFilesToGoogleDrive.length === 0
        ) {
            throw new ApiError(500, "Failed to upload files to Google Drive");
        }

        const fileUrlsFromGoogleDrive = uploadedFilesToGoogleDrive.map(
            (file) =>
                `https://drive.google.com/uc?id=${file.id}&export=download`
        );

        console.log(fileUrlsFromGoogleDrive);

        order.uploadFiles.push({
            uploadedBy: creatorId,
            fileUrls: fileUrlsFromGoogleDrive,
            uploadedDate: new Date(),
        });
        await order.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    order,
                },
                "Content uploaded successfully to Google Drive"
            )
        );
    } catch (error) {
        throw new ApiError(500, `Google Drive upload error: ${error.message}`);
    }
});

const completeTheOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const creatorId = req.user._id;

    isValidId(orderId);
    isValidId(creatorId);

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const creator = await Creator.findById(creatorId);
    if (!creator) {
        throw new ApiError(404, "Creator not found");
    }

    order.orderStatus = "completed";
    await order.save();

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order completed successfully"));
});

const getNotifications = asyncHandler(async (req, res) => {
    const creatorId = req.user._id;

    isValidId(creatorId);

    const notifications = await Notifications.find({ creatorId });

    return res
        .status(200)
        .json(new ApiResponse(200, notifications, "Notifications retrieved"));
});

const addOrderToFavorites = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

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

    creator.favoriteOrders.push(order._id);

    await creator.save();

    return res
        .status(200)
        .json(new ApiResponse(200, creator, "Order added to favorites"));
});

const removeOrderFromFavorites = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

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

    creator.favoriteOrders = creator.favoriteOrders.filter(
        (id) => id.toString() !== orderId.toString()
    );

    await creator.save();

    return res
        .status(200)
        .json(new ApiResponse(200, creator, "Order removed from favorites"));
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

export {
    loginCreator,
    createCreator,
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
};
