import ApiError from "./ApiError.js";

/**
 * Checks if the current user is the owner of the resource.
 *
 * @param {Object} model - The Mongoose model instance representing the resource (e.g., a blog post).
 * @param {string} ownerFieldName - The name of the field in the model that indicates ownership (e.g., "ownerId").
 * @param {string|ObjectId} userId - The ID of the current user attempting to perform the action.
 *
 */
const checkOwnership = (model, ownerFieldName, userId) => {
  if (!model || !ownerFieldName || !userId) {
    throw new ApiError(400, "Invalid Arguments");
  }

  if (
    !model[ownerFieldName] ||
    model[ownerFieldName].toString() !== userId.toString()
  ) {
    throw new ApiError(403, "You are not authorized to perform this action");
  }
};

export default checkOwnership;
