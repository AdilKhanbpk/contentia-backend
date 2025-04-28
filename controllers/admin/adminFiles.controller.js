import Order from "../../models/orders.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";
import { getCreatorFolderUrl } from "../../utils/googleDrive.js";

const getCreatorsFiles = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate({
            path: "assignedCreators",
            select: "_id fullName email profilePic",
        })
        .select("_id assignedCreators");

    const googleDriveCreatorFiles = await Promise.all(
        orders.map(async (order) => {
            const creators = await Promise.all(
                order.assignedCreators.map(async (creator) => {
                    const googleDriveUrl = await getCreatorFolderUrl(order._id.toString(), creator._id.toString());

                    return {
                        creatorId: creator._id,
                        fullName: creator.fullName,
                        email: creator.email,
                        profilePic: creator.profilePic,
                        orderId: order._id,
                        googleDriveUrl,
                    };
                })
            );
            return creators;
        })
    );

    // Flatten the nested arrays
    const flattened = googleDriveCreatorFiles.flat();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                flattened,
                "Creators files retrieved successfully"
            )
        );
});

const getSingleOrderFiles = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    isValidId(orderId);

    const order = await Order.findById(orderId)
        .populate({
            path: "assignedCreators",
            select: "_id fullName email profilePic",
        })
        .select("_id assignedCreators");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }
    const creators = await Promise.all(
        order.assignedCreators.map(async (creator) => {
            const googleDriveUrl = await getCreatorFolderUrl(order._id.toString(), creator._id.toString());
            return {
                creatorId: creator._id,
                fullName: creator.fullName,
                email: creator.email,
                profilePic: creator.profilePic,
                orderId: order._id,
                googleDriveUrl,
            };
        })
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                creators,
                "Single Order Creators files retrieved successfully"
            )
        );
});



export { getCreatorsFiles, getSingleOrderFiles };