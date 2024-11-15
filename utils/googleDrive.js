import { google } from "googleapis";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import ApiError from "./ApiError.js";
import { resolvePath } from "./commonHelpers.js";

dotenv.config();

const SERVICE_ACCOUNT_FILE = resolvePath("../serviceAccountConfig.json");

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_FILE,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

/**
 * Get MIME type for a file based on its extension
 * @param {string} filePath - Path to the file
 * @returns {string} MIME type
 */
const getMimeType = (filePath) => {
  const extension = path.extname(filePath).toLowerCase();

  const mimeTypes = {
    ".html": "text/html",
    ".txt": "text/plain",
    ".css": "text/css",
    ".js": "text/javascript",
    ".json": "application/json",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".avi": "video/x-msvideo",
    ".mov": "video/quicktime",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".zip": "application/zip",
    ".rar": "application/x-rar-compressed",
    ".7z": "application/x-7z-compressed",
  };

  return mimeTypes[extension] || "application/octet-stream";
};

/**
 * Creates a folder in Google Drive and uploads a file to it
 * @param {string} folderName - Name of the folder to create
 * @param {string} filePath - Path to the file to upload
 * @returns {Promise<string>} The ID of the uploaded file
 * @throws {ApiError} If folder creation or file upload fails
 */
const createFolderAndFile = async (folderName, filePath) => {
  if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
    throw new ApiError(500, "Google Drive Root folder ID not configured.");
  }

  const folderMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
    parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
  };

  try {
    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: "id",
    });

    if (!folder.data.id) {
      throw new ApiError(500, "Folder creation failed: No folder ID returned.");
    }

    const fileMetadata = {
      name: path.basename(filePath),
      parents: [folder.data.id],
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: {
        mimeType: getMimeType(filePath),
        body: fs.createReadStream(filePath),
      },
      fields: "id, mimeType",
    });

    if (!file.data.id) {
      throw new ApiError(500, "File upload failed: No file ID returned.");
    }

    return file.data.id;
  } catch (error) {
    throw new ApiError(
      500,
      `Folder creation or file upload error: ${error.message}`
    );
  }
};

/**
 * Create a folder in Google Drive.
 * @param {string} folderName - The name of the folder to create.
 * @param {string} [parentFolderId] - Optional ID of the parent folder.
 * @returns {Promise<string>} - The ID of the created folder.
 * @throws {Error} If folder creation fails.
 */
const createFolder = async (
  folderName,
  parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID
) => {
  try {
    const fileMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentFolderId ? [parentFolderId] : [],
    };

    const folder = await drive.files.create({
      resource: fileMetadata,
      fields: "id",
    });

    if (folder.status !== 200) {
      throw new Error(`Failed to create folder: ${folder.statusText}`);
    }

    return folder.data.id;
  } catch (error) {
    console.error(`Error creating folder: ${error.message}`);
    throw new Error(`Unable to create folder: ${error.message}`);
  }
};

/**
 * Uploads multiple files to a specified Google Drive folder
 * @param {string} folderId - ID of the target folder
 * @param {string[]} filePaths - Array of file paths to upload
 * @returns {Promise<Array>} Array of uploaded file metadata
 * @throws {ApiError} If file upload fails
 */
const uploadFilesToFolder = async (folderId, filePaths) => {
  try {
    const uploadPromises = filePaths.map(async (filePath) => {
      const fileMetadata = {
        name: path.basename(filePath),
        parents: [folderId],
      };

      const file = await drive.files.create({
        resource: fileMetadata,
        media: {
          mimeType: getMimeType(filePath),
          body: fs.createReadStream(filePath),
        },
        fields: "id, name, mimeType",
      });

      return file.data;
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new ApiError(500, `File upload error: ${error.message}`);
  }
};

/**
 * Finds a folder ID by its name within the configured parent folder
 * @param {string} folderName - Name of the folder to find
 * @returns {Promise<string|null>} Folder ID if found, null otherwise
 * @throws {ApiError} If the search operation fails
 */
const getFolderIdByName = async (folderName) => {
  if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
    throw new ApiError(500, "Google Drive Root folder ID not configured.");
  }

  try {
    const response = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents`,
      fields: "files(id, name)",
      spaces: "drive",
    });

    return response.data.files[0]?.id || null;
  } catch (error) {
    throw new ApiError(500, `Folder search error: ${error.message}`);
  }
};

/**
 * Deletes a folder and all its contents from Google Drive
 * @param {string} folderId - ID of the folder to delete
 * @throws {ApiError} If deletion fails
 */
const deleteFolder = async (folderId) => {
  try {
    const files = await listAllFilesInFolder(folderId);
    const deletePromises = files.map((file) =>
      drive.files.delete({ fileId: file.id })
    );
    await Promise.all(deletePromises);

    await drive.files.delete({ fileId: folderId });
  } catch (error) {
    throw new ApiError(500, `Folder deletion error: ${error.message}`);
  }
};

/**
 * Retrieves download URLs for all files in a folder
 * @param {string} folderId - ID of the folder
 * @returns {Promise<Array>} Array of objects containing file information and download URLs
 * @throws {ApiError} If retrieving URLs fails
 */
const getFileUrlsFromFolder = async (folderId) => {
  try {
    const files = await listAllFilesInFolder(folderId);
    return files.map((file) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      url: `https://drive.google.com/uc?id=${file.id}&export=download`,
      size: file.size,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
    }));
  } catch (error) {
    throw new ApiError(500, `File URL retrieval error: ${error.message}`);
  }
};

/**
 * Lists all files in a specified Google Drive folder
 * @param {string} folderId - ID of the folder
 * @returns {Promise<Array>} Array of file metadata
 * @throws {ApiError} If retrieval fails
 */
const listAllFilesInFolder = async (folderId) => {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, size, createdTime, modifiedTime)",
      spaces: "drive",
    });

    return response.data.files;
  } catch (error) {
    throw new ApiError(500, `File retrieval error: ${error.message}`);
  }
};

/**
 * Lists all folders within the configured parent folder
 * @returns {Promise<Array>} Array of folder metadata
 * @throws {ApiError} If retrieval fails
 */
const listAllFolders = async () => {
  try {
    const response = await drive.files.list({
      q: `mimeType = 'application/vnd.google-apps.folder' and '${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents`,
      fields: "files(id,name,mimeType,createdTime,modifiedTime)",
      spaces: "drive",
    });

    return response.data.files;
  } catch (error) {
    throw new ApiError(500, `Folder listing error: ${error.message}`);
  }
};

const listSpecificFolderInParentFolder = async (
  parentFolderId,
  specificFolderId
) => {
  try {
    const response = await drive.files.list({
      q: `'${parentFolderId}' in parents and '${specificFolderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, size, createdTime, modifiedTime)",
      spaces: "drive",
    });

    return response.data.files;
  } catch (error) {
    throw new ApiError(500, `File retrieval error: ${error.message}`);
  }
};

export {
  createFolderAndFile,
  createFolder,
  uploadFilesToFolder,
  getFolderIdByName,
  deleteFolder,
  getFileUrlsFromFolder,
  listAllFilesInFolder,
  listAllFolders,
  listSpecificFolderInParentFolder,
};
