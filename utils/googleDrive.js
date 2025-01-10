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
 * Returns the mime type for the given file path based on its extension.
 *
 * @param {string} filePath - The path of the file to get the mime type for.
 * @returns {string} The mime type for the given file path.
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
 * Retrieves all files in the given folder, excluding trashed files.
 *
 * @param {string} folderId - The ID of the folder to retrieve files from.
 * @returns {Promise<File[]>} A promise that resolves with an array of file objects.
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
 * Retrieves all folders in the given folder, excluding trashed folders.
 *
 * @param {string} [folderId] - The ID of the folder to retrieve folders from.
 *                              If not provided, it defaults to the value set
 *                              in the GOOGLE_DRIVE_FOLDER_ID environment variable.
 * @returns {Promise<File[]>} A promise that resolves with an array of folder objects.
 */
const listAllFoldersInFolder = async (
    folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
) => {
    try {
        const response = await drive.files.list({
            q: `mimeType = 'application/vnd.google-apps.folder' and '${folderId}' in parents`,
            fields: "files(id,name,mimeType,createdTime,modifiedTime)",
            spaces: "drive",
        });

        return response.data.files;
    } catch (error) {
        throw new ApiError(500, `Folder listing error: ${error.message}`);
    }
};

/**
 * Retrieves a specific folder from the given parent folder, excluding trashed folders.
 *
 * @param {string} parentFolderId - The ID of the parent folder to retrieve the specific folder from.
 * @param {string} specificFolderId - The ID of the specific folder to retrieve.
 * @returns {Promise<File>} A promise that resolves with the specific folder object. If the folder is not found, it throws an ApiError with a 404 status.
 */
const listSpecificFolderInParentFolder = async (
    /*************  ✨ Codeium Command ⭐  *************/
    /**
     * Retrieves a specific folder from the given parent folder, excluding trashed folders.
     *
     * @param {string} parentFolderId - The ID of the parent folder to retrieve the specific folder from.
     * @param {string} specificFolderId - The ID of the specific folder to retrieve.
     * @returns {Promise<File>} A promise that resolves with the specific folder object. If the folder is not found, it throws an ApiError with a 404 status.
     */
    /******  569eba65-9cb6-4e8f-a480-8a29ebb944ca  *******/ parentFolderId,
    specificFolderId
) => {
    try {
        const response = await drive.files.list({
            q: `'${parentFolderId}' in parents and trashed = false`,
            fields: "files(id, name, mimeType, size, createdTime, modifiedTime)",
            spaces: "drive",
        });

        const files = response.data.files;

        const specificFolder = files.find(
            (file) => file.id === specificFolderId
        );

        if (!specificFolder) {
            throw new ApiError(
                404,
                "Specific folder not found in parent folder"
            );
        }

        return specificFolder;
    } catch (error) {
        console.error("Google Drive API error:", error);
        throw new ApiError(500, `File retrieval error: ${error.message}`);
    }
};

/**
 * Creates a folder in Google Drive.
 *
 * @param {string} folderName - The name of the folder to create.
 * @param {string} [parentFolderId] - The ID of the parent folder to create the folder in. Defaults to the environment variable GOOGLE_DRIVE_FOLDER_ID.
 * @returns {Promise<string>} A promise that resolves with the ID of the created folder. If the folder creation fails, it throws an Error with a message describing the failure.
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
 * Creates a folder in Google Drive, uploads multiple files to it, and returns the IDs of the uploaded files.
 *
 * @param {string} folderName - The name of the folder to create.
 * @param {Array<string>} filePaths - The list of local file paths to upload to the created folder.
 * @returns {Promise<Array<string>>} A promise that resolves with an array of file IDs. If the folder creation or file upload fails, it throws an Error with a message describing the failure.
 */
const createFolderAndUploadMultipleFiles = async (folderName, filePaths) => {
    const folderMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    try {
        // Create the folder
        const folder = await drive.files.create({
            resource: folderMetadata,
            fields: "id",
        });

        if (!folder.data.id) {
            throw new ApiError(
                500,
                "Folder creation failed: No folder ID returned."
            );
        }

        // Prepare an array to hold the results of each file upload
        const fileUploadPromises = filePaths.map(async (filePath) => {
            const fileMetadata = {
                name: path.basename(filePath),
                parents: [folder.data.id],
            };

            // Upload the file
            const file = await drive.files.create({
                resource: fileMetadata,
                media: {
                    mimeType: getMimeType(filePath),
                    body: fs.createReadStream(filePath),
                },
                fields: "id, mimeType",
            });

            if (!file.data.id) {
                throw new ApiError(
                    500,
                    `File upload failed for ${filePath}: No file ID returned.`
                );
            }

            return file.data.id; // Return the file ID
        });

        // Wait for all file uploads to complete
        const fileIds = await Promise.all(fileUploadPromises);

        return fileIds; // Return all the file IDs
    } catch (error) {
        throw new ApiError(
            500,
            `Folder creation or file upload error: ${error.message}`
        );
    }
};

/**
 * Uploads multiple files to a specified Google Drive folder.
 *
 * @param {string} folderId - The ID of the Google Drive folder where the files will be uploaded.
 * @param {Array<string>} filePaths - An array of local file paths to the files that need to be uploaded.
 * @returns {Promise<Array<object>>} A promise that resolves with an array of uploaded file data objects.
 * @throws {ApiError} Throws an ApiError if any file upload operation fails.
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
 * Searches for a Google Drive folder by name in the top-level folder specified
 * by the GOOGLE_DRIVE_FOLDER_ID environment variable, and returns the ID of
 * the folder if it exists, or null if it does not.
 *
 * @param {string} folderName - The name of the folder to search for.
 * @returns {Promise<string|null>} A promise that resolves with the ID of the
 * folder if it exists, or null if it does not.
 * @throws {ApiError} Throws an ApiError if there is an error while searching
 * for the folder.
 */
async function getFolderIdByName(
    folderName,
    parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID
) {
    const query = `'${parentFolderId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const response = await drive.files.list({
        q: query,
        fields: "files(id, name)",
    });

    if (response.data.files.length > 0) {
        return response.data.files[0].id; // Return the first matching folder
    }
    return null; // Folder not found
}

/**
 * Retrieves an array of file objects from a Google Drive folder, with the
 * "url" property set to a publicly accessible download URL for each file.
 *
 * @param {string} folderId - The ID of the Google Drive folder to retrieve
 * files from.
 * @returns {Promise<Array<object>>} A promise that resolves with an array of
 * objects containing information about the files in the folder, including
 * the file ID, name, MIME type, size, created time, modified time, and a
 * publicly accessible download URL.
 * @throws {ApiError} Throws an ApiError if there is an error while retrieving
 * the file URLs.
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
 * Deletes a Google Drive folder and all its contents.
 *
 * @param {string} folderId - The ID of the folder to delete.
 * @throws {ApiError} Throws an ApiError if there is an error while deleting
 * the folder or its contents.
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

export {
    listAllFilesInFolder,
    listAllFoldersInFolder,
    listSpecificFolderInParentFolder,
    createFolder,
    createFolderAndUploadMultipleFiles,
    uploadFilesToFolder,
    getFolderIdByName,
    getFileUrlsFromFolder,
    deleteFolder,
};
