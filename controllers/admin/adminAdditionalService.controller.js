import AdditionalServiceModel from "../../models/admin/adminAdditionalService.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";

const createAdditionalService = asyncHandler(async (req, res) => {
    const {
        editPrice,
        sharePrice,
        coverPicPrice,
        creatorTypePrice,
        shippingPrice,
        thirtySecondDurationPrice,
        sixtySecondDurationPrice,
    } = req.body;

    const additionalService = await AdditionalServiceModel.create({
        editPrice,
        sharePrice,
        coverPicPrice,
        creatorTypePrice,
        shippingPrice,
        thirtySecondDurationPrice,
        sixtySecondDurationPrice,
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                additionalService,
                "Additional service created successfully"
            )
        );
});

const getAdditionalServices = asyncHandler(async (req, res) => {
    const additionalServices = await AdditionalServiceModel.findOne({});

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                additionalServices,
                "Additional services retrieved successfully"
            )
        );
});

const getAdditionalServiceById = asyncHandler(async (req, res) => {
    const { additionalServicesId } = req.params;

    isValidId(additionalServicesId);

    const additionalService = await AdditionalServiceModel.findById(
        additionalServicesId
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                additionalService,
                "Additional service retrieved successfully"
            )
        );
});

const updateAdditionalService = asyncHandler(async (req, res) => {
    const { additionalServicesId } = req.params;
    const {
        editPrice,
        sharePrice,
        coverPicPrice,
        creatorTypePrice,
        shippingPrice,
        thirtySecondDurationPrice,
        sixtySecondDurationPrice,
    } = req.body;

    isValidId(additionalServicesId);

    const additionalService = await AdditionalServiceModel.findById(
        additionalServicesId
    );

    if (!additionalService) {
        throw new ApiError(404, "Additional service not found");
    }

    const updateData = {
        editPrice,
        sharePrice,
        coverPicPrice,
        creatorTypePrice,
        shippingPrice,
        thirtySecondDurationPrice,
        sixtySecondDurationPrice,
    };

    const updatedAdditionalService =
        await AdditionalServiceModel.findByIdAndUpdate(
            additionalServicesId,
            updateData,
            { new: true }
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedAdditionalService,
                "Additional service updated successfully"
            )
        );
});

const deleteAdditionalService = asyncHandler(async (req, res) => {
    const { additionalServicesId } = req.params;

    isValidId(additionalServicesId);

    const deletedAdditionalService =
        await AdditionalServiceModel.findByIdAndDelete(additionalServicesId);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedAdditionalService,
                "Additional service deleted successfully"
            )
        );
});

export {
    createAdditionalService,
    getAdditionalServices,
    getAdditionalServiceById,
    updateAdditionalService,
    deleteAdditionalService,
};
