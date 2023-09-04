import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 } from 'uuid';
import AWS from 'aws-sdk';
import { handleError } from "../utils/customError";
import { ICall } from "../entities/ICall";
import { IChannel } from "../entities/IChannel";

const docClient = new AWS.DynamoDB.DocumentClient()
const headers = {
  'content-type': 'application/json',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Origin': '*', // Allow from anywhere
  'Access-Control-Allow-Methods':
    'GET, POST, PATCH, PUT, DELETE, OPTIONS',
}

export const createChannel = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  try {
    const reqBody = JSON.parse(event.body as string) as IChannel
    const channel: IChannel = {
      ...reqBody,
      channel_id: v4()
    }
    const userData = await docClient.put({
      TableName: 'tft_channel',
      Item: channel
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(channel)
    };

  } catch (e) {
    return handleError(e)
  }

};
