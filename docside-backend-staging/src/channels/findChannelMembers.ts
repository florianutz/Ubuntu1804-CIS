import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { handleError } from "../utils/customError";
import IUser, { IUsersArns } from "../entities/IUser";

const docClient = new AWS.DynamoDB.DocumentClient();
const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*", // Allow from anywhere
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};

type IChannelMembers = {
  name: string;
  cognito_id: string;
};

type IChannelMembersWithChime = {
  channel_member_names: IChannelMembers[];
};

export const findChannelMembers = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const reqBody = JSON.parse(event.body as string) as IUsersArns;
  try {
    /**scan the users to find the members of the channel */

    var titleObject: { [k: string]: any } = {};
    var index = 0;

    reqBody?.users_arns.forEach((userArn) => {
      index++;
      var titleKey = ":titlevalue" + index;
      titleObject[titleKey.toString()] = userArn;
    });

    const result = await docClient
      .scan({
        TableName: "tft_users",
        FilterExpression: "cognito_id IN (" + Object.keys(titleObject).toString() + ")",
        ExpressionAttributeValues: titleObject,
      })
      .promise();

    const users = result.Items as IUser[];
    
    const userNames: IChannelMembers[] = users.map((user) => {
      const member: IChannelMembers = {
        name: `${user?.first_name} ${user?.last_name} `,
        cognito_id: user?.cognito_id ?? '',
      };
      return member;
    });
    const members: IChannelMembersWithChime={
      channel_member_names:userNames
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(members),
    };
  } catch (e) {
    return handleError(e);
  }
};
