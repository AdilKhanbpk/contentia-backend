// src/utils/cloudinary.js

import { v2 as cloudinary } from "cloudinary";
import { extractPublicId } from "cloudinary-build-url";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_SECRET_KEY } =
  process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_SECRET_KEY) {
  console.error("Missing Cloudinary configuration in environment variables.");
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_SECRET_KEY,
});

/**
 * Helper function to delete local files after Cloudinary upload.
 * @param {string} filePath - The local path of the file to delete.
 */
const deleteLocalFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

/**
 * Uploads a single image to Cloudinary.
 */
const uploadImageToCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    const uploadedFile = await cloudinary.uploader.upload(filePath, {
      folder: "contentia",
      resource_type: "auto",
    });
    deleteLocalFile(filePath);

    return uploadedFile;
  } catch (error) {
    console.error(`Cloudinary File Upload Error ==> ${error.message}`);
    deleteLocalFile(filePath);
    return null;
  }
};

/**
 * Deletes a single image from Cloudinary.
 */
const deleteImageFromCloudinary = async (fileUrl, resourceType = "image") => {
  const filePath = extractPublicId(fileUrl);

  try {
    const deletedFile = await cloudinary.uploader.destroy(filePath, {
      resource_type: resourceType,
    });

    return deletedFile;
  } catch (error) {
    console.error(`Cloudinary File Delete Error ==> ${error.message}`);
    return null;
  }
};

/**
 * Uploads multiple images to Cloudinary.
 */
const uploadMultipleImagesToCloudinary = async (filePaths) => {
  try {
    if (!filePaths || filePaths.length === 0) return null;

    const uploadPromises = filePaths.map(async (filePath) => {
      try {
        const uploadedFile = await cloudinary.uploader.upload(filePath, {
          folder: "contentia",
          resource_type: "auto",
        });
        deleteLocalFile(filePath);
        return uploadedFile;
      } catch (error) {
        console.error(`Error uploading ${filePath}: ${error.message}`);
        deleteLocalFile(filePath);
        return null;
      }
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error(`Cloudinary Bulk Upload Error ==> ${error.message}`);
    return null;
  }
};

/**
 * Deletes multiple images from Cloudinary.
 */
const deleteImagesFromCloudinary = async (fileUrls, resourceType = "image") => {
  try {
    if (!Array.isArray(fileUrls) || fileUrls.length === 0) return null;

    const deletePromises = fileUrls.map(async (fileUrl) => {
      const filePath = extractPublicId(fileUrl);
      try {
        const deletedFile = await cloudinary.uploader.destroy(filePath, {
          resource_type: resourceType,
        });
        console.log(
          deletedFile.result === "ok"
            ? `File ${filePath} deleted successfully.`
            : `Failed to delete file ${filePath}.`
        );
        return deletedFile;
      } catch (error) {
        console.error(`Error deleting ${filePath}: ${error.message}`);
        return null;
      }
    });

    return await Promise.all(deletePromises);
  } catch (error) {
    console.error(`Cloudinary Bulk Deletion Error ==> ${error.message}`);
    return null;
  }
};

export {
  uploadImageToCloudinary,
  uploadMultipleImagesToCloudinary,
  deleteImageFromCloudinary,
  deleteImagesFromCloudinary,
};
