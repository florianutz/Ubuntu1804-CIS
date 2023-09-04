import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { IEventType } from "../entities/IEventType";
import IUser from "../entities/IUser";
import { handleError } from "../utils/customError";

const docClient = new AWS.DynamoDB.DocumentClient();
const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*", // Allow from anywhere
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};
export const findAllEventTypes = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
        TableName: "tft_event_type3_dev",
      })
      .promise();
    
    const eventTypes = result.Items as IEventType[];
    const toResult = [];
    for (const element of eventTypes) {
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
