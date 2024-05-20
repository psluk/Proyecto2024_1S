import { useState, useEffect } from "react";

import { StudentProfessorInterface } from "../../../../../models/StudentProfessor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import DialogConfirm from "@renderer/components/DialogConfirm";

export default function ManageAdvisors(): React.ReactElement {
  const [students, setStudents] = useState<StudentProfessorInterface[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filteredStudents, setFilteredStudents] = useState<
    StudentProfessorInterface[]
  >([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  useEffect(() => {
    const loadedStudents = window.mainController.getStudentsProfessors();
    setStudents(loadedStudents);
    setFilteredStudents(loadedStudents);
  }, []);

  useEffect(() => {
    if (search === "") {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(
        students.filter((student) =>
          student.student.name.toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }
  }, [search, students]);

  const handleRandomGeneration = (): void => {
    if (
      students.find((student) => student.professors.length < 3) === undefined
    ) {
      setOpenDialog(true);
      return;
    } else {
      generateRandom();
    }
  };

  const generateRandom = (): void => {
    window.mainController.generateRandomProfessorsAssigments();
    const loadedStudents = window.mainController.getStudentsProfessors();
    setStudents(loadedStudents);
    setFilteredStudents(loadedStudents);
  };

  return (
    <main className="gap-6">
      <h1 className="text-3xl font-bold">Administrar tutores</h1>

      <div className="flex w-full max-w-7xl items-center justify-between">
        <div className="flex w-full max-w-sm items-center rounded-md border border-gray-300 bg-white">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="ml-4 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar estudiante"
            className="h-8 flex-1 rounded-md border-none pl-4 pr-10 focus:outline-none focus:ring-0"
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
        </div>
        <button
          className="h-8 rounded-md bg-teal-500 px-4 font-semibold text-white shadow-sm hover:bg-teal-600"
          type="button"
          onClick={() => handleRandomGeneration()}
        >
          Generar aleatoriamente
        </button>
      </div>
      <div className="w-full">
        <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-md shadow-md ">
          <table className="w-full table-auto rounded-md [&>tbody>tr:nth-child(2n+1)]:bg-slate-50 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-1 [&>thead>tr>th]:px-2 [&>thead>tr>th]:py-1">
            <thead>
              <tr className="bg-teal-600 text-white">
                <th>
                  <p className="flex items-center justify-start gap-3">
                    Nombre
                  </p>
                </th>
                <th>
                  <p className="flex items-center justify-start gap-3">
                    Profesor guía
                  </p>
                </th>
                <th>
                  <p className="flex items-center justify-start gap-3">
                    Profesores lectores
                  </p>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length ? (
                filteredStudents.map((student) => (
                  <tr key={student.student.id}>
                    <td>{student.student.name}</td>
                    <td>
                      {student.professors.filter(
                        (professor) => professor.isAdvisor,
                      )[0]?.name || "Sin asignar"}
                    </td>
                    <td className="flex gap-3">
                      {((): React.ReactElement => {
                        const nonAdvisors = student.professors.filter(
                          (professor) => !professor.isAdvisor,
                        );
                        return nonAdvisors.length > 0 ? (
                          <>
                            {nonAdvisors.map((professor) => (
                              <p key={professor.id}>{professor.name}</p>
                            ))}
                          </>
                        ) : (
                          <p>Sin asignar</p>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="text-center font-bold italic" colSpan={6}>
                    No hay
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <DialogConfirm
        title="Generación aleatoria de tutores"
        message="Todos los estudiantes tienen profesores asignados. ¿Desea generarlos nuevamente?"
        show={openDialog}
        handleConfirm={() => {
          window.mainController.deleteProfessorsAssigments();
          generateRandom();
          setOpenDialog(false);
        }}
        handleCancel={() => setOpenDialog(false)}
      />
    </main>
  );
}
