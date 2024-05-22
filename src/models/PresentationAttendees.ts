export interface PresentationAttendeesInterface {
  id: number;
  student: {
    id: number;
    name: string;
    email: string;
  };
  professors: {
    id: number;
    name: string;
    email: string;
    isAdvisor: boolean;
  }[];
}

export default class PresentationAttendees {
  private id: number;
  private student: {
    id: number;
    name: string;
    email: string;
  };
  private professors: {
    id: number;
    name: string;
    email: string;
    isAdvisor: boolean;
  }[];

  constructor(
    id: number,
    student: {
      id: number;
      name: string;
      email: string;
    },
    professors: {
      id: number;
      name: string;
      email: string;
      isAdvisor: boolean;
    }[],
  ) {
    this.id = id;
    this.student = student;
    this.professors = professors;
  }

  static reinstantiate(
    presentationAttendees: PresentationAttendeesInterface | null,
  ): PresentationAttendees | null {
    if (!presentationAttendees) {
      return null;
    }
    return new PresentationAttendees(
      presentationAttendees.id,
      presentationAttendees.student,
      presentationAttendees.professors,
    );
  }

  public asObject(): PresentationAttendeesInterface {
    return {
      id: this.id,
      student: this.student,
      professors: this.professors,
    };
  }

  public getId(): number {
    return this.id;
  }

  public getStudent(): {
    id: number;
    name: string;
    email: string;
  } {
    return this.student;
  }

  public getProfessors(): {
    id: number;
    name: string;
    email: string;
    isAdvisor: boolean;
  }[] {
    return this.professors;
  }
}
