"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMyWorkingHour = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    "content-type": "application/json",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};
const findMyWorkingHour = async (event) => {
    var _a, _b;
    try {
        //1-FINDING USER making the request
        const { email } = (_b = (_a = event.requestContext) === null || _a === void 0 ? void 0 : _a.authorizer) === null || _b === void 0 ? void 0 : _b.claims;
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
        //2-find the working hours of that user (working hour of the user above)
        const result = await docClient
            .scan({
            TableName: "tft_working_hors_dev",
        })
            .promise();
        const workingHours = result.Items;
        let myWorkingHours;
        for (const element of workingHours) {
            if (element.user_id === user.user_id) {
                myWorkingHours = element;
                break;
            }
        }
        // const eventType = await docClient
        //   .get({
        //     TableName: "tft_working_hors_dev",
        //     Key: {
        //       user_id: user.user_id,
        //     },
        //   })
        //   .promise();
        if (!myWorkingHours)
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: "not found" }),
            };
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(myWorkingHours),
        };
    }
    catch (e) {
        console.log(e);
        return (0, customError_1.handleError)(e);
    }
};
exports.findMyWorkingHour = findMyWorkingHour;
//# sourceMappingURL=findOne.js.map