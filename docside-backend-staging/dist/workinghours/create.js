"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkingHours = void 0;
const uuid_1 = require("uuid");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    "content-type": "application/json",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};
const createWorkingHours = async (event) => {
    var _a, _b, _c, _d;
    try {
        console.log((_b = (_a = event === null || event === void 0 ? void 0 : event.requestContext) === null || _a === void 0 ? void 0 : _a.authorizer) === null || _b === void 0 ? void 0 : _b.claims);
        const { email } = (_d = (_c = event.requestContext) === null || _c === void 0 ? void 0 : _c.authorizer) === null || _d === void 0 ? void 0 : _d.claims;
        const users = await docClient.scan({
            TableName: 'tft_users',
        }).promise();
        let user;
        if (users === null || users === void 0 ? void 0 : users.Items)
            for (let i of users === null || users === void 0 ? void 0 : users.Items) {
                if (i.email === email) {
                    user = i;
                }
            }
        if (!user)
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: "not authorized" })
            };
        console.log(user);
        console.log('--------------------');
        const reqBody = JSON.parse(event.body);
        const workingHours = Object.assign(Object.assign({}, reqBody), { user_id: user.user_id, created_at: new Date(), updated_at: new Date(), working_hours_id: (0, uuid_1.v4)() });
        const workingHoursData = await docClient
            .put({
            TableName: "tft_working_hors_dev",
            Item: workingHours,
            ReturnValues: "ALL_OLD"
        })
            .promise();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(workingHours),
        };
    }
    catch (e) {
        console.log(e);
        return (0, customError_1.handleError)(e);
    }
};
exports.createWorkingHours = createWorkingHours;
//# sourceMappingURL=create.js.map