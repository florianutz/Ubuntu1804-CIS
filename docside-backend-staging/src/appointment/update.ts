import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { IAppointment } from "../entities/IAppointment";
import IUser from "../entities/IUser";
import { handleError } from "../utils/customError";
import { buildLink } from "../utils/urlGenerator";
import { dayMap, monthMap, getDateString, getDuration } from "./utils";

const docClient = new AWS.DynamoDB.DocumentClient();
const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*", // Allow from anywhere
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};

export const updateAppointment = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    const reqBody = JSON.parse(event.body as string) as IAppointment;

    const { email } = event.requestContext?.authorizer?.claims;
    // const users = await docClient
    //   .scan({
    //     TableName: "tft_users",
    //   })
    //   .promise();
    // let user;
    // if (users?.Items)
    //   for (let i of users?.Items) {
    //     if (i.email === email) {
    //       user = i;
    //     }
    //   }
    // if (!user)
    //   return {
    //     statusCode: 401,
    //     headers,
    //     body: JSON.stringify({ error: "not authorized" }),
    //   };
    // console.log(user);
    // console.log("--------------------");

    if (id) {
      const currentAppointment = await docClient
        .get({
          TableName: "tft_appointment_dev",
          Key: {
            appointment_id: id,
          },
        })
        .promise();

      if (!currentAppointment)
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "not found" }),
        };
      console.log(currentAppointment);
      console.log("--------------------");
      const currentAppointmentItem = currentAppointment?.Item as IAppointment;
      const AppointmentData: IAppointment = {
        ...currentAppointmentItem,
        startDate: reqBody.startDate,
        endDate: reqBody.endDate,
        updated_at: new Date(),
      };
      console.log(AppointmentData);
      const eventTypeDataRes = await docClient
        .put({
          TableName: "tft_appointment_dev",
          Item: AppointmentData,
        })
        .promise();
      
      /* Generating redirect url */
      const editURL = await buildLink('EDIT', currentAppointmentItem?.appointment_id) ?? 
      `https://chat.tftcomponents.com/appointment/${
        currentAppointmentItem.appointment_id
      }/EDIT`;
      const cancelURL = await buildLink('CANCEL', currentAppointmentItem?.appointment_id) ?? 
      `https://chat.tftcomponents.com/appointment/${
        currentAppointmentItem.appointment_id
      }/CANCEL`;

      ///////////////////////SENDING EMAIL TO CLIENT///////////////////////////

      const users = await docClient
        .scan({
          TableName: "tft_users",
        })
        .promise();
      let provider;
      let usersToSend: IUser[] = [];
      let usersEmails: string[] = [];
      let requester;
      if (users?.Items) {
        for (let i of users?.Items) {
          if (i.user_id === currentAppointmentItem?.provider_id) {
            provider = i;
          }
          if(i.email === email) {
            requester = i;
          }
        }
        for (let i of users?.Items) {
          if (currentAppointmentItem?.usersIds.find((user_id: string) => user_id === i.user_id)) {
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
                  height: 750px;
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
                    color: #828282;">The appointment has been rescheduled.</p>
                
                    <p style="font-style: normal;
                    font-weight: 500;
                    font-size: 16px;
                    line-height: 24px;
                    letter-spacing: 0.1px;
                    color: #333333;
                    text-align: start;
                    font-family: system-ui;
                    "><img src="https://bucket-tft-icons-schedule.s3.amazonaws.com/calendar.png"/> Date & Time <a style="
                    padding: 6px 12px;
                    font-style: normal;
                    font-weight: 500;
                    font-size: 14px;
                    line-height: 20px;
                    text-align: center;
                    letter-spacing: 0.25px;
                    color: #FFFFFF;
                    background: #333333;
                    border-radius: 28px;">Changed</a></p>
                
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
                    text-decoration: line-through;
                    margin-bottom: 12px;
                    ">${getDateString(
                      new Date(currentAppointmentItem.startDate),
                      new Date(currentAppointmentItem.endDate),
                      currentAppointmentItem?.offset,
                    )} 
                    </p>
                                    
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
                     ${getDateString(new Date(reqBody?.startDate), new Date(reqBody?.endDate), reqBody?.offset)} 
                    </p>
                
                    <p style="font-style: normal;
                    font-weight: 500;
                    font-size: 16px;
                    line-height: 24px;
                    letter-spacing: 0.1px;
                    color: #333333;
                    text-align: start;
                    font-family: system-ui;
                    "><img src="https://bucket-tft-icons-schedule.s3.amazonaws.com/clock.png"/> Duration <a style="
                    padding: 6px 12px;
                    font-style: normal;
                    font-weight: 500;
                    font-size: 14px;
                    line-height: 20px;
                    text-align: center;
                    letter-spacing: 0.25px;
                    color: #FFFFFF;
                    background: #333333;
                    border-radius: 28px;">Changed</a></p>
                
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
                    ">${getDuration(
                      new Date(currentAppointmentItem?.endDate),
                      new Date(currentAppointmentItem?.startDate),
                    )} min</p>
                
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
                    ">${currentAppointmentItem?.notes}</p>
                
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
                    ">${provider?.first_name} ${provider?.last_name} </p>
                  
                    <p style="font-style: normal;
                    font-weight: 500;
                    font-size: 16px;
                    line-height: 24px;
                    letter-spacing: 0.1px;
                    color: #333333;
                    text-align: start;
                    font-family: system-ui;
                    "><img src="https://bucket-tft-icons-schedule.s3.amazonaws.com/Time.png"/> Rescheduled by</p>
                
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
                    ">${requester?.first_name} ${requester?.last_name} </p>

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
                </body>`,
                  },
                },
                Subject: {
                  Charset: "UTF-8",
                  Data: "Appointment Rescheduled",
                },
              },
              Source: "product@topflightapps.com" /* required */,
            };

            var sendPromise = new AWS.SES({ apiVersion: "2010-12-01" }).sendEmail(params).promise();
            await sendPromise;
          }
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(AppointmentData),
      };
    } else {
      throw new Error("event type not found");
    }
  } catch (e) {
    console.log(e);
    return handleError(e);
  }
};
