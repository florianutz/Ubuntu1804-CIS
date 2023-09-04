import { IAppointment } from "../entities/IAppointment";
import { IEventType } from "../entities/IEventType";
import {
  IAppointmentIntervals,
  ITimesAvailability,
  IUserWorkingHours,
  IWorkingHours,
} from "../entities/IUserWorkingHours";

export const divideIntervals = (
  workingHours?: IUserWorkingHours,
  eventType?: IEventType,
  eventTypeAppointments?: IAppointment[],
  offset?: number,
  appointmentDate?: Date,
): IAppointmentIntervals => {
  const dayMap: any = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const intervals: IAppointmentIntervals = {
    Sun: {
      intervals: [],
    },
    Mon: {
      intervals: [],
    },
    Tue: {
      intervals: [],
    },
    Wed: {
      intervals: [],
    },
    Thu: {
      intervals: [],
    },
    Fri: {
      intervals: [],
    },
    Sat: {
      intervals: [],
    },
  };
  console.log(appointmentDate)
  if (workingHours && eventType?.durationMin) {
    for (const j of Object.keys(workingHours.workingHours)) {
      //if there is an appointment date just give me the intervals of that date
      if (appointmentDate) {
        const appointmentTime = appointmentDate;
        const appointmentDay = dayMap[appointmentTime.getDay()];
        if (appointmentDay !== j) {
          continue;
        }
      }
      if (!workingHours?.workingHours?.[j as keyof IWorkingHours]?.enable) {
        continue;
      }
      const appointmentsInTheDay = eventTypeAppointments?.filter((appointment) => {
        const appointmentTime = new Date(appointment.startDate);
        if (offset) appointmentTime.setMinutes(appointmentTime.getMinutes() - offset);
        const appointmentDay = dayMap[appointmentTime.getDay()];
        return appointmentDay === j;
      });
      const timesToIterate = workingHours?.workingHours?.[j as keyof IWorkingHours]?.times;
      if (timesToIterate) {
        for (const i of timesToIterate) {
          if (new Date(i.start).getTime() > new Date(i.end).getTime()) {
            continue;
          }
          let tempStart = new Date(i.start);
          const endDate = new Date(i.start);
          endDate.setHours(new Date(i.end).getHours());
          endDate.setMinutes(new Date(i.end).getMinutes());
          if (tempStart.getTime() > endDate.getTime()) {
            endDate.setDate(endDate.getDate() + 1);
          }
          while (tempStart.getTime() < endDate.getTime()) {
            const appointment = appointmentsInTheDay?.find((appointment) => {
              //need to compare appointment time with time-slot time in a common timezone
              const appointmentToCommonDate = new Date(appointment.startDate).toLocaleString("en-US", {
                timeZone: "UTC",
              });
              const tempStartCommonDate = new Date(tempStart.toLocaleString("en-US", { timeZone: "UTC" }))
              const startTimeToCompare = new Date(
                new Date(appointmentToCommonDate).getFullYear(),
                new Date(appointmentToCommonDate).getMonth(),
                new Date(appointmentToCommonDate).getDate(),
                tempStartCommonDate.getHours(),
                tempStartCommonDate.getMinutes(),
              );
              return new Date(appointmentToCommonDate).getTime() === startTimeToCompare.getTime();
            });
            let available = true;
            if (appointment && appointment?.usersIds?.length - 1 >= eventType.maxAttendees) {
              if (
                appointmentDate &&
                appointmentDate.getDate() === new Date(appointment.startDate).getDate() &&
                appointmentDate.getMonth() === new Date(appointment.startDate).getMonth() &&
                appointmentDate.getFullYear() === new Date(appointment.startDate).getFullYear()
              ) {
                available = false;
              }
            }
            const newInterval: ITimesAvailability = {
              start: tempStart.toISOString(),
              end: new Date(tempStart.getTime() + eventType?.durationMin * 60000).toISOString(),
              available: available,
            };
            intervals?.[j as keyof IWorkingHours]?.intervals.push(newInterval);
            tempStart = new Date(tempStart.getTime() + eventType?.durationMin * 60000);
          }
        }
      }
    }
  }
  return intervals;
};
