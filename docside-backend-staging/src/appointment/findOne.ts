import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { IAppointment } from "../entities/IAppointment";
import IUser from "../entities/IUser";
import { handleError } from "../utils/customError";

const docClient = new AWS.DynamoDB.DocumentClient();
const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*", // Allow from anywhere
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};

export const findOneAppointment = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;

    //1111find the appointment needed11111
    const appointment = await docClient
      .get({
        TableName: "tft_appointment_dev",
        Key: {
          appointment_id: id,
        },
      })
      .promise();

    console.log("-----------------------");
    console.log(appointment);

    if (!appointment)
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "not found" }),
      };

    //22222find the users of the appointment22222222
    const usersIds = (appointment?.Item as IAppointment)?.usersIds;
    console.log(usersIds);

    const users = await docClient
      .scan({
        TableName: "tft_users",
      })
      .promise();
    const usersItems = users.Items as IUser[];
    let attendees: IUser[] = [];
    for (const id of usersIds) {
      const attendee = usersItems.find((user) => user.user_id === id);
      if (attendee) attendees.push(attendee);
    }
    
    console.log("-----------------------");
    console.log(attendees);

    const response = {
      appointment: appointment,
      attendees: attendees,
    };
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (e) {
    console.log(e)
    return handleError(e);
  }
};
