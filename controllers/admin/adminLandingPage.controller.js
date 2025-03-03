import LandingPageModel from "../../models/admin/adminLandingPage.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
    deleteFileFromCloudinary,
    deleteMultipleFilesFromCloudinary,
    uploadMultipleFilesToCloudinary,
} from "../../utils/Cloudinary.js";
import { isValidId } from "../../utils/commonHelpers.js";

const createLandingPage = asyncHandler(async (req, res) => {
    const { carouselHeroTitle, staticHeroTitle, heroSubTitle } = req.body;

    if (!carouselHeroTitle || !staticHeroTitle || !heroSubTitle) {
        throw new ApiError(400, "Please provide all the required fields");
    }

    const videoPaths = [];
    for (let i = 1; i <= 10; i++) {
        const videoPath = req.files?.[`video${i}`]?.[0]?.path;
        if (!videoPath) {
            throw new ApiError(400, `Video ${i} is required`);
        }
        videoPaths.push(videoPath);
    }

    // console.log(videoPaths);

    const uploadedVideos = await uploadMultipleFilesToCloudinary(videoPaths, {
        resource_type: "video",
        folder: "videos",
    });

    if (!uploadedVideos || uploadedVideos.length !== 10) {
        throw new ApiError(400, "Video upload failed, please try again");
    }

    const videoUrls = uploadedVideos.map((video) => video?.secure_url);

    const newLandingPage = await LandingPageModel.create({
        carouselHeroTitle,
        staticHeroTitle,
        heroSubTitle,
        videos: videoUrls,
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                newLandingPage,
                "Landing page created successfully"
            )
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
            new ApiResponse(
                200,
                landingPage,
                "Landing page fetched successfully"
            )
        );
});

const updateLandingPage = asyncHandler(async (req, res) => {
    const { landingPageId } = req.params;
    const { carouselHeroTitle, staticHeroTitle, heroSubTitle } = req.body;

    isValidId(landingPageId);

    const landingPage = await LandingPageModel.findById(landingPageId);

    if (!landingPage) {
        throw new ApiError(404, "Landing page not found");
    }

    const updatedVideos = landingPage.videos || [];

    for (let i = 1; i <= 10; i++) {
        const videoField = `video${i}`;

        if (req.files?.[videoField]) {
            const newVideoPath = req.files[videoField]?.[0]?.path;

            if (updatedVideos[i - 1]) {
                await deleteFileFromCloudinary(updatedVideos[i - 1], "video");
            }

            const uploadedVideo = await uploadMultipleFilesToCloudinary([newVideoPath], {
                resource_type: "video",
                folder: "videos",
            });

            updatedVideos[i - 1] = uploadedVideo[0]?.secure_url;
        }
    }


    const updatedLandingPage = await LandingPageModel.findByIdAndUpdate(
        landingPageId,
        {
            carouselHeroTitle,
            staticHeroTitle,
            heroSubTitle,
            videos: updatedVideos,
        },
        { new: true }
    );

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
