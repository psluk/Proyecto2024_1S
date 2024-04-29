import { CourseInterface } from "../models/Course";

export const projectCourses = ["CM4300", "CM5300", "CM5331"];
export const ignoredCourses = ["CM4300"];
export const projectCourseHours: CourseInterface[] = [
  {
    id: null,
    type: "Project",
    code: "CM5300",
    name: "Proyecto Final de Graduación",
    hours: 2,
  },
  {
    id: null,
    type: "Project",
    code: "CM5331",
    name: "Proyecto de Graduación (tribunal)",
    hours: 0,
  },
];
