import PresentationAttendees, { PresentationAttendeesInterface } from "./PresentationAttendees";

export interface PresentationInterface {
  id: number,
  startTime: string,
  minuteDuration: number,
  classroom: string,
  attendees: PresentationAttendeesInterface;
}

export default class Presentation {
  private id: number;
  private startTime: string;
  private minuteDuration: number;
  private classroom: string;
  private attendees: PresentationAttendees;

  constructor(
    id: number,
    startTime: string,
    minuteDuration: number,
    classroom: string,
    attendees: PresentationAttendeesInterface,
  ) {
    this.id = id;
    this.startTime = startTime;
    this.minuteDuration = minuteDuration;
    this.classroom = classroom;
    this.attendees = PresentationAttendees.reinstantiate(attendees) as PresentationAttendees;
  }

  static reinstantiate(presentation: PresentationInterface): Presentation {
    return new Presentation(
      presentation.id,
      presentation.startTime,
      presentation.minuteDuration,
      presentation.classroom,
      presentation.attendees,
    );
  }

  public asObject(): PresentationInterface {
    return {
      id: this.id,
      startTime: this.startTime,
      minuteDuration: this.minuteDuration,
      classroom: this.classroom,
      attendees: this.attendees.asObject(),
    };
  }

  public getId(): number {
    return this.id;
  }

  public getStartTime(): string {
    return this.startTime;
  }

  public getMinuteDuration(): number {
    return this.minuteDuration;
  }

  public getClassroom(): string {
    return this.classroom;
  }

  public getAttendees(): PresentationAttendees {
    return this.attendees;
  }
}
