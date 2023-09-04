import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { IUserWorkingHours } from "../entities/IUserWorkingHours";
import { handleError } from "../utils/customError";

const docClient = new AWS.DynamoDB.DocumentClient();
const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*", // Allow from anywhere
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};

export const updateMyWorkingHour = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    //1-find the user updating its working hours using auth token
    const reqBody = JSON.parse(event.body as string) as IUserWorkingHours;

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
    console.log(user);
    console.log("--------------------");
    
    //2-find the working hour to update (working hour of the user above)
    const workingHours = await docClient
      .scan({
        TableName: "tft_working_hors_dev",
      })
      .promise();
    let existingWorkingHour;
    if (workingHours?.Items)
      for (let i of workingHours?.Items) {
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
    const workingHoursData: IUserWorkingHours = {
      ...existingWorkingHour,
      ...reqBody,
      user_id: user.user_id,
      updated_at: new Date(),
    };
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
  } catch (e) {
    console.log(e);
    return handleError(e);
  }
};
