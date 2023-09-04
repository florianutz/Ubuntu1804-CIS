"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppointment = void 0;
const uuid_1 = require("uuid");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const utils_1 = require("./utils");
const urlGenerator_1 = require("../utils/urlGenerator");
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    "content-type": "application/json",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};
const createAppointment = async (event) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    try {
        /**
         find user making the request
         */
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
        /**
         create appointment or add attendee to existing appointment
          */
        const reqBody = JSON.parse(event.body);
        //check if an appointment exist at the same time slot and belongs to the same event type
        const result = await docClient
            .scan({
            TableName: "tft_appointment_dev",
        })
            .promise();
        const appointments = result.Items;
        let appointment;
        //create and appointment in case it does not exist any with same time slot
        appointment = Object.assign(Object.assign({}, reqBody), { usersIds: [reqBody.provider_id, user.user_id], created_at: new Date(), updated_at: new Date(), appointment_id: (0, uuid_1.v4)() });
        //look for appointments with same event_type_id and same start time///////////////////
        for (const element of appointments) {
            if (element.event_type_id === reqBody.event_type_id) {
                const oldAppointmentTime = new Date(element.startDate).getTime();
                const newAppointmentTime = new Date(reqBody.startDate).getTime();
                if (oldAppointmentTime === newAppointmentTime) {
                    //if there is a match verify the max attendees the event type can have
                    //update the existing one
                    appointment = Object.assign(Object.assign({}, element), { usersIds: [...element.usersIds, user.user_id], updated_at: new Date() });
                    const eventType = await docClient
                        .get({
                        TableName: "tft_event_type3_dev",
                        Key: {
                            event_type_id: reqBody.event_type_id,
                        },
                    })
                        .promise();
                    const eventMaxAttendees = (_c = eventType === null || eventType === void 0 ? void 0 : eventType.Item) === null || _c === void 0 ? void 0 : _c.maxAttendees;
                    if (appointment.usersIds.length - 1 > eventMaxAttendees)
                        //don't take into account the provider
                        return {
                            statusCode: 400,
                            headers,
                            body: JSON.stringify({ error: "slot fully booked" }),
                        };
                    break;
                }
            }
        }
        const appointmentData = await docClient
            .put({
            TableName: "tft_appointment_dev",
            Item: appointment,
            ReturnValues: "ALL_OLD",
        })
            .promise();
        /* Generating redirect url */
        const editURL = (_d = (await (0, urlGenerator_1.buildLink)("EDIT", appointment === null || appointment === void 0 ? void 0 : appointment.appointment_id))) !== null && _d !== void 0 ? _d : `https://chat.tftcomponents.com/appointment/${appointment.appointment_id}/EDIT`;
        const cancelURL = (_e = (await (0, urlGenerator_1.buildLink)("CANCEL", appointment === null || appointment === void 0 ? void 0 : appointment.appointment_id))) !== null && _e !== void 0 ? _e : `https://chat.tftcomponents.com/appointment/${appointment.appointment_id}/CANCEL`;
        ///////////////////////SENDING EMAIL TO CLIENT///////////////////////////
        const htmlData = (provider, firstName, lastName) => {
            const htmlString = `<body style="display: flex;
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
                color: #333333;">Hi ${firstName} ${lastName}, </h1>
                <p style="font-style: normal;
                font-weight: 500;
                font-size: 16px;
                line-height: 24px;
                letter-spacing: 0.1px;
                font-family: system-ui;
                text-align: start;
                margin-top: 0;
                color: #828282;">A new appointment has been scheduled.</p>
            
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
                ${(0, utils_1.getDateString)(new Date(appointment.startDate), new Date(appointment.endDate), reqBody.offset)} 
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
                ">${(0, utils_1.getDuration)(new Date(appointment.endDate), new Date(appointment.startDate))} min</p>
            
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
                ">${reqBody.notes}</p>
            
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
            
                <div style="
                width: 564px;
                height: 0px;
                border-bottom: 1px solid #BDBDBD;"></div>
                <div style="margin-top: 24px;
                display: flex;
                height: 48px;
                justify-content: space-between;
                ">
                  <a href="${cancelURL}" style="padding: 0px 110px;
                    color: #333333;
                    text-decoration: none;
                    padding-top: 13px;
                    background: #ffffff;
                    font-family: system-ui;
                    border: solid 1px #333333;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 20px;
                    border-radius: 100px;">
                    Cancel
                  </a>
                  <a href="${editURL}" style="padding: 0px 90px;
                    color: #FFFFFF;
                    text-decoration: none;
                    padding-top: 13px;
                    background: #333333;
                    font-family: system-ui;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 100px;">
                    Reschedule
                  </a>
                </div>
            </body>`;
            return htmlString;
        };
        let provider;
        if (users === null || users === void 0 ? void 0 : users.Items)
            for (let i of users === null || users === void 0 ? void 0 : users.Items) {
                if (i.user_id === reqBody.provider_id) {
                    provider = i;
                }
            }
        var params = (recipientEmail, firstName, lastName) => {
            return {
                Destination: {
                    ToAddresses: [recipientEmail],
                },
                Message: {
                    Body: {
                        Html: {
                            Charset: "UTF-8",
                            Data: htmlData(provider, firstName, lastName),
                        },
                    },
                    Subject: {
                        Charset: "UTF-8",
                        Data: "Appointment Scheduled",
                    },
                },
                Source: "product@topflightapps.com" /* required */,
            };
        };
        for (let i = 0; i <= 1; i++) {
            if (i === 0) {
                var sendPromise = new aws_sdk_1.default.SES({ apiVersion: "2010-12-01" })
                    .sendEmail(params(user.email, (_f = reqBody === null || reqBody === void 0 ? void 0 : reqBody.firstName) !== null && _f !== void 0 ? _f : "", (_g = reqBody === null || reqBody === void 0 ? void 0 : reqBody.lastName) !== null && _g !== void 0 ? _g : ""))
                    .promise();
                await sendPromise;
            }
            else {
                var sendPromise = new aws_sdk_1.default.SES({ apiVersion: "2010-12-01" })
                    .sendEmail(params(provider === null || provider === void 0 ? void 0 : provider.email, (_h = provider === null || provider === void 0 ? void 0 : provider.first_name) !== null && _h !== void 0 ? _h : '', (_j = provider === null || provider === void 0 ? void 0 : provider.last_name) !== null && _j !== void 0 ? _j : ''))
                    .promise();
                await sendPromise;
            }
        }
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(appointment),
        };
    }
    catch (e) {
        console.log(e);
        return (0, customError_1.handleError)(e);
    }
};
exports.createAppointment = createAppointment;
//# sourceMappingURL=create.js.map