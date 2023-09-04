import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 } from "uuid";
import AWS from "aws-sdk";
import { handleError } from "../utils/customError";
import { IEventType } from "../entities/IEventType";

const docClient = new AWS.DynamoDB.DocumentClient();
const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};

export const createEventType = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    
    console.log(event?.requestContext?.authorizer?.claims)
    const { email } = event.requestContext?.authorizer?.claims
    const users = await docClient.scan({
      TableName: 'tft_users',
    }).promise();
    let user
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
    console.log(user)
    console.log('--------------------')
    const reqBody = JSON.parse(event.body as string) as IEventType;
    const eventType: IEventType = {
      ...reqBody,
      user_id:user.user_id,
      created_at: new Date(),
      updated_at: new Date(),
      event_type_id: v4(),
    };
    const eventTypeData = await docClient
      .put({
        TableName: "tft_event_type3_dev",
        Item: eventType,
        ReturnValues:"ALL_OLD"
      })
      .promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(eventType),
    };
  } catch (e) {
    console.log(e)
    return handleError(e);
  }
};
