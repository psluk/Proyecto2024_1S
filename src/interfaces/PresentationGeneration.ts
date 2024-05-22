import { StudentProfessorInterface } from "../models/StudentProfessor";

export interface Classroom {
  name: string;
  schedule: {
    startTime: string;
    endTime: string;
  }[];
}

export interface PresentationInterface extends StudentProfessorInterface {
  startTime: Date;
  endTime: Date;
  classroom: string;
}
