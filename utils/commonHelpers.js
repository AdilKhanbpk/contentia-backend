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

/**
 * Check an Id is valid MongoDb Id
 * @param {string} id - The ID to validate.
 * @returns {boolean} - Returns true if the ID is valid, otherwise false.
 */
/**
 * Check if an ID is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate.
 * @throws {ApiError} - Throws an ApiError with a 400 status code if the ID is invalid.
 * @returns {boolean} - Returns true if the ID is valid.
 */
const isValidId = (id) => {
  if (!id) {
    throw new ApiError(400, "ID is missing");
  }

  if (typeof id !== "string") {
    throw new ApiError(400, "ID must be a string");
  }

  if (id.length !== 24) {
    throw new ApiError(400, "ID must be 24 characters long");
  }

  if (!/^[0-9a-fA-F]+$/.test(id)) {
    throw new ApiError(400, "ID must be a valid hexadecimal string");
  }

  return true;
};

export { checkOwnership, isValidId };
