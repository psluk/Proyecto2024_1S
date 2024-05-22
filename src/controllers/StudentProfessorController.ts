import StudentProfessorDao from "../database/StudentProfessorDao";
import StudentProfessor, {
  StudentProfessorInterface,
} from "../models/StudentProfessor";
import {
  Classroom,
  PresentationInterface,
} from "../interfaces/PresentationGeneration";
import Presentation from "../models/Presentation";
import { convertApiDateToHtmlAttribute } from "../renderer/src/utils/DateFormatters";
import { shuffleArray } from "../utils/Shuffle";
import { doDatesOverlap } from "../utils/DateOverlap";

interface ProfessorCapacity {
  name: string;
  capacity: number;
}

export default class StudentProfessorController {
  private studentProfessorDao: StudentProfessorDao;

  constructor() {
    this.studentProfessorDao = new StudentProfessorDao();
  }

  /**
   * Gets all students and their professors.
   * @returns An array of StudentProfessor objects.
   */
  public getStudentsProfessors(): StudentProfessor[] {
    return this.studentProfessorDao.getStudentsProfessors();
  }

  /**
   * Generates random professors assignments.
   * It will assign a random advisor to students that don't have one.
   */
  public generateRandomProfessorsAssigments(): void {
    const students = this.studentProfessorDao.getStudentsProfessors();
    const professorsSuggestions =
      this.studentProfessorDao.getProfessorsSuggestions();

    const professorCapacities = new Map<number, ProfessorCapacity>(
      professorsSuggestions.map((prof) => [
        prof.professorId,
        {
          name: prof.name,
          capacity: prof.suggestedStudents - prof.students,
        },
      ]),
    );

    const studentsNeedingProfessors = students.filter(
      (student) => student.getProfessors().length < 3,
    );

    if (studentsNeedingProfessors.length === 0) {
      return;
    }

    const shuffledProfessors = [...professorsSuggestions].sort(
      () => 0.5 - Math.random(),
    );
    const shuffledStudents = [...studentsNeedingProfessors].sort(
      () => 0.5 - Math.random(),
    );

    shuffledStudents.forEach((student) => {
      const currentProfessors = student.getProfessors();
      const advisor = currentProfessors.find((prof) => prof.isAdvisor);
      const currentReaders = currentProfessors.filter(
        (prof) => !prof.isAdvisor,
      );

      if (!advisor) {
        const potentialAdvisor = shuffledProfessors.find(
          (prof) => professorCapacities.get(prof.professorId)!.capacity > 0,
        );
        if (potentialAdvisor) {
          student.addProfessor({
            id: potentialAdvisor.professorId,
            name: potentialAdvisor.name,
            isAdvisor: true,
          });
          professorCapacities.get(potentialAdvisor.professorId)!.capacity -= 1;
        }
      }

      let readersNeeded = 2 - currentReaders?.length;
      const potentialReaders = shuffledProfessors.filter((prof) =>
        student.getProfessors().every((p) => p.id !== prof.professorId),
      );

      while (readersNeeded > 0 && potentialReaders.length > 0) {
        potentialReaders.sort(() => 0.5 - Math.random());
        const readerIndex = Math.floor(Math.random() * potentialReaders.length);
        const reader = potentialReaders.splice(readerIndex, 1)[0];
        student.addProfessor({
          id: reader.professorId,
          name: reader.name,
          isAdvisor: false,
        });
        readersNeeded--;
      }

      for (const prof of student.getProfessors()) {
        this.studentProfessorDao.assignProfessor(
          student.getStudentId(),
          prof.id,
          prof.isAdvisor,
        );
      }
    });
  }

  public deleteProfessorsAssigments(): void {
    this.studentProfessorDao.deleteProfessorsAssigments();
  }

  /**
   * Deletes a student-professor relationship.
   * @param studentProfessorId
   */
  public deleteStudentProfessor(studentProfessorId: number | null): void {
    this.studentProfessorDao.deleteStudentProfessor(studentProfessorId);
  }

  /**
   * Updates the professors of a student.
   * @param studentId
   * @param profesorGuia
   * @param profesorLector1
   * @param profesorLector2
   */
  public updateStudentProfessor(
    studentId: number,
    profesorGuia: number,
    profesorLector1: number,
    profesorLector2: number,
  ): void {
    this.studentProfessorDao.updateStudentProfessor(
      studentId,
      profesorGuia,
      profesorLector1,
      profesorLector2,
    );
  }

  /**
   * Updates the advisor of an activity.
   * @param oldAdvisorId
   * @param newAdvisorId
   */
  public updateActivityAdvisor(
    oldAdvisorId: number,
    newAdvisorId: number,
  ): void {
    this.studentProfessorDao.updateActivityAdvisor(oldAdvisorId, newAdvisorId);
  }

  /**
   * Updates the lector of an activity.
   * @param oldLector
   * @param newLector
   */
  public updateActivityLector(oldLectorId: number, newLectorId: number): void {
    this.studentProfessorDao.updateActivityLector(oldLectorId, newLectorId);
  }

  /**
   * Retrieves the list of presentations.
   * @returns An array of Presentation objects.
   */
  public getPresentations(): Presentation[] {
    return this.studentProfessorDao.getPresentations();
  }

