
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk';
import IUser from "../entities/IUser";
import { handleError } from "../utils/customError";
import { parseFormData } from "../utils/parseFormData";
import { uploadFileToS3 } from "../utils/upload";

const docClient = new AWS.DynamoDB.DocumentClient()
const headers = {
    'content-type': 'multipart/form-data',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Origin': '*', // Allow from anywhere
    'Access-Control-Allow-Methods':
        'GET, POST, PATCH, PUT, DELETE, OPTIONS',
}

export const userUploadAvatar = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const id = event.pathParameters?.id
        const reqBody = JSON.parse(event.body as string) as IUser

        const { file } = await parseFormData(event);

        if (!file) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: "file not found" })
            };
        }

        const user = await docClient.get({
            TableName: 'tft_users',
            Key: {
                user_id: id
            }
        }).promise();

        if (!user)
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: "not found" })
            };

        const url = await uploadFileToS3(file);

        if (url) {
            const userData: IUser = {
                ...user,
                ...reqBody,
                updated_at: new Date(),
                user_id: id,
                photo: url as string
            }

            const userRes = await docClient.put({
                TableName: 'tft_users',
                Item: userData
            }).promise();

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(userRes)
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