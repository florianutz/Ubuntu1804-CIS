"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventType = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    "content-type": "application/json",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};
const updateEventType = async (event) => {
    var _a, _b, _c;
    try {
        const id = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.id;
        const reqBody = JSON.parse(event.body);
        const { email } = (_c = (_b = event.requestContext) === null || _b === void 0 ? void 0 : _b.authorizer) === null || _c === void 0 ? void 0 : _c.claims;
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
        if (id) {
            // const eventType = await docClient
            //   .get({
            //     TableName: "tft_event_type1",
            //     Key: {
            //       id: id,
            //     },
            //   })
            //   .promise();
            // if (!eventType)
            //   return {
            //     statusCode: 404,
            //     headers,
            //     body: JSON.stringify({ error: "not found" }),
            //   };
            // console.log(eventType)
            // console.log(reqBody)
            // const eventTypeItem = eventType?.Item
            const eventTypeData = Object.assign(Object.assign({}, reqBody), { user_id: user.user_id, updated_at: new Date(), event_type_id: id });
            console.log(eventTypeData);
            const eventTypeDataRes = await docClient
                .put({
                TableName: "tft_event_type3_dev",
                Item: eventTypeData,
            })
                .promise();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(eventTypeData),
            };
        }
        else {
            throw new Error("event type not found");
        }
    }
    catch (e) {
        console.log(e);
        return (0, customError_1.handleError)(e);
    }
};
exports.updateEventType = updateEventType;
//# sourceMappingURL=update.js.map