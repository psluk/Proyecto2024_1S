import { useState, useEffect } from "react";
import MainController from "../../../../controllers/MainController";
import { ProfessorModel } from "../../../../models/ProfessorModel";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

export default function ManageProfessors(): JSX.Element {
  const [professors, setProfessors] = useState<ProfessorModel[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filteredProfessors, setFilteredProfessors] = useState<
    ProfessorModel[]
  >([]);

  useEffect(() => {
    MainController.getProfessors().then((professors) => {
      setProfessors(professors);
      setFilteredProfessors(professors);
    });
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

  return (
    <main className="flex max-h-screen w-full flex-col items-center justify-between gap-6 overflow-auto p-10">
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
        <button className="h-8 rounded-md bg-sky-600 px-4 text-white">
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
                  <tr key={professor.getProfessorId()}>
                    <td>{professor.getName()}</td>
                    <td>{professor.getProfessorType()}</td>
                    <td>
                      {professor.getEmail() == null ? (
                        <p>No tiene</p>
                      ) : (
                        <a href={`mailto:${professor.getEmail()}`}></a>
                      )}
                    </td>
                    <td className="space-x-3">
                      <Link
                        to={`/admin/editProfessor/${professor.getProfessorId()}`}
                        className="text-sm font-semibold text-blue-600"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </Link>
                      <button className="text-sm font-semibold text-red-600">
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
    </main>
  );
}