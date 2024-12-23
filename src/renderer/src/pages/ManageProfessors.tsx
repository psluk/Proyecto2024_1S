import React, { useState, useEffect } from "react";
import Professor from "../../../models/Professor";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { getTranslation } from "@renderer/utils/Translator";
import { professorTypes } from "@renderer/constants/RecordTypes";
import DialogConfirm from "../components/DialogConfirm";
import DialogAlert from "@renderer/components/DialogAlert";

export default function ManageProfessors(): React.ReactElement {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filteredProfessors, setFilteredProfessors] = useState<Professor[]>([]);

  const [professorId, setProfessorId] = useState<number>(0);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  const [showDialogAlert, setShowDialogAlert] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadedProfessors = window.mainController
      .getProfessors()
      .map((professor) => Professor.reinstantiate(professor) as Professor);
    setProfessors(loadedProfessors);
    setFilteredProfessors(loadedProfessors);
  }, []);

  useEffect(() => {
    if (search === "") {
      setFilteredProfessors(professors);
    } else {
      setFilteredProfessors(
        professors.filter((professor) =>
          professor.getName().toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }
  }, [search, professors]);

  const deleteProfessor = (id: number): void => {
    setProfessorId(id);
    setShowDialog(true);
  };

  const handleConfirm = (): void => {
    try {
      window.mainController.deleteProfessor(professorId);
    } catch (error) {
      setShowDialogAlert(true);
    }

    const newProfessors = professors.filter(
      (professor) => professor.getId() !== professorId,
    );
    setProfessors(newProfessors);
    setFilteredProfessors(newProfessors);
  };

  return (
    <main className="gap-6">
      <h1 className="text-3xl font-bold">Administrar profesores</h1>

      <div className="flex w-full max-w-7xl items-center justify-between">
        <div className="flex w-full max-w-sm items-center rounded-md border border-gray-300 bg-white">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="ml-4 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar profesor"
            className="h-8 flex-1 rounded-md border-none pl-4 pr-10 focus:outline-none focus:ring-0"
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
        </div>
        <button
          className="h-8 rounded-md bg-cyan-600 px-4 font-semibold text-white shadow-sm"
          type="button"
          onClick={() => navigate("/professors/manageWorkloads")}
        >
          Ver cargas de trabajo
        </button>
        <button
          className="h-8 rounded-md bg-sky-600 px-4 font-semibold text-white shadow-sm"
          type="button"
          onClick={() => navigate("/professors/add")}
        >
          Agregar profesor
        </button>
      </div>
      <div className="w-full">
        <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-md shadow-md ">
          <table className="w-full table-auto rounded-md [&>tbody>tr:nth-child(2n+1)]:bg-slate-50 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-1 [&>thead>tr>th]:px-2 [&>thead>tr>th]:py-1">
            <thead>
              <tr className="bg-sky-600 text-white">
                <th>
                  <p className="flex items-center justify-start gap-3">
                    Nombre
                  </p>
                </th>
                <th>
                  <p className="flex items-center justify-start gap-3">Tipo</p>
                </th>
                <th className="text-start">Correo</th>
                <th className="text-start">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfessors.length ? (
                filteredProfessors.map((professor) => (
                  <tr key={professor.getId()}>
                    <td>{professor.getName()}</td>
                    <td>
                      {getTranslation(professorTypes, professor.getType())}
                    </td>
                    <td>
                      {professor.getEmail() == null ? (
                        <p>No tiene</p>
                      ) : (
                        <a href={`mailto:${professor.getEmail()}`}>
                          {professor.getEmail()}
                        </a>
                      )}
                    </td>
                    <td className="space-x-3">
                      <Link
                        to={`/professors/edit/${professor.getId()}`}
                        className="text-sm font-semibold text-blue-600"
                        title="Editar"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </Link>
                      <button
                        className="text-sm font-semibold text-red-600"
                        onClick={() => deleteProfessor(professor.getId())}
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
                  <td className="text-center font-bold italic" colSpan={4}>
                    No hay
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DialogConfirm
        title="Eliminar profesor"
        message="¿Está seguro de que desea eliminar al profesor?"
        handleConfirm={handleConfirm}
        handleCancel={() => {
          setShowDialog(false);
        }}
        show={showDialog}
      />

      <DialogAlert
        title="Error"
        message={"Ocurrió un error al eliminar al profesor."}
        show={showDialogAlert}
        handleConfirm={() => {
          setShowDialogAlert(!showDialogAlert);
        }}
        type="error"
      />
    </main>
  );
}
