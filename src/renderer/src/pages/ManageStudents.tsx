import React, { useState, useEffect } from "react";
import Student from "../../../models/Student";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import DialogConfirm from "../components/DialogConfirm";
import DialogAlert from "@renderer/components/DialogAlert";

export default function ManageStudents(): React.ReactElement {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  const [studentId, setStudentId] = useState<number>(0);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  const [showDialogAlert, setShowDialogAlert] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadedStudents = window.mainController
      .getStudents()
      .map((student) => Student.reinstantiate(student) as Student);
    setStudents(loadedStudents);
    setFilteredStudents(loadedStudents);
  }, []);

  useEffect(() => {
    if (search === "") {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(
        students.filter((student) =>
          student.getName().toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }
  }, [search, students]);

  const deleteStudent = (id: number): void => {
    setStudentId(id);
    setShowDialog(true);
  };

  const handleConfirm = (): void => {
    try {
      window.mainController.deleteStudent(studentId);
    } catch (error) {
      setShowDialogAlert(true);
    }

    const newStudents = students.filter(
      (student) => student.getId() !== studentId,
    );
    setStudents(newStudents);
    setFilteredStudents(newStudents);
  };
  return (
    <main className="gap-6">
      <h1 className="text-3xl font-bold">Administrar estudiantes</h1>

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
          className="h-8 rounded-md bg-teal-600 px-4 font-semibold text-white shadow-sm hover:bg-teal-700"
          type="button"
          onClick={() => navigate("/manageTheses/students/add")}
        >
          Agregar estudiante
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
                    Teléfono
                  </p>
                </th>
                <th>
                  <p className="flex items-center justify-start gap-3">
                    Correo
                  </p>
                </th>
                <th>
                  <p className="flex items-center justify-start gap-3">Carné</p>
                </th>
                <th>
                  <p className="flex items-center justify-start gap-3">
                    Habilitado
                  </p>
                </th>
                <th>
                  <p className="flex items-center justify-start gap-3">
                    Acciones
                  </p>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length ? (
                filteredStudents.map((student) => (
                  <tr key={student.getId()}>
                    <td>{student.getName()}</td>
                    <td>{student.getPhoneNum()}</td>
                    <td>{student.getEmail()}</td>
                    <td>{student.getUniversityId()}</td>
                    <td>{student.getIsEnabled() ? "Sí" : "No"}</td>
                    <td className="space-x-3">
                      <Link
                        to={`/manageTheses/students/edit/${student.getId()}`}
                        className="text-sm font-semibold text-teal-800 hover:text-teal-600"
                        title="Editar"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </Link>
                      <button
                        className="text-sm font-semibold text-red-600 hover:text-red-800"
                        onClick={() => deleteStudent(student.getId())}
                        title="Eliminar"
                        type="button"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
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
        title="Eliminar estudiante"
        message="¿Estás seguro de que deseas eliminar al estudiante?"
        handleConfirm={handleConfirm}
        handleCancel={() => {
          setShowDialog(false);
        }}
        show={showDialog}
      />

      <DialogAlert
        title="Error"
        message={"Ocurrió un error al eliminar al estudiante."}
        show={showDialogAlert}
        handleConfirm={() => {
          setShowDialogAlert(!showDialogAlert);
        }}
        type="error"
      />
    </main>
  );
}
