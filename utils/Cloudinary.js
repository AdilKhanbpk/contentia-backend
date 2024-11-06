// src/utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { extractPublicId } from "cloudinary-build-url";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

/**
 * Uploads a single image to Cloudinary.
 * @param {string} filePath - The local path of the image file to upload.
 * @returns {Promise<Object|null>} - Returns the uploaded file details from Cloudinary, or null if failed.
 */
const uploadImageToCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    const uploadedFile = await cloudinary.uploader.upload(filePath, {
      folder: "contentia",
      resource_type: "auto",
    });

    fs.unlinkSync(filePath); // Delete the local file after upload

    return uploadedFile;
  } catch (error) {
    console.error(`Cloudinary File Uploading Error ==> ${error.message}`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return null;
  }
};

/**
 * Deletes a single image from Cloudinary.
 * @param {string} fileUrl - The URL of the file to delete.
 * @returns {Promise<Object|null>} - Returns the result of the deletion, or null if failed.
 */
const deleteImageFromCloudinary = async (fileUrl, resourceType = "image") => {
  const filePath = extractPublicId(fileUrl);

  try {
    const deletedFile = await cloudinary.uploader.destroy(filePath, {
      resource_type: resourceType,
    });

    return deletedFile;
  } catch (error) {
    console.log(`Cloudinary File Deleting Error ==> ${error.message}`);
    return null;
  }
};

/**
 * Uploads multiple images to Cloudinary.
 * @param {string[]} filePaths - An array of local image file paths to upload.
 * @returns {Promise<Object[]|null>} - Returns an array of uploaded file details from Cloudinary, or null if failed.
 */
const uploadMultipleImagesToCloudinary = async (filePaths) => {
  try {
    if (!filePaths || filePaths.length === 0) return null;

    const uploadedFiles = await Promise.all(
      filePaths.map(async (filePath) => {
        const uploadedFile = await cloudinary.uploader.upload(filePath, {
          folder: "contentia",
          resource_type: "auto",
        });
        fs.unlinkSync(filePath); // Delete each file after upload

        return uploadedFile;
      })
    );

    return uploadedFiles;
  } catch (error) {
    console.log(`Cloudinary File Uploading Error ==> ${error.message}`);
    return null;
  }
};

/**
 * Deletes multiple images from Cloudinary.
 * @param {string[]} fileUrls - An array of file URLs to delete.
 * @param {string} [resourceType='image'] - The resource type (e.g., image, video).
 * @returns {Promise<Object[]|null>} - Returns an array of deletion results, or null if failed.
 */
const deleteImagesFromCloudinary = async (fileUrls, resourceType = "image") => {
  try {
    if (!Array.isArray(fileUrls) || fileUrls.length === 0) return null;

    const deletedFiles = await Promise.all(
      fileUrls.map(async (fileUrl) => {
        const filePath = extractPublicId(fileUrl);
        const deletedFile = await cloudinary.uploader.destroy(filePath, {
          resource_type: resourceType,
        });
        return deletedFile;
      })
    );

    // Log the result of deletion for each file
    deletedFiles.forEach((deletedFile, index) => {
      if (deletedFile.result === "ok") {
        console.log(`File ${index + 1} deleted successfully.`);
      } else {
        console.log(
          `Failed to delete file ${index + 1}. Error: ${
            deletedFile.error.message
          }`
        );
      }
    });

    return deletedFiles;
  } catch (error) {
    console.log(`Cloudinary File Deleting Error ==> ${error.message}`);
    return null;
  }
};

export {
  uploadImageToCloudinary,
  uploadMultipleImagesToCloudinary,
  deleteImageFromCloudinary,
  deleteImagesFromCloudinary,
};
