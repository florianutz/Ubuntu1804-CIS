import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { IEventType } from "../entities/IEventType";
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
export const findAllWorkingHours = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {

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

    const result = await docClient
      .scan({
        TableName: "tft_working_hors_dev",
      })
      .promise();
    
    const workingHours = result.Items as IUserWorkingHours[];
    const toResult = [];
    for (const element of workingHours) {
      if (element.user_id === user.user_id) {
        toResult.push(element)
      }
    }
    console.log(toResult)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(toResult),
    };
  } catch (e) {
    console.log(e)
    return handleError(e);
  }
};
