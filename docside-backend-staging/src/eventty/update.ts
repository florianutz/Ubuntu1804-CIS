import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { IEventType } from "../entities/IEventType";
import { handleError } from "../utils/customError";

const docClient = new AWS.DynamoDB.DocumentClient();
const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*", // Allow from anywhere
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};

export const updateEventType = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    const reqBody = JSON.parse(event.body as string) as IEventType;

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

    if (id) {
      // const eventType = await docClient
      //   .get({
      //     TableName: "tft_event_type1",
      //     Key: {
      //       id: id,
      //     },
      //   })
      //   .promise();

      // if (!eventType)
      //   return {
      //     statusCode: 404,
      //     headers,
      //     body: JSON.stringify({ error: "not found" }),
      //   };
      // console.log(eventType)
      // console.log(reqBody)
      // const eventTypeItem = eventType?.Item
      const eventTypeData: IEventType = {
        // ...eventTypeItem,
        ...reqBody,
        user_id:user.user_id,
        updated_at: new Date(),
        event_type_id: id,
      };
      console.log(eventTypeData)
      const eventTypeDataRes = await docClient
        .put({
          TableName: "tft_event_type3_dev",
          Item: eventTypeData,
        })
        .promise();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(eventTypeData),
      };
    }
    else{
      throw new Error("event type not found");
    }
  } catch (e) {
    console.log(e)
    return handleError(e);
  }
};