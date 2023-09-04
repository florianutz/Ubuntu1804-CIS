export const getDuration = (endDate: Date, startDate: Date) => {
  const duration = (endDate.getTime() - startDate.getTime()) / 60000;
  return duration;
};

export const monthMap: any = {
  0: "January",
  1: "February",
  2: "March",
  3: "April",
  4: "May",
  5: "June",
  6: "July",
  7: "August",
  8: "September",
  9: "October",
  10: "November",
  11: "December",
};

export const dayMap: any = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const getDateString = (start: Date, end: Date, offset: number) => {
  try {
    const startDateToDisplay = new Date(start)
    const endDateToDisplay = new Date(end)
    startDateToDisplay.setMinutes(startDateToDisplay.getMinutes()-offset)
    endDateToDisplay.setMinutes(endDateToDisplay.getMinutes()-offset)

    //start date to display in email
    const hoursStart = startDateToDisplay.getHours();
    const minStart = startDateToDisplay.getMinutes() < 10 ? "0" + startDateToDisplay.getMinutes() : startDateToDisplay.getMinutes();
    const ampmStart = hoursStart < 12 ? "am" : "pm";

    //end date to display in email
    const hoursEnd = endDateToDisplay.getHours();
    const minEnd = endDateToDisplay.getMinutes() < 10 ? "0" + endDateToDisplay.getMinutes() : endDateToDisplay.getMinutes();
    const ampmEnd = hoursEnd < 12 ? "am" : "pm";
    
    const dayMonthAndDayString = `${dayMap[startDateToDisplay.getDay()]}, ${
      monthMap[startDateToDisplay.getMonth()]
    } ${startDateToDisplay.getDate()} ·`

    return `${dayMonthAndDayString} ${hoursStart < 12 ? hoursStart : hoursStart - 12}:${minStart} ${ampmStart} - ${
      hoursEnd < 12 ? hoursEnd : hoursEnd - 12
    }:${minEnd} ${ampmEnd}`;
  
  } catch (error) {
    return ``;
  }
};
