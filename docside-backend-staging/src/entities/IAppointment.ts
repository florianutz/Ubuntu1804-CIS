export interface IAppointment {
  appointment_id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  notes: string;
  usersIds: string[];
  event_type_id: string;
  provider_id: string;
  created_at?: Date;
  updated_at?: Date;
  firstName?: string;
  lastName?: string;
  offset: number;
}
