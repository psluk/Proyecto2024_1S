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

const MAX_ATTEMPTS: number = 10;

interface ProfessorCapacity {
  name: string;
  capacity: number;
}

interface ProfessorsSuggestionsRow {
  professorId: number;
  name: string;
  students: number;
  suggestedStudents: number;
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
   * Retrieves a presentation from the database.
   * @param id The presentation ID.
   * @returns A Presentation object.
   */
  getPresentation(id: number): Presentation {
    return this.studentProfessorDao.getPresentation(id);
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
    let resolved: Presentation[] = [];
    let unresolved: StudentProfessorInterface[] = [];

    // Save the best schedule (max. number of assignments)
    let bestSchedule: PresentationInterface[] = [];

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      // Array for the presentation slots
      const presentationSlots: {
        startTime: Date;
        endTime: Date;
        classrooms: string[];
      }[] = [];

      // Array for every presentation once they're generated
      const schedule: PresentationInterface[] = [];

      // Load existing presentations
      const existingPresentations = this.getPresentations();

      // Retrieve the list of students and their professors
      const originalStudentProfessors = this.studentProfessorDao
        .getStudentsProfessors()
        .map((studentProfessor) => studentProfessor.asObject());

      // If not all students have a presentation, insert the existing ones into their respective slots
      if (existingPresentations.length < originalStudentProfessors.length) {
        existingPresentations.forEach((presentation) => {
          const existingStudentProfessor = originalStudentProfessors.find(
            (sp) =>
              sp.student.id === presentation.getAttendees().getStudent().id,
          );

          if (existingStudentProfessor) {
            const currentStartTime = new Date(presentation.getStartTime());
            const currentEndTime = new Date(currentStartTime);
            currentEndTime.setMinutes(
              currentEndTime.getMinutes() + presentation.getMinuteDuration(),
            );
            const currentClassroom = presentation.getClassroom();

            const existingSlot = presentationSlots.find(
              (slot) =>
                slot.startTime.getTime() === currentStartTime.getTime() &&
                slot.endTime.getTime() === currentEndTime.getTime(),
            );

            if (existingSlot) {
              if (!existingSlot.classrooms.includes(currentClassroom)) {
                existingSlot.classrooms.push(currentClassroom);
              }
            } else {
              presentationSlots.push({
                startTime: currentStartTime,
                endTime: currentEndTime,
                classrooms: [currentClassroom],
              });
            }

            schedule.push({
              id: existingStudentProfessor.id,
              student: existingStudentProfessor.student,
              professors: existingStudentProfessor.professors,
              startTime: currentStartTime,
              endTime: currentEndTime,
              classroom: currentClassroom,
            });
          }
        });
      }

      classrooms.forEach((classroom) => {
        classroom.schedule.forEach((classroomSchedule) => {
          const startTime = new Date(classroomSchedule.startTime);
          const endTime = new Date(classroomSchedule.endTime);

          // Create instances of the start and end of the lunch break
          const lunchBreakStart = new Date(
            convertApiDateToHtmlAttribute(classroomSchedule.startTime).split(
              "T",
            )[0] +
              "T" +
              lunchBreak.startTime,
          );
          const lunchBreakEnd = new Date(
            convertApiDateToHtmlAttribute(classroomSchedule.startTime).split(
              "T",
            )[0] +
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

            // If there is an overlapping presentation in the schedule, stop
            if (
              schedule.some(
                (presentation) =>
                  presentation.classroom
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase() ===
                    classroom.name
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .toLowerCase() &&
                  doDatesOverlap(
                    presentation.startTime,
                    presentation.endTime,
                    presentationStartTime,
                    presentationEndTime,
                  ),
              )
            ) {
              continue;
            }

            if (existingPresentation) {
              if (
                !existingPresentation.classrooms.find(
                  (c) =>
                    c
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .toLowerCase() ===
                    classroom.name
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .toLowerCase(),
                )
              ) {
                existingPresentation.classrooms.push(classroom.name);
              }
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

            // If there is an overlapping presentation in the schedule, stop
            if (
              schedule.some(
                (presentation) =>
                  presentation.classroom
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase() ===
                    classroom.name
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .toLowerCase() &&
                  doDatesOverlap(
                    presentation.startTime,
                    presentation.endTime,
                    presentationStartTime,
                    presentationEndTime,
                  ),
              )
            ) {
              continue;
            }

            if (existingPresentation) {
              if (
                !existingPresentation.classrooms.find(
                  (c) =>
                    c
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .toLowerCase() ===
                    classroom.name
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .toLowerCase(),
                )
              ) {
                existingPresentation.classrooms.push(classroom.name);
              }
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

      // Randomize the list of students
      const studentProfessors = shuffleArray(
        originalStudentProfessors.filter(
          (sp) => !schedule.some((p) => p.student.id === sp.student.id),
        ),
      );

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

      // If not all students have a presentation, try again
      // (happens if there are free slots and unassigned students)
      if (
        presentationSlots.reduce(
          (acc, presentation) => acc + presentation.classrooms.length,
          0,
        ) > 1 &&
        originalStudentProfessors.some(
          (sp) => !schedule.some((p) => p.student.id === sp.student.id),
        ) &&
        attempt < MAX_ATTEMPTS - 1
      ) {
        if (schedule.length > bestSchedule.length) {
          bestSchedule = JSON.parse(JSON.stringify(schedule)).map((p) =>
            // Re-instantiate Date objects
            ({
              ...p,
              startTime: new Date(p.startTime),
              endTime: new Date(p.endTime),
            }),
          );
        }
        continue;
      }

      // Add the presentations to the database
      this.studentProfessorDao.addPresentations(
        schedule.length > bestSchedule.length ? schedule : bestSchedule,
        true,
      );

      // Get the resolved presentations
      resolved = this.studentProfessorDao.getPresentations();

      unresolved = studentProfessors.filter(
        (sp) => !schedule.some((p) => p.student.id === sp.student.id),
      );

      break;
    }

    return { resolved, unresolved };
  }

  /**
   * Adds a presentation to the database.
   * @param studentId The student ID.
   * @param startTime The start time of the presentation.
   * @param duration The duration of the presentation.
   * @param classroom The classroom of the presentation.
   * @returns An object with the clashing professors and presentations, if any.
   */
  addPresentation(
    studentId: number,
    startTime: Date,
    duration: number,
    classroom: string,
  ): { clashingProfessors: string[]; clashingPresentations: Presentation[] } {
    // Check if there are clashes
    const currentPresentations = this.studentProfessorDao.getPresentations();

    // Get student professors
    const studentProfessors = this.studentProfessorDao
      .getStudentsProfessors()
      .find(
        (studentProfessor) => studentProfessor.getStudentId() === studentId,
      );

    if (!studentProfessors) {
      return { clashingProfessors: [], clashingPresentations: [] };
    }

    const startTimeDate = new Date(startTime);
    const endTime = new Date(startTimeDate);
    endTime.setMinutes(startTimeDate.getMinutes() + duration);

    const clashingProfessors: string[] = [];

    const clashingPresentations = currentPresentations.filter(
      (presentation) => {
        const presentationStartTime = new Date(presentation.getStartTime());
        const presentationEndTime = new Date(presentationStartTime);
        presentationEndTime.setMinutes(
          presentationEndTime.getMinutes() + presentation.getMinuteDuration(),
        );

        if (
          doDatesOverlap(
            startTimeDate,
            endTime,
            presentationStartTime,
            presentationEndTime,
          )
        ) {
          presentation
            .getAttendees()
            .getProfessors()
            .forEach((professor) => {
              if (
                studentProfessors
                  .getProfessors()
                  .map((p) => p.name)
                  .includes(professor.name) &&
                !clashingProfessors.includes(professor.name)
              ) {
                clashingProfessors.push(professor.name);
              }
            });

          return (
            presentation.getClassroom().toLowerCase() ===
            classroom.toLowerCase()
          );
        }

        return false;
      },
    );

    if (clashingProfessors.length > 0 || clashingPresentations.length > 0) {
      return { clashingProfessors, clashingPresentations };
    }

    // Add the presentation
    this.studentProfessorDao.addPresentation(
      studentId,
      startTime,
      duration,
      classroom,
    );

    return { clashingProfessors, clashingPresentations };
  }

  /**
   * Updates a presentation in the database.
   * @param presentationId The presentation ID.
   * @param startTime The start time of the presentation.
   * @param duration The duration of the presentation.
   * @param classroom The classroom of the presentation.
   * @returns An object with the clashing professors and presentations, if any.
   */
  updatePresentation(
    presentationId: number,
    startTime: Date,
    duration: number,
    classroom: string,
  ): {
    clashingProfessors: string[];
    clashingPresentations: Presentation[];
  } {
    // Check if there are clashes
    const currentPresentations = this.studentProfessorDao.getPresentations();

    // Get student professors
    const presentation = currentPresentations.find(
      (presentation) => presentation.getId() === presentationId,
    );

    if (!presentation) {
      return { clashingProfessors: [], clashingPresentations: [] };
    }

    const startTimeDate = new Date(startTime);
    const endTime = new Date(startTimeDate);
    endTime.setMinutes(startTimeDate.getMinutes() + duration);

    const clashingProfessors: string[] = [];

    const clashingPresentations = currentPresentations.filter(
      (otherPresentation) => {
        if (otherPresentation.getId() === presentationId) return false;

        const presentationStartTime = new Date(
          otherPresentation.getStartTime(),
        );
        const presentationEndTime = new Date(presentationStartTime);
        presentationEndTime.setMinutes(
          presentationEndTime.getMinutes() +
            otherPresentation.getMinuteDuration(),
        );

        if (
          otherPresentation.getId() !== presentationId &&
          doDatesOverlap(
            startTimeDate,
            endTime,
            presentationStartTime,
            presentationEndTime,
          )
        ) {
          otherPresentation
            .getAttendees()
            .getProfessors()
            .forEach((professor) => {
              if (
                presentation
                  .getAttendees()
                  .getProfessors()
                  .map((p) => p.name)
                  .includes(professor.name) &&
                !clashingProfessors.includes(professor.name)
              ) {
                clashingProfessors.push(professor.name);
              }
            });

          return (
            otherPresentation.getClassroom().toLowerCase() ===
            classroom.toLowerCase()
          );
        }

        return false;
      },
    );

    if (clashingProfessors.length > 0 || clashingPresentations.length > 0) {
      return { clashingProfessors, clashingPresentations };
    }

    // Update the presentation
    this.studentProfessorDao.updatePresentation(
      presentationId,
      startTime,
      duration,
      classroom,
    );

    return { clashingProfessors, clashingPresentations };
  }

  /**
   * Checks if there are any clashes between professors when swapping presentations.
   * @param presentationId1 The first presentation ID.
   * @param presentationId2 The second presentation ID.
   * @returns An array of clashing professors.
   */
  checkProfessorClashesWhenSwapping(
    presentationId1: number,
    presentationId2: number,
  ): string[][] {
    // Current presentations
    const currentPresentations = this.studentProfessorDao.getPresentations();

    // Check clashes for each swapped presentation
    return [presentationId1, presentationId2]
      .map((presentationId) => {
        // Check professors with clashing presentations
        const clashingProfessors: string[] = [];

        // Get presentation start time and end time
        let presentation = currentPresentations.find(
          (presentation) => presentation.getId() === presentationId,
        );

        const toBeSwappedWith = currentPresentations.find(
          // Get the other presentation in the array (as if they were swapped)
          (presentation) =>
            [presentationId1, presentationId2].includes(presentation.getId()) &&
            presentation.getId() !== presentationId,
        );

        if (!presentation || !toBeSwappedWith) return [];

        presentation = Presentation.reinstantiate({
          ...presentation.asObject(),
          startTime: toBeSwappedWith.getStartTime(),
          classroom: toBeSwappedWith.getClassroom(),
        });

        const startTime = new Date(presentation.getStartTime());
        const endTime = new Date(startTime);
        endTime.setMinutes(
          endTime.getMinutes() + presentation.getMinuteDuration(),
        );

        currentPresentations.forEach((otherPresentation) => {
          // Get start time and end time
          const otherStartTime = new Date(otherPresentation.getStartTime());
          const otherEndTime = new Date(otherStartTime);
          otherEndTime.setMinutes(
            otherEndTime.getMinutes() + otherPresentation.getMinuteDuration(),
          );

          if (
            otherPresentation.getId() === presentationId1 ||
            otherPresentation.getId() === presentationId2
          )
            return;

          otherPresentation
            .getAttendees()
            .getProfessors()
            .forEach((professor) => {
              if (
                presentation
                  .getAttendees()
                  .getProfessors()
                  .map((professor) => professor.name)
                  .includes(professor.name) &&
                doDatesOverlap(startTime, endTime, otherStartTime, otherEndTime)
              ) {
                clashingProfessors.push(professor.name);
              }
            });
        });

        return clashingProfessors;
      })
      .filter((p) => p.length > 0);
  }

  /**
   * Swaps two presentations.
   * @param presentationId1 The first presentation ID.
   * @param presentationId2 The second presentation ID.
   */
  swapPresentations(presentationId1: number, presentationId2: number): void {
    this.studentProfessorDao.swapPresentations(
      presentationId1,
      presentationId2,
    );
  }

  /**
   * Deletes a presentation
   * @param presentationId The presentation ID.
   */
  deletePresentation(presentationId: number): void {
    this.studentProfessorDao.deletePresentation(presentationId);
  }

  /**
   * Deletes all presentations
   */
  deletePresentations(): void {
    this.studentProfessorDao.deletePresentations();
  }

  /**
   * Gets the list of professors suggestions.
   * @returns An array of ProfessorsSuggestionsRow objects.
   */
  public getProfessorsSuggestions(): ProfessorsSuggestionsRow[] {
    return this.studentProfessorDao.getProfessorsSuggestions();
  }
}
