"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyWorkingHour = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    "content-type": "application/json",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};
const updateMyWorkingHour = async (event) => {
    var _a, _b;
    try {
        //1-find the user updating its working hours using auth token
        const reqBody = JSON.parse(event.body);
        const { email } = (_b = (_a = event.requestContext) === null || _a === void 0 ? void 0 : _a.authorizer) === null || _b === void 0 ? void 0 : _b.claims;
        const users = await docClient
            .scan({
            TableName: "tft_users",
        })
            .promise();
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
                body: JSON.stringify({ error: "not authorized" }),
            };
        console.log(user);
        console.log("--------------------");
        //2-find the working hour to update (working hour of the user above)
        const workingHours = await docClient
            .scan({
            TableName: "tft_working_hors_dev",
        })
            .promise();
        let existingWorkingHour;
        if (workingHours === null || workingHours === void 0 ? void 0 : workingHours.Items)
            for (let i of workingHours === null || workingHours === void 0 ? void 0 : workingHours.Items) {
                if (i.user_id === user.user_id) {
                    existingWorkingHour = i;
                }
            }
        if (!existingWorkingHour)
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: "not found" }),
            };
        console.log(existingWorkingHour);
        //3- compose the update object with the existing working hours and the updated parameters
        const workingHoursData = Object.assign(Object.assign(Object.assign({}, existingWorkingHour), reqBody), { user_id: user.user_id, updated_at: new Date() });
        console.log(workingHoursData);
        //4- update the working hours inn the database
        const workingHoursDataRes = await docClient
            .put({
            TableName: "tft_working_hors_dev",
            Item: workingHoursData,
        })
            .promise();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(workingHoursData),
        };
    }
    catch (e) {
        console.log(e);
        return (0, customError_1.handleError)(e);
    }
};
exports.updateMyWorkingHour = updateMyWorkingHour;
//# sourceMappingURL=update.js.map