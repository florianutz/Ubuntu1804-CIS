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
export const findAllAppointment = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log(event.queryStringParameters);
    const startDateParam = event.queryStringParameters?.startDate;
    const endDateParam = event.queryStringParameters?.endDate;

    const { email } = event.requestContext?.authorizer?.claims;

    // find user making the request
    const users = await docClient
      .scan({
        TableName: "tft_users",
      })
      .promise();

    let user: IUser | undefined;
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

   
    //find All appointments that the users belongs to
    const result = await docClient
      .scan({
        TableName: "tft_appointment_dev",
      })
      .promise();

    const appointments = result.Items as IAppointment[];
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
      if (user?.user_id && element.usersIds.find((userId) => userId === user?.user_id)) {
        if (
          startDate &&
          new Date(element.startDate).getTime() > startDate?.getTime() &&
          endDate &&
          new Date(element.startDate).getTime() < endDate?.getTime()
        ) {
          toResult.push(element);
        }
      }
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(toResult),
    };
  } catch (e) {
    console.log(e);
    return handleError(e);
  }
};
