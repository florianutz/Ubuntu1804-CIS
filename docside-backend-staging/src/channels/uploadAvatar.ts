
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk';
import { IChannel } from "../entities/IChannel";
import IUser from "../entities/IUser";
import { handleError } from "../utils/customError";
import { parseFormData } from "../utils/parseFormData";
import { uploadFileToS3 } from "../utils/upload";

const docClient = new AWS.DynamoDB.DocumentClient()
const headers = {
    'content-type': 'application/json',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Origin': '*', // Allow from anywhere
    'Access-Control-Allow-Methods':
        'GET, POST, PATCH, PUT, DELETE, OPTIONS',
}

export const channelUploadAvatar = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const id = event.pathParameters?.id
        const reqBody = JSON.parse(event.body as string) as IChannel

        const { file } = await parseFormData(event);

        if (!file) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: "file not found" })
            };
        }

        const channel = await docClient.get({
            TableName: 'tft_channel',
            Key: {
                channel_id: id
            }
        }).promise();

        if (!channel)
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: "not found" })
            };

        const url = await uploadFileToS3(file);

        if (url) {
            const channelData: IChannel = {
                ...channel,
                ...reqBody,
                channel_id: id as string,
                photo: url as string
            }

            const channelRes = await docClient.put({
                TableName: 'tft_channel',
                Item: channelData
            }).promise();

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(channelRes)
            };
        } else
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: "Updating error" })
            };
    } catch (e) {
        return handleError(e)
    }

};