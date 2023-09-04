"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToS3 = void 0;
const querystring_1 = __importDefault(require("querystring"));
const AWS_1 = require("./AWS");
const customError_1 = require("./customError");
const uploadFileToS3 = async (file) => {
    const fileName = file.filename;
    const fileNameSplitted = fileName.filename.split('.');
    const fileType = fileNameSplitted[fileNameSplitted.length - 1];
    const tags = file.filename ? { filename: file.filename } : undefined;
    const paramFileName = String(Date.now()) + '.' + String(fileType);
    const dbFileName = process.env.S3_FILENAME_PREFIX + paramFileName;
    const params = {
        Bucket: process.env.S3_UPLOAD_FILES,
        Key: paramFileName,
        Body: file.content,
        Tagging: querystring_1.default.stringify(tags)
    };
    try {
        await AWS_1.s3Client.putObject(params).promise();
        return dbFileName;
    }
    catch (error) {
        return (0, customError_1.handleError)(error);
    }
};
exports.uploadFileToS3 = uploadFileToS3;
//# sourceMappingURL=upload.js.map