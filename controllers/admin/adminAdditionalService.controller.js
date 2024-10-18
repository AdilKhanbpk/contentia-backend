const AdditionalServiceModel = require("../../models/admin/adminAdditionalService.model");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const createAdditionalService = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    image,
    platform,
    aspectRatio,
    editPrice,
    sharePrice,
    coverPicPrice,
    creatorType,
    shippingPrice,
    durationTime,
    durationPrice,
  } = req.body;

  const additionalService = await AdditionalServiceModel.create({
    name,
    price,
    image,
    platform,
    aspectRatio,
    editPrice,
    sharePrice,
    coverPicPrice,
    creatorType,
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
  const additionalServices = await AdditionalServiceModel.find();
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
  const { id } = req.params;
  const additionalService = await AdditionalServiceModel.findById(id);

  if (!additionalService) {
    throw new ApiError(404, "Additional service not found");
  }

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
  const { id } = req.params;
  const {
    name,
    price,
    image,
    platform,
    aspectRatio,
    editPrice,
    sharePrice,
    coverPicPrice,
    creatorType,
    shippingPrice,
    durationTime,
    durationPrice,
  } = req.body;
  const additionalService = await AdditionalServiceModel.findById(id);

  if (!additionalService) {
    throw new ApiError(404, "Additional service not found");
  }

  additionalService.name = name || additionalService.name;
  additionalService.price = price || additionalService.price;
  additionalService.image = image || additionalService.image;
  additionalService.platform = platform || additionalService.platform;
  additionalService.aspectRatio = aspectRatio || additionalService.aspectRatio;
  additionalService.editPrice = editPrice || additionalService.editPrice;
  additionalService.sharePrice = sharePrice || additionalService.sharePrice;
  additionalService.coverPicPrice =
    coverPicPrice || additionalService.coverPicPrice;
  additionalService.creatorType = creatorType || additionalService.creatorType;
  additionalService.shippingPrice =
    shippingPrice || additionalService.shippingPrice;
  additionalService.durationTime =
    durationTime || additionalService.durationTime;
  additionalService.durationPrice =
    durationPrice || additionalService.durationPrice;

  await additionalService.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        additionalService,
        "Additional service updated successfully"
      )
    );
});

const deleteAdditionalService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const additionalService = await AdditionalServiceModel.findById(id);

  if (!additionalService) {
    throw new ApiError(404, "Additional service not found");
  }

  await additionalService.remove();

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Additional service deleted successfully")
    );
});

module.exports = {
  createAdditionalService,
  getAdditionalServices,
  getAdditionalServiceById,
  updateAdditionalService,
  deleteAdditionalService,
};
