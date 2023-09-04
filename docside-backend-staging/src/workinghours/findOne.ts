import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import IUser from "../entities/IUser";
import { IUserWorkingHours } from "../entities/IUserWorkingHours";
import { handleError } from "../utils/customError";

const docClient = new AWS.DynamoDB.DocumentClient();
const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*", // Allow from anywhere
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};

export const findMyWorkingHour = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    //1-FINDING USER making the request
    const { email } = event.requestContext?.authorizer?.claims
    const users = await docClient.scan({
      TableName: 'tft_users',
    }).promise();
    
    let user:IUser|undefined
    if(users?.Items)
    for(let i of users?.Items){
        if(i.email === email){
            user = i
        }
    }
    if (!user)
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "not authorized" })
      };
    //2-find the working hours of that user (working hour of the user above)
    const result = await docClient
      .scan({
        TableName: "tft_working_hors_dev",
      })
      .promise();
    
    const workingHours = result.Items as IUserWorkingHours[];
    let myWorkingHours:IUserWorkingHours|undefined
    for (const element of workingHours) {
      if (element.user_id === user.user_id) {
        myWorkingHours=element;
        break;
      }
    }
    // const eventType = await docClient
    //   .get({
    //     TableName: "tft_working_hors_dev",
    //     Key: {
    //       user_id: user.user_id,
    //     },
    //   })
    //   .promise();

    if (!myWorkingHours)
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "not found" }),
      };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(myWorkingHours),
    };
  } catch (e) {
    console.log(e)
    return handleError(e);
  }
};