  /**
   * Generates presentations for students.
   * @param classrooms The list of classrooms
   * @param presentationInterval The interval between presentations in minutes
   * @param lunchBreak The lunch break time
   */
  public generatePresentations(
    classrooms: Classroom[],
    presentationInterval: number,
    lunchBreak: {
      startTime: string;
      endTime: string;
    },
  ): { resolved: Presentation[]; unresolved: StudentProfessorInterface[] } {
    // Generate presentation slots
    const presentationSlots: {
      startTime: Date;
      endTime: Date;
      classrooms: string[];
    }[] = [];

    classrooms.forEach((classroom) => {
      classroom.schedule.forEach((schedule) => {
        const startTime = new Date(schedule.startTime);
        const endTime = new Date(schedule.endTime);

        // Create instances of the start and end of the lunch break
        const lunchBreakStart = new Date(
          convertApiDateToHtmlAttribute(schedule.startTime).split("T")[0] +
            "T" +
            lunchBreak.startTime,
        );
        const lunchBreakEnd = new Date(
          convertApiDateToHtmlAttribute(schedule.startTime).split("T")[0] +
            "T" +
            lunchBreak.endTime,
        );

        let presentationsBeforeLunch: number;
        let presentationsAfterLunch: number;

        // If the lunch starts and ends at the same time, it means there is no lunch break
        if (lunchBreakStart.getTime() === lunchBreakEnd.getTime()) {
          presentationsBeforeLunch = Math.floor(
            (endTime.getTime() - startTime.getTime()) /
              (presentationInterval * 60000),
          );
          presentationsAfterLunch = 0;
        } else {
          // Calculate presentations before and after lunch break
          presentationsBeforeLunch = Math.max(
            Math.floor(
              (Math.min(lunchBreakStart.getTime(), endTime.getTime()) -
                startTime.getTime()) /
                (presentationInterval * 60000),
            ),
            0,
          );
          presentationsAfterLunch = Math.max(
            Math.floor(
              (endTime.getTime() -
                Math.max(lunchBreakEnd.getTime(), startTime.getTime())) /
                (presentationInterval * 60000),
            ),
            0,
          );
        }

        // Generate presentations before lunch break
        for (let i = 0; i < presentationsBeforeLunch; i++) {
          const presentationStartTime = new Date(
            startTime.getTime() + i * presentationInterval * 60000,
          );
          const presentationEndTime = new Date(
            presentationStartTime.getTime() + presentationInterval * 60000,
          );

          const existingPresentation = presentationSlots.find(
            (p) =>
              p.startTime.getTime() === presentationStartTime.getTime() &&
              p.endTime.getTime() === presentationEndTime.getTime(),
          );

          if (existingPresentation) {
            existingPresentation.classrooms.push(classroom.name);
          } else {
            presentationSlots.push({
              startTime: presentationStartTime,
              endTime: presentationEndTime,
              classrooms: [classroom.name],
            });
          }
        }

        // Generate presentations after lunch break
        for (let i = 0; i < presentationsAfterLunch; i++) {
          const presentationStartTime = new Date(
            Math.max(lunchBreakEnd.getTime(), startTime.getTime()) +
              i * presentationInterval * 60000,
          );
          const presentationEndTime = new Date(
            presentationStartTime.getTime() + presentationInterval * 60000,
          );
          const existingPresentation = presentationSlots.find(
            (p) =>
              p.startTime.getTime() === presentationStartTime.getTime() &&
              p.endTime.getTime() === presentationEndTime.getTime(),
          );

          if (existingPresentation) {
            existingPresentation.classrooms.push(classroom.name);
          } else {
            presentationSlots.push({
              startTime: presentationStartTime,
              endTime: presentationEndTime,
              classrooms: [classroom.name],
            });
          }
        }
      });
    });

    // Retrieve the list of students and their professors
    const originalStudentProfessors = this.studentProfessorDao
      .getStudentsProfessors()
      .map((studentProfessor) => studentProfessor.asObject());

    // Randomize the list of students
    const studentProfessors = shuffleArray(originalStudentProfessors);

    // Assign presentations to classrooms

    const schedule: PresentationInterface[] = [];

    for (const studentProfessor of studentProfessors) {
      for (const slot of presentationSlots) {
        const availableClassroom = slot.classrooms.find((classroom) => {
          // A room that is free
          const isRoomFree = !schedule.some(
            (presentation) =>
              presentation.classroom === classroom &&
              doDatesOverlap(
                slot.startTime,
                slot.endTime,
                presentation.startTime,
                presentation.endTime,
              ),
          );

          // No professors are in a different presentation at the same time
          const areProfessorsFree = !schedule.some((presentation) =>
            presentation.professors.some((professor) =>
              studentProfessor.professors.some(
                (p) =>
                  p.id === professor.id &&
                  doDatesOverlap(
                    slot.startTime,
                    slot.endTime,
                    presentation.startTime,
                    presentation.endTime,
                  ),
              ),
            ),
          );

          return isRoomFree && areProfessorsFree;
        });

        if (availableClassroom) {
          schedule.push({
            id: studentProfessor.id,
            student: studentProfessor.student,
            professors: studentProfessor.professors,
            startTime: slot.startTime,
            endTime: slot.endTime,
            classroom: availableClassroom,
          });

          slot.classrooms = slot.classrooms.filter(
            (classroom) => classroom !== availableClassroom,
          );
          break;
        }
      }
    }

    // Add the presentations to the database
    this.studentProfessorDao.addPresentations(schedule, true);

    // Get the resolved presentations
    const resolved = this.studentProfessorDao.getPresentations();

    const unresolved = studentProfessors.filter(
      (sp) => !schedule.some((p) => p.student.id === sp.student.id),
    );

    return { resolved, unresolved };
  }
}
