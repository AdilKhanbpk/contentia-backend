import AdditionalServiceModel from "../../models/admin/adminAdditionalService.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";
import parasutApiService from "../../utils/parasutApi.service.js";

/**
 * Helper function to create individual services in Paraşüt
 */
async function syncServicesWithParasut(services, existingIds = {}) {
    const serviceDefinitions = [
        { key: 'editPrice', name: 'Video Düzenleme Hizmeti', parasutKey: 'parasut_edit_ID' },
        { key: 'sharePrice', name: 'İçerik Paylaşım Hizmeti', parasutKey: 'parasut_share_ID' },
        { key: 'coverPicPrice', name: 'Kapak Görseli', parasutKey: 'parasut_coverPic_ID' },
        { key: 'creatorTypePrice', name: 'İçerik Üreticisi Tercihi', parasutKey: 'parasut_creatorType_ID' },
        { key: 'shippingPrice', name: 'Teslimat Ücreti', parasutKey: 'parasut_shipping_ID' },
        { key: 'thirtySecondDurationPrice', name: 'Video İçerik 30 sn', parasutKey: 'parasut_thirtySecond_ID' },
        { key: 'sixtySecondDurationPrice', name: 'Video İçerik 60 sn', parasutKey: 'parasut_sixtySecond_ID' }
    ];

    const results = {};
    const errors = [];

    for (const service of serviceDefinitions) {
        if (services[service.key] !== undefined && services[service.key] !== null) {
            try {
                const serviceData = {
                    title: service.name,
                    description: `${service.name} - Ek hizmet`,
                    finalPrice: services[service.key],
                    videoCount: 0 // Additional services don't have video count
                };

                let parasutItemId;

                if (existingIds[service.parasutKey]) {
                    // Update existing service
                    await parasutApiService.updateItem(existingIds[service.parasutKey], serviceData);
                    parasutItemId = existingIds[service.parasutKey];
                } else {
                    // Create new service
                    parasutItemId = await parasutApiService.createItem(serviceData);
                }

                results[service.parasutKey] = parasutItemId;
            } catch (error) {
                console.error(`Failed to sync ${service.name} with Paraşüt:`, error.message);
                errors.push(`${service.name}: ${error.message}`);
            }
        }
    }

    return { results, errors };
}

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

    // Create the additional service in database first
    const additionalService = await AdditionalServiceModel.create({
        editPrice,
        sharePrice,
        coverPicPrice,
        creatorTypePrice,
        shippingPrice,
        thirtySecondDurationPrice,
        sixtySecondDurationPrice,
    });

    // Try to sync with Paraşüt API
    let parasutErrors = [];
    let parasutResults = {};

    try {
        const syncResult = await syncServicesWithParasut(req.body);
        parasutResults = syncResult.results;
        parasutErrors = syncResult.errors;

        // Update the additional service with Paraşüt item IDs
        if (Object.keys(parasutResults).length > 0) {
            await AdditionalServiceModel.findByIdAndUpdate(
                additionalService._id,
                parasutResults,
                { new: true }
            );

            // Update the response object
            Object.assign(additionalService, parasutResults);
        }
    } catch (error) {
        parasutErrors.push(`General sync error: ${error.message}`);
        console.error('Failed to sync additional services with Paraşüt:', error);
    }

    const responseMessage = parasutErrors.length > 0
        ? `Additional service created successfully, but some Paraşüt sync failed: ${parasutErrors.join(', ')}`
        : "Additional service created and synced with Paraşüt successfully";

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                {
                    ...additionalService.toObject(),
                    parasutSyncStatus: parasutErrors.length > 0 ? 'partial' : 'success',
                    parasutErrors: parasutErrors.length > 0 ? parasutErrors : null
                },
                responseMessage
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

    // Update the additional service in database first
    const updatedAdditionalService =
        await AdditionalServiceModel.findByIdAndUpdate(
            additionalServicesId,
            updateData,
            { new: true }
        );

    // Try to sync with Paraşüt API
    let parasutErrors = [];
    let parasutResults = {};

    try {
        // Get existing Paraşüt IDs
        const existingIds = {
            parasut_edit_ID: additionalService.parasut_edit_ID,
            parasut_share_ID: additionalService.parasut_share_ID,
            parasut_coverPic_ID: additionalService.parasut_coverPic_ID,
            parasut_creatorType_ID: additionalService.parasut_creatorType_ID,
            parasut_shipping_ID: additionalService.parasut_shipping_ID,
            parasut_thirtySecond_ID: additionalService.parasut_thirtySecond_ID,
            parasut_sixtySecond_ID: additionalService.parasut_sixtySecond_ID,
        };

        const syncResult = await syncServicesWithParasut(req.body, existingIds);
        parasutResults = syncResult.results;
        parasutErrors = syncResult.errors;

        // Update the additional service with new Paraşüt item IDs
        if (Object.keys(parasutResults).length > 0) {
            await AdditionalServiceModel.findByIdAndUpdate(
                additionalServicesId,
                parasutResults,
                { new: true }
            );

            // Update the response object
            Object.assign(updatedAdditionalService, parasutResults);
        }
    } catch (error) {
        parasutErrors.push(`General sync error: ${error.message}`);
        console.error('Failed to sync additional services with Paraşüt:', error);
    }

    const responseMessage = parasutErrors.length > 0
        ? `Additional service updated successfully, but some Paraşüt sync failed: ${parasutErrors.join(', ')}`
        : "Additional service updated and synced with Paraşüt successfully";

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    ...updatedAdditionalService.toObject(),
                    parasutSyncStatus: parasutErrors.length > 0 ? 'partial' : 'success',
                    parasutErrors: parasutErrors.length > 0 ? parasutErrors : null
                },
                responseMessage
            )
        );
});

