import querystring from 'querystring';
import { s3Client } from "./AWS";
import { UploadedFile } from "./parseFormData";
import { handleError } from "./customError";
import { S3 } from 'aws-sdk';

export const uploadFileToS3 = async (file: UploadedFile) => {
    const fileName: any = file.filename;
    const fileNameSplitted = fileName.filename.split('.');
    const fileType = fileNameSplitted[fileNameSplitted.length - 1];
    const tags = file.filename ? { filename: file.filename } : undefined;
    const paramFileName = String(Date.now()) + '.' + String(fileType);
    const dbFileName = process.env.S3_FILENAME_PREFIX + paramFileName;
    const params = {
      Bucket: process.env.S3_UPLOAD_FILES,
      Key: paramFileName,
      Body: file.content,
      Tagging: querystring.stringify(tags)
    };
    try {
      await s3Client.putObject(params as S3.PutObjectRequest).promise();
      return dbFileName;
    } catch (error) {
      return handleError(error);
    }
  };