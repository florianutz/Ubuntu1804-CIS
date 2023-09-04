"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.divideIntervals = void 0;
const divideIntervals = (workingHours, eventType, eventTypeAppointments, offset, appointmentDate) => {
    var _a, _b, _c, _d, _e, _f;
    const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const intervals = {
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
    console.log(appointmentDate);
    if (workingHours && (eventType === null || eventType === void 0 ? void 0 : eventType.durationMin)) {
        for (const j of Object.keys(workingHours.workingHours)) {
            //if there is an appointment date just give me the intervals of that date
            if (appointmentDate) {
                const appointmentTime = appointmentDate;
                const appointmentDay = dayMap[appointmentTime.getDay()];
                if (appointmentDay !== j) {
                    continue;
                }
            }
            if (!((_b = (_a = workingHours === null || workingHours === void 0 ? void 0 : workingHours.workingHours) === null || _a === void 0 ? void 0 : _a[j]) === null || _b === void 0 ? void 0 : _b.enable)) {
                continue;
            }
            const appointmentsInTheDay = eventTypeAppointments === null || eventTypeAppointments === void 0 ? void 0 : eventTypeAppointments.filter((appointment) => {
                const appointmentTime = new Date(appointment.startDate);
                if (offset)
                    appointmentTime.setMinutes(appointmentTime.getMinutes() - offset);
                const appointmentDay = dayMap[appointmentTime.getDay()];
                return appointmentDay === j;
            });
            const timesToIterate = (_d = (_c = workingHours === null || workingHours === void 0 ? void 0 : workingHours.workingHours) === null || _c === void 0 ? void 0 : _c[j]) === null || _d === void 0 ? void 0 : _d.times;
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
                        const appointment = appointmentsInTheDay === null || appointmentsInTheDay === void 0 ? void 0 : appointmentsInTheDay.find((appointment) => {
                            //need to compare appointment time with time-slot time in a common timezone
                            const appointmentToCommonDate = new Date(appointment.startDate).toLocaleString("en-US", {
                                timeZone: "UTC",
                            });
                            const tempStartCommonDate = new Date(tempStart.toLocaleString("en-US", { timeZone: "UTC" }));
                            const startTimeToCompare = new Date(new Date(appointmentToCommonDate).getFullYear(), new Date(appointmentToCommonDate).getMonth(), new Date(appointmentToCommonDate).getDate(), tempStartCommonDate.getHours(), tempStartCommonDate.getMinutes());
                            return new Date(appointmentToCommonDate).getTime() === startTimeToCompare.getTime();
                        });
                        let available = true;
                        if (appointment && ((_e = appointment === null || appointment === void 0 ? void 0 : appointment.usersIds) === null || _e === void 0 ? void 0 : _e.length) - 1 >= eventType.maxAttendees) {
                            if (appointmentDate &&
                                appointmentDate.getDate() === new Date(appointment.startDate).getDate() &&
                                appointmentDate.getMonth() === new Date(appointment.startDate).getMonth() &&
                                appointmentDate.getFullYear() === new Date(appointment.startDate).getFullYear()) {
                                available = false;
                            }
                        }
                        const newInterval = {
                            start: tempStart.toISOString(),
                            end: new Date(tempStart.getTime() + (eventType === null || eventType === void 0 ? void 0 : eventType.durationMin) * 60000).toISOString(),
                            available: available,
                        };
                        (_f = intervals === null || intervals === void 0 ? void 0 : intervals[j]) === null || _f === void 0 ? void 0 : _f.intervals.push(newInterval);
                        tempStart = new Date(tempStart.getTime() + (eventType === null || eventType === void 0 ? void 0 : eventType.durationMin) * 60000);
                    }
                }
            }
        }
    }
    return intervals;
};
exports.divideIntervals = divideIntervals;
//# sourceMappingURL=divideIntervals.js.map