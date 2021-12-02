const AWS = require("aws-sdk");
const { getUniqueNameForFile } = require("../helpers/common");
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;

/**
 * For uploading files to S3 bucket.
 * It is recommended for single or multiple files, in the form of array. basically req.files.
 * It is recommended to use this function for file sizes less that 100 MB of each file.
 *
 * @param {array} files This will be the files which we will receive in the req.files
 * @param {string} folderName This will be the folder name where you want to upload the files. Must be defined in environment files.
 * @returns false in case or error | Response for every file from AWS
 */
const uploadFilesToS3 = async (files = [], folderName) => {
  try {
    if (folderName === undefined) {
      throw "Folder name is required for uploading files to AWS S3!";
    }
    const bucketFolderName = `${bucketName}/${folderName}`;
    const filesData = files?.map((file) => {
      return {
        Bucket: bucketFolderName,
        Key: getUniqueNameForFile(file.name),
        Body: file.data,
      };
    });
    //await s3.createBucket({ Bucket: bucketFolderName }).promise();
    return await Promise.all(
      filesData.map((filesData) => s3.upload(filesData).promise())
    );
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * For deleting files from S3 bucket.
 *
 * @param {array} fileNames File names string values you want to delete as in S3
 * @param {string} folderName This will be the folder name where you want to upload the files. Must be defined in environment files.
 * @returns false in case or error | Response for every file from AWS
 */
const deleteObjectsFromS3 = async (fileNames = [], folderName) => {
  try {
    if (folderName === undefined) {
      throw "Folder name is required for deleting files from AWS S3!";
    }
    const bucketFolderName = `${bucketName}/${folderName}`;
    const filesData = fileNames?.map((name) => {
      return {
        Bucket: bucketFolderName,
        Key: name,
      };
    });
    return await Promise.all(
      filesData.map(async (fileData) => {
        return await s3.deleteObject(fileData).promise();
      })
    );
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports = { uploadFilesToS3, deleteObjectsFromS3 };
