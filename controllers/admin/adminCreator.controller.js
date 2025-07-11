import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import Creator from "../../models/creator.model.js";
import { isValidId } from "../../utils/commonHelpers.js";
import { notificationTemplates } from "../../helpers/notificationTemplates.js";
import { sendNotification } from "./adminNotification.controller.js";

// FOR CREATORS

const createCreator = asyncHandler(async (req, res) => {
    const {
        fullName,
        tckn,
        password,
        email,
        dateOfBirth,
        gender,
        phoneNumber,
        isVerified,
        ...rest
    } = req.body;

    if (
        !isVerified ||
        !fullName ||
        !password ||
        !tckn ||
        !dateOfBirth ||
        !phoneNumber ||
        !email
    ) {
        throw new ApiError(400, "Please fill all the required fields");
    }

    const checkEmail = await Creator.findOne({ email });

    if (checkEmail) {
        throw new ApiError(400, "Email address is already in use.");
    }

    const newUser = await Creator.create({
        fullName,
        tckn,
        password,
        email: email.trim().toLowerCase(),
        dateOfBirth,
        gender,
        phoneNumber,
        isVerified,
        ...rest,
        userAgreement: true,
        approvedCommercial: true,
    });

    const notificationData = notificationTemplates.creatorRegistrationByAdmin({
        creatorName: newUser.fullName,
        creatorEmail: newUser.email,
        creatorPhoneNumber: newUser.phoneNumber,
        targetUsers: [newUser._id],
        metadata: {
            user: newUser,
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
    const { creatorId } = req.params;
    const updateData = req.body;

    const setFields = {};
    for (const [key, value] of Object.entries(updateData)) {
        if (typeof value === "object" && !Array.isArray(value)) {
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

const deleteCreator = asyncHandler(async (req, res) => {
    const { creatorId } = req.params;

    isValidId(creatorId);

    const creator = await Creator.findByIdAndDelete(creatorId);

    return res
        .status(200)
        .json(new ApiResponse(200, creator, "Creator deleted successfully"));
});

const getSingleCreator = asyncHandler(async (req, res) => {
    const { creatorId } = req.params;

    isValidId(creatorId);

    const creator = await findById(Creator, creatorId);

    return res
        .status(200)
        .json(new ApiResponse(200, creator, "Creator retrieved"));
});

const getAllCreators = asyncHandler(async (req, res) => {
    const creators = await Creator.find({});
    return res
        .status(200)
        .json(new ApiResponse(200, creators, "Creators retrieved"));
});

export {
    createCreator,
    getSingleCreator,
    updateCreator,
    deleteCreator,
    getAllCreators,
};
