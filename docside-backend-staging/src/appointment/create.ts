import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 } from "uuid";
import AWS from "aws-sdk";
import { handleError } from "../utils/customError";
import { IAppointment } from "../entities/IAppointment";
import { dayMap, monthMap, getDateString, getDuration } from "./utils";
import { buildLink } from "../utils/urlGenerator";
const docClient = new AWS.DynamoDB.DocumentClient();
const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};

export const createAppointment = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    /**
     find user making the request
     */
    const { email } = event.requestContext?.authorizer?.claims;
    const users = await docClient
      .scan({
        TableName: "tft_users",
      })
      .promise();
    let user;
    if (users?.Items)
      for (let i of users?.Items) {
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
    const reqBody = JSON.parse(event.body as string) as IAppointment;

    //check if an appointment exist at the same time slot and belongs to the same event type
    const result = await docClient
      .scan({
        TableName: "tft_appointment_dev",
      })
      .promise();
    const appointments = result.Items as IAppointment[];

    let appointment: IAppointment;
    //create and appointment in case it does not exist any with same time slot
    appointment = {
      ...reqBody,
      usersIds: [reqBody.provider_id, user.user_id],
      created_at: new Date(),
      updated_at: new Date(),
      appointment_id: v4(),
    };

    //look for appointments with same event_type_id and same start time///////////////////
    for (const element of appointments) {
      if (element.event_type_id === reqBody.event_type_id) {
        const oldAppointmentTime = new Date(element.startDate).getTime();
        const newAppointmentTime = new Date(reqBody.startDate).getTime();
        if (oldAppointmentTime === newAppointmentTime) {
          //if there is a match verify the max attendees the event type can have
          //update the existing one
          appointment = {
            ...element,
            usersIds: [...element.usersIds, user.user_id],
            updated_at: new Date(),
          };
          const eventType = await docClient
            .get({
              TableName: "tft_event_type3_dev",
              Key: {
                event_type_id: reqBody.event_type_id,
              },
            })
            .promise();
          const eventMaxAttendees = eventType?.Item?.maxAttendees;
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
    const editURL =
      (await buildLink("EDIT", appointment?.appointment_id)) ??
      `https://chat.tftcomponents.com/appointment/${appointment.appointment_id}/EDIT`;
    const cancelURL =
      (await buildLink("CANCEL", appointment?.appointment_id)) ??
      `https://chat.tftcomponents.com/appointment/${appointment.appointment_id}/CANCEL`;

    ///////////////////////SENDING EMAIL TO CLIENT///////////////////////////

    const htmlData = (provider: any, firstName: string, lastName: string) => {
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
                ${getDateString(new Date(appointment.startDate), new Date(appointment.endDate), reqBody.offset)} 
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
                ">${getDuration(new Date(appointment.endDate), new Date(appointment.startDate))} min</p>
            
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
                ">${provider?.first_name} ${provider?.last_name} </p>
            
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

    let provider: any;
    if (users?.Items)
      for (let i of users?.Items) {
        if (i.user_id === reqBody.provider_id) {
          provider = i;
        }
      }

    var params = (recipientEmail: string, firstName: string, lastName: string) => {
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
        var sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
          .sendEmail(params(user.email, reqBody?.firstName ?? "", reqBody?.lastName ?? ""))
          .promise();
        await sendPromise;
      } else {
        var sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
          .sendEmail(params(provider?.email, provider?.first_name ?? '', provider?.last_name ?? ''))
          .promise();
        await sendPromise;
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(appointment),
    };
  } catch (e) {
    console.log(e);
    return handleError(e);
  }
};
