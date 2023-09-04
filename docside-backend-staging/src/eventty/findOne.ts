import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { IAppointment } from "../entities/IAppointment";
import { IEventType } from "../entities/IEventType";
import IUser from "../entities/IUser";
import { IUserWorkingHours } from "../entities/IUserWorkingHours";
import { handleError } from "../utils/customError";
import { divideIntervals } from "../utils/divideIntervals";

const docClient = new AWS.DynamoDB.DocumentClient();
const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*", // Allow from anywhere
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};

export const findOneEventType = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;

    //1111find the event type needed11111
    const eventType = await docClient
      .get({
        TableName: "tft_event_type3_dev",
        Key: {
          event_type_id: id,
        },
      })
      .promise();


    if (!eventType)
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "not found" }),
      };

    //22222find the provider of the event type22222222
    const provider_id = eventType?.Item?.user_id;

    const users = await docClient
      .scan({
        TableName: "tft_users",
      })
      .promise();
    const usersItems = users.Items as IUser[];
    let provider: IUser | undefined;
    for (const element of usersItems) {
      if (element.user_id === provider_id) {
        provider = element;
        break;
      }
    }
    if (!provider)
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "provider not found" }),
      };

    //33333333find the working hours of that user333333
    const result = await docClient
      .scan({
        TableName: "tft_working_hors_dev",
      })
      .promise();

    const workingHours = result.Items as IUserWorkingHours[];
    let myWorkingHours: IUserWorkingHours | undefined;
    for (const element of workingHours) {
      if (element.user_id === provider.user_id) {
        myWorkingHours = element;
        break;
      }
    }

    /////////////////////////////////////////////
    const appointmentsResult = await docClient
      .scan({
        TableName: "tft_appointment_dev",
      })
      .promise();
    const appointments = appointmentsResult.Items as IAppointment[];
    const eventTypeAppointments:IAppointment[] = []
    for (const element of appointments) {
      if (element.event_type_id === eventType?.Item?.event_type_id) {
        eventTypeAppointments.push(element)
      }
    }
    const offset = event.queryStringParameters?.offset ?? 0;
    let appointmentDate: Date | undefined
    if(event.queryStringParameters?.appointmentDate){
      appointmentDate = new Date(event.queryStringParameters?.appointmentDate);
      appointmentDate.setMinutes(appointmentDate.getMinutes()-(+offset))
      
    }
    
    const intervals = divideIntervals(myWorkingHours, eventType?.Item as IEventType,eventTypeAppointments,+offset,appointmentDate)
    /////////////////////////////////////////////
    const response = {
      workingHours: myWorkingHours,
      eventType: eventType,
      provider: provider,
      intervals: intervals
    };
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (e) {
    return handleError(e);
  }
};
