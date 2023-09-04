export interface IUserWorkingHours {
  working_hours_id?: string;
  user_id?: string;
  workingHours: IWorkingHours;
  timezone?: any;
  created_at?: Date;
  updated_at?: Date;
}

export interface ITimesAvailability {
  start: string;
  end: string;
  available: boolean;
}

export interface IAppointmentIntervals {
  Sun: {
    intervals: ITimesAvailability[];
  };
  Mon: {
    intervals: ITimesAvailability[];
  };
  Tue: {
    intervals: ITimesAvailability[];
  };
  Wed: {
    intervals: ITimesAvailability[];
  };
  Thu: {
    intervals: ITimesAvailability[];
  };
  Fri: {
    intervals: ITimesAvailability[];
  };
  Sat: {
    intervals: ITimesAvailability[];
  };
}

export interface ITimes {
  start: string;
  end: string;
}

export interface IWorkingHours {
  Sun: {
    enable?: boolean;
    times?: ITimes[];
  };
  Mon: {
    enable?: boolean;
    times?: ITimes[];
  };
  Tue: {
    enable?: boolean;
    times?: ITimes[];
  };
  Wed: {
    enable?: boolean;
    times?: ITimes[];
  };
  Thu: {
    enable?: boolean;
    times?: ITimes[];
  };
  Fri: {
    enable?: boolean;
    times?: ITimes[];
  };
  Sat: {
    enable?: boolean;
    times?: ITimes[];
  };
}
