// dbHelpers.js

import ApiError from "./ApiError.js";

/**
 * Finds a document by its ID.
 *
 * @param {Object} model - The Mongoose model to query (e.g., User, Post).
 * @param {String} id - The ID of the document to find.
 * @returns {Object} - The found document, or throws an error if not found.
 * @throws {ApiError} - Throws a 404 error if document not found, or 500 error for any server issue.
 */
const findById = async (model, id) => {
  try {
    const document = await model.findById(id);
    if (!document) {
      throw new ApiError(404, "Document not found");
    }
    return document;
  } catch (error) {
    throw new ApiError(500, `Error finding document: ${error.message}`);
  }
};

/**
 * create a document.
 *
 * @param {Object} model - The Mongoose model to query (e.g., User, Post).
 * @param {Object} data - The data to create the document with.
 * @returns {Object} - The created document.
 * @throws {ApiError} - Throws a 500 error for any server issue.
 * */
const createADocument = async (model, data) => {
  try {
    const document = await model.create(data);
    if (!document) {
      throw new ApiError(500, "Failed to create document");
    }
    return document;
  } catch (error) {
    throw new ApiError(500, `Error creating document: ${error.message}`);
  }
};

/**
 * Finds all documents of a model.
 *
 * @param {Object} model - The Mongoose model to query (e.g., User, Post).
 * @returns {Array} - An array of all documents in the collection.
 * @throws {ApiError} - Throws a 500 error for any server issue.
 */
const findAll = async (model) => {
  try {
    const documents = await model.find();

    if (!documents || documents.length === 0) {
      throw new ApiError(404, "No documents found");
    }

    return documents;
  } catch (error) {
    throw new ApiError(500, `Error finding documents: ${error.message}`);
  }
};

/**
 * Finds a single document based on a query.
 *
 * @param {Object} model - The Mongoose model to query (e.g., User, Post).
 * @param {Object} query - The MongoDB query object (e.g., {name: "John"}).
 * @returns {Object} - The found document, or throws an error if not found.
 * @throws {ApiError} - Throws a 404 error if document not found, or 500 error for any server issue.
 */
const findOne = async (model, query) => {
  try {
    const document = await model.findOne(query);
    if (!document) {
      throw new ApiError(404, "Document not found");
    }
    return document;
  } catch (error) {
    throw new ApiError(500, `Error finding document: ${error.message}`);
  }
};

/**
 * Finds documents based on a query.
 *
 * @param {Object} model - The Mongoose model to query (e.g., User, Post).
 * @param {Object} query - The MongoDB query object (e.g., {name: "John"}).
 * @returns {Array} - An array of documents that match the query.
 * @throws {ApiError} - Throws a 500 error for any server issue.
 */
const findByQuery = async (model, query) => {
  try {
    const documents = await model.find(query);
    if (!documents || documents.length === 0) {
      throw new ApiError(404, "No documents found");
    }
    return documents;
  } catch (error) {
    throw new ApiError(500, `Error finding documents: ${error.message}`);
  }
};

/**
 * Deletes a document by its ID.
 *
 * @param {Object} model - The Mongoose model to query (e.g., User, Post).
 * @param {String} id - The ID of the document to delete.
 * @returns {Object} - The deleted document, or throws an error if not found.
 * @throws {ApiError} - Throws a 404 error if document not found, or 500 error for any server issue.
 */
const deleteById = async (model, id) => {
  try {
    const deletedDocument = await model.findByIdAndDelete(id);
    if (!deletedDocument) {
      throw new ApiError(404, "Document not found");
    }
    return deletedDocument;
  } catch (error) {
    throw new ApiError(500, `Error deleting document: ${error.message}`);
  }
};

/**
 * Updates a document by its ID.
 *
 * @param {Object} model - The Mongoose model to query (e.g., User, Post).
 * @param {String} id - The ID of the document to update.
 * @param {Object} updateData - The data to update the document with.
 * @returns {Object} - The updated document, or throws an error if not found.
 * @throws {ApiError} - Throws a 404 error if document not found, or 500 error for any server issue.
 */
const updateById = async (model, id, updateData) => {
  try {
    const updatedDocument = await model.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedDocument) {
      throw new ApiError(404, "Document not found");
    }
    return updatedDocument;
  } catch (error) {
    throw new ApiError(500, `Error updating document: ${error.message}`);
  }
};

export {
  findById,
  createADocument,
  findAll,
  findOne,
  findByQuery,
  deleteById,
  updateById,
};
