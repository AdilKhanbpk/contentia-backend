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

    // Make videos optional
    const videoPaths = [];
    const videoUrls = [];

    // Check if any videos were uploaded
    const hasVideos = Object.keys(req.files || {}).some(key => key.startsWith('video'));

    if (hasVideos) {
        // Process only the videos that were actually uploaded
        for (let i = 1; i <= 10; i++) {
            const videoPath = req.files?.[`video${i}`]?.[0]?.path;
            if (videoPath) {
                videoPaths.push(videoPath);
            }
        }

        // Only upload videos if there are any
        if (videoPaths.length > 0) {
            try {
                const uploadedVideos = await uploadMultipleFilesToCloudinary(videoPaths, {
                    resource_type: "video",
                    folder: "videos",
                });

                // Map uploaded videos to their URLs
                uploadedVideos.forEach((video, index) => {
                    if (video?.secure_url) {
                        // Find the original position of this video
                        const videoNumber = parseInt(Object.keys(req.files)
                            .find(key => key.startsWith('video') && req.files[key][0]?.path === videoPaths[index])
                            ?.replace('video', '')) - 1;

                        // If we can determine the position, place it there
                        if (!isNaN(videoNumber) && videoNumber >= 0 && videoNumber < 10) {
                            videoUrls[videoNumber] = video.secure_url;
                        } else {
                            // Otherwise just append it
                            videoUrls.push(video.secure_url);
                        }
                    }
                });
            } catch (error) {
                console.error("Error uploading videos:", error);
                // Continue without videos if upload fails
            }
        }
    }

    // Fill in empty slots with null or empty string
    const finalVideoUrls = Array(10).fill(null);
    videoUrls.forEach((url, index) => {
        if (url) finalVideoUrls[index] = url;
    });

    const newLandingPage = await LandingPageModel.create({
        carouselHeroTitle,
        staticHeroTitle,
        heroSubTitle,
        videos: finalVideoUrls,
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
        // Return an empty object with a message instead of throwing an error
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        _id: "",
                        carouselHeroTitle: "",
                        staticHeroTitle: "",
                        heroSubTitle: "",
                        videos: Array(10).fill(null)
                    },
                    "No landing page found. Please create one."
                )
            );
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

    // Validate the ID if it's provided
    if (landingPageId && landingPageId !== 'undefined' && landingPageId !== 'null') {
        isValidId(landingPageId);
    } else {
        // If no valid ID is provided, create a new landing page instead
        console.log("No valid landing page ID provided. Creating a new landing page instead.");
        return await createLandingPage(req, res);
    }

    const landingPage = await LandingPageModel.findById(landingPageId);

    if (!landingPage) {
        console.log(`Landing page with ID ${landingPageId} not found. Creating a new one instead.`);
        return await createLandingPage(req, res);
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
