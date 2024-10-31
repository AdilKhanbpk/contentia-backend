import AdditionalServiceModel from "../../models/admin/adminAdditionalService.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "../../utils/Cloudinary.js";
import {
  createADocument,
  deleteById,
  findAll,
  findById,
  updateById,
} from "../../utils/dbHelpers.js";

const createAdditionalService = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    platform,
    aspectRatio,
    editPrice,
    sharePrice,
    coverPicPrice,
    creatorTypePrice,
    shippingPrice,
    durationTime,
    durationPrice,
  } = req.body;

  const imageUrl = req.file?.path;

  if (!imageUrl) {
    throw new ApiError(400, "Please provide an image");
  }

  const uploadedImage = await uploadImageToCloudinary(imageUrl);

  const additionalService = await createADocument(AdditionalServiceModel, {
    name,
    price,
    platform,
    aspectRatio,
    editPrice,
    sharePrice,
    coverPicPrice,
    creatorTypePrice,
    image: uploadedImage.url,
    shippingPrice,
    durationTime,
    durationPrice,
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
  const additionalServices = await findAll(AdditionalServiceModel);
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

  isValidObjectId(additionalServicesId);

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
    name,
    price,
    platform,
    aspectRatio,
    editPrice,
    sharePrice,
    coverPicPrice,
    creatorTypePrice,
    shippingPrice,
    durationTime,
    durationPrice,
  } = req.body;

  const imageUrl = req.file?.path;

  isValidObjectId(additionalServicesId);

  const additionalService = await findById(
    AdditionalServiceModel,
    additionalServicesId
  );

  const updateData = {
    name,
    price,
    platform,
    aspectRatio,
    editPrice,
    sharePrice,
    coverPicPrice,
    creatorTypePrice,
    shippingPrice,
    durationTime,
    durationPrice,
  };

  // Delete and update image if a new one is provided
  if (imageUrl) {
    if (additionalService.image) {
      await deleteImageFromCloudinary(additionalService.image);
    }

    const uploadedImage = await uploadImageToCloudinary(imageUrl);
    updateData.image = uploadedImage.url;
  }

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

  isValidObjectId(additionalServicesId);

  const additionalService = await findById(
    AdditionalServiceModel,
    additionalServicesId
  );

  if (additionalService.image) {
    await deleteImageFromCloudinary(additionalService.image);
  }

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