const deleteAdditionalService = asyncHandler(async (req, res) => {
    const { additionalServicesId } = req.params;

    isValidId(additionalServicesId);

    // Get the additional service first to check for Paraşüt item IDs
    const existingService = await AdditionalServiceModel.findById(additionalServicesId);

    if (!existingService) {
        throw new ApiError(404, "Additional service not found.");
    }

    // Try to delete from Paraşüt API if it has Paraşüt item IDs
    let parasutErrors = [];

    const parasutIds = [
        existingService.parasut_edit_ID,
        existingService.parasut_share_ID,
        existingService.parasut_coverPic_ID,
        existingService.parasut_creatorType_ID,
        existingService.parasut_shipping_ID,
        existingService.parasut_thirtySecond_ID,
        existingService.parasut_sixtySecond_ID,
    ].filter(Boolean); // Remove null/undefined values

    for (const parasutId of parasutIds) {
        try {
            await parasutApiService.deleteItem(parasutId);
        } catch (error) {
            parasutErrors.push(`Failed to delete Paraşüt item ${parasutId}: ${error.message}`);
            console.error('Failed to delete from Paraşüt API:', error);
        }
    }

    // Delete from database
    const deletedAdditionalService =
        await AdditionalServiceModel.findByIdAndDelete(additionalServicesId);

    const responseMessage = parasutErrors.length > 0
        ? `Additional service deleted successfully, but some Paraşüt deletion failed: ${parasutErrors.join(', ')}`
        : "Additional service deleted successfully";

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    ...deletedAdditionalService.toObject(),
                    parasutSyncStatus: parasutErrors.length > 0 ? 'partial' : 'success',
                    parasutErrors: parasutErrors.length > 0 ? parasutErrors : null
                },
                responseMessage
            )
        );
});

/**
 * Manually sync additional services with Paraşüt API
 * Useful for syncing existing services that don't have Paraşüt item IDs
 */
const syncAdditionalServiceWithParasut = asyncHandler(async (req, res) => {
    const { additionalServicesId } = req.params;

    isValidId(additionalServicesId);

    const additionalService = await AdditionalServiceModel.findById(additionalServicesId);

    if (!additionalService) {
        throw new ApiError(404, "Additional service not found.");
    }

    try {
        // Get existing Paraşüt IDs
        const existingIds = {
            parasut_edit_ID: additionalService.parasut_edit_ID,
            parasut_share_ID: additionalService.parasut_share_ID,
            parasut_coverPic_ID: additionalService.parasut_coverPic_ID,
            parasut_creatorType_ID: additionalService.parasut_creatorType_ID,
            parasut_shipping_ID: additionalService.parasut_shipping_ID,
            parasut_thirtySecond_ID: additionalService.parasut_thirtySecond_ID,
            parasut_sixtySecond_ID: additionalService.parasut_sixtySecond_ID,
        };

        const syncResult = await syncServicesWithParasut(additionalService.toObject(), existingIds);

        // Update the additional service with new Paraşüt item IDs
        if (Object.keys(syncResult.results).length > 0) {
            await AdditionalServiceModel.findByIdAndUpdate(
                additionalServicesId,
                syncResult.results,
                { new: true }
            );
            Object.assign(additionalService, syncResult.results);
        }

        const responseMessage = syncResult.errors.length > 0
            ? `Additional service synced with some errors: ${syncResult.errors.join(', ')}`
            : "Additional service synced with Paraşüt successfully";

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        ...additionalService.toObject(),
                        parasutSyncStatus: syncResult.errors.length > 0 ? 'partial' : 'success',
                        parasutErrors: syncResult.errors.length > 0 ? syncResult.errors : null
                    },
                    responseMessage
                )
            );
    } catch (error) {
        console.error('Failed to sync with Paraşüt API:', error);
        throw new ApiError(500, `Failed to sync with Paraşüt API: ${error.message}`);
    }
});

export {
    createAdditionalService,
    getAdditionalServices,
    getAdditionalServiceById,
    updateAdditionalService,
    deleteAdditionalService,
    syncAdditionalServiceWithParasut,
};
