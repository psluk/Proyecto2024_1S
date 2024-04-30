import { useState, useEffect } from "react";
import Professor from "../../../../models/Professor";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import WorkloadInfo from "@renderer/components/WorkloadInfo";

export default function ManageWorkloads() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filteredProfessors, setFilteredProfessors] = useState<Professor[]>([]);
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

  return (
    <main className="gap-6">
      <h1 className="text-3xl font-bold">Cargas laborales de los profesores</h1>

      <div className="flex w-full max-w-7xl flex-wrap items-center justify-between">
        <div className="mb-4 flex w-full max-w-sm items-center rounded-md border border-gray-300 bg-white">
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
        <div className="mb-4 w-full">
          {professors.map((professor) => (
            <WorkloadInfo
              key={professor.getId()}
              name={professor.getName()}
              id={professor.getId()}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
