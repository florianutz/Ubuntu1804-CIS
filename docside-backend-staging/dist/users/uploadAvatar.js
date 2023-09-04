"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userUploadAvatar = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const parseFormData_1 = require("../utils/parseFormData");
const upload_1 = require("../utils/upload");
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    'content-type': 'multipart/form-data',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
};
const userUploadAvatar = async (event) => {
    var _a;
    try {
        const id = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.id;
        const reqBody = JSON.parse(event.body);
        const { file } = await (0, parseFormData_1.parseFormData)(event);
        if (!file) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: "file not found" })
            };
        }
        const user = await docClient.get({
            TableName: 'tft_users',
            Key: {
                user_id: id
            }
        }).promise();
        if (!user)
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: "not found" })
            };
        const url = await (0, upload_1.uploadFileToS3)(file);
        if (url) {
            const userData = Object.assign(Object.assign(Object.assign({}, user), reqBody), { updated_at: new Date(), user_id: id, photo: url });
            const userRes = await docClient.put({
                TableName: 'tft_users',
                Item: userData
            }).promise();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(userRes)
            };
        }
        else
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: "Updating error" })
            };
    }
    catch (e) {
        return (0, customError_1.handleError)(e);
    }
};
exports.userUploadAvatar = userUploadAvatar;
//# sourceMappingURL=uploadAvatar.js.map