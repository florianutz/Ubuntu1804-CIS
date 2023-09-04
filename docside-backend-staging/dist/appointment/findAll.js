"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllAppointment = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    "content-type": "application/json",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};
const findAllAppointment = async (event) => {
    var _a, _b, _c, _d;
    try {
        console.log(event.queryStringParameters);
        const startDateParam = (_a = event.queryStringParameters) === null || _a === void 0 ? void 0 : _a.startDate;
        const endDateParam = (_b = event.queryStringParameters) === null || _b === void 0 ? void 0 : _b.endDate;
        const { email } = (_d = (_c = event.requestContext) === null || _c === void 0 ? void 0 : _c.authorizer) === null || _d === void 0 ? void 0 : _d.claims;
        // find user making the request
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
        //find All appointments that the users belongs to
        const result = await docClient
            .scan({
            TableName: "tft_appointment_dev",
        })
            .promise();
        const appointments = result.Items;
        const toResult = [];
        let startDate;
        let endDate;
        if (startDateParam && endDateParam) {
            // startDate = new Date(new Date(startDateParam).setDate(new Date(startDateParam).getDate()-1));
            startDate = new Date(startDateParam);
            endDate = new Date(endDateParam);
        }
        for (const element of appointments) {
            //appointments that have my user inside the usersIds array
            if ((user === null || user === void 0 ? void 0 : user.user_id) && element.usersIds.find((userId) => userId === (user === null || user === void 0 ? void 0 : user.user_id))) {
                if (startDate &&
                    new Date(element.startDate).getTime() > (startDate === null || startDate === void 0 ? void 0 : startDate.getTime()) &&
                    endDate &&
                    new Date(element.startDate).getTime() < (endDate === null || endDate === void 0 ? void 0 : endDate.getTime())) {
                    toResult.push(element);
                }
            }
        }
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(toResult),
        };
    }
    catch (e) {
        console.log(e);
        return (0, customError_1.handleError)(e);
    }
};
exports.findAllAppointment = findAllAppointment;
//# sourceMappingURL=findAll.js.map