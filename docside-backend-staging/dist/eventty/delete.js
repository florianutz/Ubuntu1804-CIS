"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEventType = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const utils_1 = require("../appointment/utils");
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    "content-type": "application/json",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};
const deleteEventType = async (event) => {
    var _a, _b, _c;
    try {
        const id = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.id;
        const { email } = (_c = (_b = event.requestContext) === null || _b === void 0 ? void 0 : _b.authorizer) === null || _c === void 0 ? void 0 : _c.claims; //find the provider of this event type
        const eventType = await docClient
            .delete({
            TableName: "tft_event_type3_dev",
            Key: {
                event_type_id: id,
            },
        })
            .promise();
        if (!eventType)
            return {
                statusCode: 404,
                body: JSON.stringify("Event type not found"),
            };
        //get all appointments associated with that event Type
        const result = await docClient
            .scan({
            TableName: "tft_appointment_dev",
        })
            .promise();
        const appointments = result.Items;
        const appointmentsToDelete = [];
        const users = await docClient
            .scan({
            TableName: "tft_users",
        })
            .promise();
        let provider;
        let usersToSend = [];
        let usersEmails = [];
        if (users === null || users === void 0 ? void 0 : users.Items) {
            for (let i of users === null || users === void 0 ? void 0 : users.Items) {
                if (i.email === email) {
                    provider = i;
                }
            }
        }
        for (const element of appointments) {
            if (element.event_type_id === id) {
                //if the appointment is of the same type of the deleted event type -> delete and notify
                const item = {
                    DeleteRequest: {
                        //add the appointment to the delete request to bulk delete
                        Key: {
                            appointment_id: element.appointment_id,
                        },
                    },
                };
                appointmentsToDelete.push(item);
                ///////////////////////SENDING EMAIL TO CLIENT///////////////////////////
                if (users === null || users === void 0 ? void 0 : users.Items) {
                    for (let i of users === null || users === void 0 ? void 0 : users.Items) {
                        if (element === null || element === void 0 ? void 0 : element.usersIds.find((user_id) => user_id === i.user_id)) {
                            usersToSend.push(i);
                            usersEmails.push(i.email);
                            var params = {
                                Destination: {
                                    ToAddresses: [i.email],
                                },
                                Message: {
                                    Body: {
                                        Html: {
                                            Charset: "UTF-8",
                                            Data: `<body style="display: flex;
                    text-align: center;
                    height: 90vh;
                    justify-content: center;
                    flex-direction: column;
                    align-items: center;">
                    
                      <div style="box-sizing: border-box;
                      width: 612px;
                      height: 600px;
                      background: #FFFFFF;
                      border: 1px solid #BDBDBD;
                      padding: 24px;
                      border-radius: 16px;">
                        <h1 style="
                        font-style: normal;
                        font-weight: 400;
                        font-size: 22px;
                        line-height: 28px;
                        font-family: system-ui;
                        text-align: start;
                        margin-top: 0px;
                        margin-bottom: 5px;
                        color: #333333;">Hi ${i.first_name} ${i.last_name}, </h1>
                        <p style="font-style: normal;
                        font-weight: 500;
                        font-size: 16px;
                        line-height: 24px;
                        letter-spacing: 0.1px;
                        font-family: system-ui;
                        text-align: start;
                        margin-top: 0;
                        color: #828282;">The appointment below has been canceled.</p>
                    
                        <p style="font-style: normal;
                        font-weight: 500;
                        font-size: 16px;
                        line-height: 24px;
                        letter-spacing: 0.1px;
                        color: #333333;
                        text-align: start;
                        font-family: system-ui;
                        "><img src="https://bucket-tft-icons-schedule.s3.amazonaws.com/calendar.png"/> Date & Time</p>
                    
                        <p style="
                        text-align: start;
                        font-family: system-ui;
                        font-style: normal;
                        font-weight: 500;
                        font-size: 16px;
                        line-height: 24px;
                        letter-spacing: 0.1px;
                        color: #828282;
                        margin-left: 22px;
                        margin-top: 0;
                        margin-bottom: 30px;
                        ">
                        ${(0, utils_1.getDateString)(new Date(element === null || element === void 0 ? void 0 : element.startDate), new Date(element === null || element === void 0 ? void 0 : element.endDate), element === null || element === void 0 ? void 0 : element.offset)} 
                        </p>
                    
                        <p style="font-style: normal;
                        font-weight: 500;
                        font-size: 16px;
                        line-height: 24px;
                        letter-spacing: 0.1px;
                        color: #333333;
                        text-align: start;
                        font-family: system-ui;
                        "><img src="https://bucket-tft-icons-schedule.s3.amazonaws.com/clock.png"/> Duration</p>
                    
                        <p style="
                        text-align: start;
                        font-family: system-ui;
                        font-style: normal;
                        font-weight: 500;
                        font-size: 16px;
                        line-height: 24px;
                        letter-spacing: 0.1px;
                        color: #828282;
                        margin-left: 22px;
                        margin-top: 0;
                        margin-bottom: 30px;
                        ">${(0, utils_1.getDuration)(new Date(element === null || element === void 0 ? void 0 : element.endDate), new Date(element === null || element === void 0 ? void 0 : element.startDate))} min</p>
                    
                        <p style="font-style: normal;
                        font-weight: 500;
                        font-size: 16px;
                        line-height: 24px;
                        letter-spacing: 0.1px;
                        color: #333333;
                        text-align: start;
                        font-family: system-ui;
                        "><img src="https://bucket-tft-icons-schedule.s3.amazonaws.com/doc.png"/> Description</p>
                    
                        <p style="
                        text-align: start;
                        font-family: system-ui;
                        font-style: normal;
                        font-weight: 500;
                        font-size: 16px;
                        line-height: 24px;
                        letter-spacing: 0.1px;
                        color: #828282;
                        margin-left: 22px;
                        margin-top: 0;
                        margin-bottom: 30px;
                        ">${element === null || element === void 0 ? void 0 : element.notes}</p>
                    
                        <p style="font-style: normal;
                        font-weight: 500;
                        font-size: 16px;
                        line-height: 24px;
                        letter-spacing: 0.1px;
                        color: #333333;
                        text-align: start;
                        font-family: system-ui;
                        "><img src="https://bucket-tft-icons-schedule.s3.amazonaws.com/user.png"/> Appointment with</p>
                    
                        <p style="
                        text-align: start;
                        font-family: system-ui;
                        font-style: normal;
                        font-weight: 500;
                        font-size: 16px;
                        line-height: 24px;
                        letter-spacing: 0.1px;
                        color: #828282;
                        margin-left: 22px;
                        margin-top: 0;
                        margin-bottom: 24px;
                        ">${provider === null || provider === void 0 ? void 0 : provider.first_name} ${provider === null || provider === void 0 ? void 0 : provider.last_name} </p>

                        <p style="font-style: normal;
                        font-weight: 500;
                        font-size: 16px;
                        line-height: 24px;
                        letter-spacing: 0.1px;
                        color: #333333;
                        text-align: start;
                        font-family: system-ui;
                        "><img src="https://bucket-tft-icons-schedule.s3.amazonaws.com/user.png"/> Canceled by</p>
                    
                        <p style="
                        text-align: start;
                        font-family: system-ui;
                        font-style: normal;
                        font-weight: 500;
                        font-size: 16px;
                        line-height: 24px;
                        letter-spacing: 0.1px;
                        color: #828282;
                        margin-left: 22px;
                        margin-top: 0;
                        margin-bottom: 24px;
                        ">${provider === null || provider === void 0 ? void 0 : provider.first_name} ${provider === null || provider === void 0 ? void 0 : provider.last_name} </p>
                    </body>`,
                                        },
                                    },
                                    Subject: {
                                        Charset: "UTF-8",
                                        Data: "Appointment Cancelled",
                                    },
                                },
                                Source: "product@topflightapps.com" /* required */,
                            };
                            var sendPromise = new aws_sdk_1.default.SES({ apiVersion: "2010-12-01" }).sendEmail(params).promise();
                            await sendPromise;
                        }
                    }
                }
            }
        }
        console.log(appointmentsToDelete);
        // delete all appointments associated with this event type in bulk delete
        if (appointmentsToDelete.length > 0) {
            const deletedAppointments = await docClient
                .batchWrite({
                RequestItems: {
                    tft_appointment_dev: appointmentsToDelete,
                },
            })
                .promise();
        }
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(id),
        };
    }
    catch (e) {
        console.log(e);
        return (0, customError_1.handleError)(e);
    }
};
exports.deleteEventType = deleteEventType;
//# sourceMappingURL=delete.js.map