import AdditionalServiceModel from "../../models/admin/adminAdditionalService.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";
import {
  createADocument,
  deleteById,
  findById,
  updateById,
} from "../../utils/dbHelpers.js";

const createAdditionalService = asyncHandler(async (req, res) => {
  const {
    platform,
    aspectRatio,
    editPrice,
    sharePrice,
    coverPicPrice,
    creatorTypePrice,
    shippingPrice,
    thirtySecondDurationPrice,
    sixtySecondDurationPrice,
  } = req.body;

  const additionalService = await createADocument(AdditionalServiceModel, {
    platform,
    aspectRatio,
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

  const additionalService = await findById(
    AdditionalServiceModel,
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
    platform,
    aspectRatio,
    editPrice,
    sharePrice,
    coverPicPrice,
    creatorTypePrice,
    shippingPrice,
    thirtySecondDurationPrice,
    sixtySecondDurationPrice,
  } = req.body;

  isValidId(additionalServicesId);

  const additionalService = await findById(
    AdditionalServiceModel,
    additionalServicesId
  );

  const updateData = {
    platform,
    aspectRatio,
    editPrice,
    sharePrice,
    coverPicPrice,
    creatorTypePrice,
    shippingPrice,
    thirtySecondDurationPrice,
    sixtySecondDurationPrice,
  };

  const updatedAdditionalService = await updateById(
    AdditionalServiceModel,
    additionalServicesId,
    updateData
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

  const deletedAdditionalService = await deleteById(
    AdditionalServiceModel,
    additionalServicesId
  );

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
