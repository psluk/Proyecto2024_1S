import StudentProfessorDao from "../database/StudentProfessorDao";
import StudentProfessor from "../models/StudentProfessor";

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
  getStudentsProfessors(): StudentProfessor[] {
    return this.studentProfessorDao.getStudentsProfessors();
  }

  generateRandom(): void {
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

      // Guardar actualizaciones de cada estudiante
      for (const prof of student.getProfessors()) {
        this.studentProfessorDao.assignProfessor(
          student.getStudentId(),
          prof.id,
          prof.isAdvisor,
        );
      }
    });
  }
}
