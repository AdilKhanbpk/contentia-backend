import LandingPageModel from "../../models/admin/adminLandingPage.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";
import { createADocument, updateById } from "../../utils/dbHelpers.js";

const createLandingPage = asyncHandler(async (req, res) => {
  const {
    carouselHeroTitle,
    staticHeroTitle,
    heroSubTitle,
    videoOne,
    videoTwo,
    videoThree,
    videoFour,
    videoFive,
    videoSix,
    videoSeven,
    videoEight,
    videoNine,
    videoTen,
  } = req.body;

  if (!carouselHeroTitle || !staticHeroTitle || !heroSubTitle) {
    throw new ApiError(400, "Please provide all the required fields");
  }

  const newLandingPage = await createADocument(LandingPageModel, {
    carouselHeroTitle,
    staticHeroTitle,
    heroSubTitle,
    videoOne,
    videoTwo,
    videoThree,
    videoFour,
    videoFive,
    videoSix,
    videoSeven,
    videoEight,
    videoNine,
    videoTen,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, newLandingPage, "Landing page created successfully")
    );
});

const getLandingPage = asyncHandler(async (req, res) => {
  const landingPage = await LandingPageModel.findOne();

  if (!landingPage) {
    throw new ApiError(404, "Landing page not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, landingPage, "Landing page fetched successfully")
    );
});

const updateLandingPage = asyncHandler(async (req, res) => {
  const { landingPageId } = req.params;
  isValidId(landingPageId);
  const {
    carouselHeroTitle,
    staticHeroTitle,
    heroSubTitle,
    videoOne,
    videoTwo,
    videoThree,
    videoFour,
    videoFive,
    videoSix,
    videoSeven,
    videoEight,
    videoNine,
    videoTen,
  } = req.body;

  const updatedLandingPage = await updateById(LandingPageModel, landingPageId, {
    carouselHeroTitle,
    staticHeroTitle,
    heroSubTitle,
    videoOne,
    videoTwo,
    videoThree,
    videoFour,
    videoFive,
    videoSix,
    videoSeven,
    videoEight,
    videoNine,
    videoTen,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedLandingPage,
        "Landing page updated successfully"
      )
    );
});

export { createLandingPage, getLandingPage, updateLandingPage };
