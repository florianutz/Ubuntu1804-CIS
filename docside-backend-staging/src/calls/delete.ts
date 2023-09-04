import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk';
import { handleError } from "../utils/customError";

const docClient = new AWS.DynamoDB.DocumentClient()
const headers = {
  'content-type' : 'application/json',
  'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*', // Allow from anywhere
        'Access-Control-Allow-Methods':
          'GET, POST, PATCH, PUT, DELETE, OPTIONS',
}

export const deleteCall = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try{
    const id = event.pathParameters?.id

    const call = await docClient.delete({
      TableName: 'tft_call',
      Key: {
        call_id: id
      }
    }).promise();
  
    if (!call)
      return {
        statusCode: 404,
        body: JSON.stringify("Call not found")
      };
  
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify("Call deleted")
    };
  }catch(e){
    return handleError(e)
  }
  
};