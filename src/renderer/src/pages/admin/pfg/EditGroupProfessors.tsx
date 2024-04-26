import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Group from "../../../../../models/Group";
import Professor from "../../../../../models/Professor";
import { getTranslation } from "@renderer/utils/Translator";
import { professorTypes } from "@renderer/constants/RecordTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";


const EditGroupProfessors = () => {
  const { id } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filteredProfessors, setFilteredProfessors] = useState<Professor[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const Navigate = useNavigate();

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    // Reorder professors
    const professors = Array.from(group!.getProfessors());
    const draggedProfessor = professors[draggedIndex];
    professors.splice(draggedIndex, 1);
    professors.splice(index, 0, draggedProfessor);

    // Update group with new professors list and set the first professor as the moderator
    setGroup((prevGroup) => {
      if (prevGroup) {
        return new Group(
          prevGroup.getId(),
          prevGroup.getGroupNumber(),
          prevGroup.getClassroom(),
          prevGroup.getStudents(),
          professors,
          professors[0],
        );
      }
      return prevGroup;
    });

    setDraggedIndex(null);
  };

  const handleSave = () => {
    if (!group) {
      return;
    }

    window.mainController.updateGroup(
      group.getId(),
      group.getGroupNumber(),
      group.getClassroom(),
      group.getStudents().map((student) => student.asObject()),
      group.getProfessors().map((professor) => professor.asObject()),
      group.getModerator()?.asObject() || null,
    );

    Navigate("/admin/manageTheses/groups");
  };

  const handleDelete = (professor: Professor) => {
    if (!group) {
      return;
    }

    const professors = Array.from(group.getProfessors());
    const index = professors.findIndex((p) => p.getId() === professor.getId());

    if (index === -1) {
      return;
    }

    // Remove the professor from the group's professor list
    const [removedProfessor] = professors.splice(index, 1);

    // Update the group with the modified professor list
    setGroup((prevGroup) => {
      if (prevGroup) {
        return new Group(
          prevGroup.getId(),
          prevGroup.getGroupNumber(),
          prevGroup.getClassroom(),
          prevGroup.getStudents(),
          professors,
          professors[0] || null, // Ensure there's a fallback in case the array is empty
        );
      }
      return prevGroup;
    });

    // Add the removed professor back to the general professors list
    setProfessors((prevProfessors) => {
      // Ensure the professor isn't already in the list
      if (prevProfessors.some((p) => p.getId() === professor.getId())) {
        return prevProfessors;
      }
      return [removedProfessor, ...prevProfessors];
    });

    // Add the removed professor back to the filtered professors list
    setFilteredProfessors((prevFilteredProfessors) => {
      // Ensure the professor isn't already in the list and matches the current filter criteria, if any
      if (prevFilteredProfessors.some((p) => p.getId() === professor.getId())) {
        return prevFilteredProfessors;
      }
      // Optionally check if they match the current search/filter criteria
      if (
        search &&
        !removedProfessor.getName().toLowerCase().includes(search.toLowerCase())
      ) {
        return prevFilteredProfessors;
      }
      return [removedProfessor, ...prevFilteredProfessors];
    });
  };

  const handleAdd = (professor: Professor) => {
    if (!group) {
      return;
    }

    const professors = Array.from(group.getProfessors());
    professors.push(professor);

    setGroup((prevGroup) => {
      if (prevGroup) {
        return new Group(
          prevGroup.getId(),
          prevGroup.getGroupNumber(),
          prevGroup.getClassroom(),
          prevGroup.getStudents(),
          professors,
          professors[0],
        );
      }
      return prevGroup;
    });

    setProfessors((prevProfessors) => {
      const newProfessors = Array.from(prevProfessors);
      const professorIndex = newProfessors.findIndex(
        (p) => p.getId() === professor.getId(),
      );

      if (professorIndex === -1) {
        return prevProfessors;
      }

      newProfessors.splice(professorIndex, 1);

      return newProfessors;
    });

    setFilteredProfessors((prevFilteredProfessors) => {
      const newFilteredProfessors = Array.from(prevFilteredProfessors);
      const professorIndex = newFilteredProfessors.findIndex(
        (p) => p.getId() === professor.getId(),
      );

      if (professorIndex === -1) {
        return prevFilteredProfessors;
      }

      newFilteredProfessors.splice(professorIndex, 1);

      return newFilteredProfessors;
    });
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    const group = Group.reinstantiate(
      window.mainController.getGroupById(parseInt(id)),
    );

    if (!group) {
      return;
    }

    group.getProfessors().sort((a, b) => {
      const aIsModerator = group.getModerator()?.getId() == a.getId();

      if (aIsModerator) {
        return -1;
      }
      if (group.getModerator()?.getId() == b.getId()) {
        return 1;
      }
      return 0;
    });
    setGroup(group);

    // Retrieve and reinstantiate all professors, filtering out nulls
    const allProfessors = window.mainController
      .getProfessors()
      .map((professor) => Professor.reinstantiate(professor))
      .filter((professor): professor is Professor => professor !== null);

    // Filter out the professors who are already in the group
    const professorsNotInGroup = allProfessors.filter(
      (professor) =>
        !group.getProfessors().some((p) => p.getId() === professor.getId()),
    );

    setProfessors(professorsNotInGroup); // Set the professors state
    setFilteredProfessors(professorsNotInGroup); // Set the filtered professors state
  }, [id]);

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
    <main>
      {group ? (
        <div className="w-full space-y-16">
          <h1 className="w-full text-center text-3xl font-semibold text-gray-800">
            Profesores de grupo {group.getGroupNumber()}
          </h1>
          <div className="w-full">
            <h2 className="mx-auto my-3 w-full max-w-7xl text-2xl font-semibold text-gray-800">
              Profesores en grupo
            </h2>
            <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-md shadow-md ">
              <table className="w-full table-auto rounded-md [&>tbody>tr:nth-child(2n+1)]:bg-slate-50 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-1 [&>thead>tr>th]:px-2 [&>thead>tr>th]:py-1">
                <thead>
                  <tr className="bg-sky-600 text-white">
                    <th className="w-3/5 px-2 py-1">
                      <p className="flex items-center justify-start gap-3">
                        Nombre
                      </p>
                    </th>
                    <th className="w-1/5 px-2 py-1">
                      <p className="flex items-center justify-start gap-3">
                        Tipo
                      </p>
                    </th>
                    <th className="w-1/12 px-2 py-1 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {group.getProfessors().length ? (
                    group.getProfessors().map((professor, index) => (
                      <tr
                        key={professor.getId()}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        <td>
                          {group.getModerator()?.getId() == professor.getId()
                            ? `${professor.getName()} (Moderador)`
                            : professor.getName()}
                        </td>
                        <td>
                          {getTranslation(professorTypes, professor.getType())}
                        </td>
                        <td className="flex items-center justify-center space-x-3">
                          <button
                            className="text-sm font-semibold text-red-600"
                            onClick={() => handleDelete(professor)}
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
            <div className="mx-auto mt-6 w-fit">
              <button
                className="rounded-md bg-blue-500 px-2 py-1 font-semibold text-white"
                onClick={() => handleSave()}
              >
                Guardar
              </button>
            </div>
          </div>
          {professors.length ? (
            <div className="w-full space-y-3">
              <div className="mx-auto w-full max-w-7xl space-y-2">
                <h2 className=" text-2xl font-semibold text-gray-800">
                  Lista general de profesores
                </h2>
                <div className=" flex w-full max-w-sm items-center rounded-md border border-gray-300 bg-white">
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
              </div>
              <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-md shadow-md ">
                <table className="w-full table-auto rounded-md [&>tbody>tr:nth-child(2n+1)]:bg-slate-50 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-1 [&>thead>tr>th]:px-2 [&>thead>tr>th]:py-1">
                  <thead>
                    <tr className="bg-sky-600 text-white">
                      <th className="w-3/5 px-2 py-1">
                        <p className="flex items-center justify-start gap-3">
                          Nombre
                        </p>
                      </th>
                      <th className="w-1/5 px-2 py-1">
                        <p className="flex items-center justify-start gap-3">
                          Tipo
                        </p>
                      </th>
                      <th className="w-1/12 px-2 py-1 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfessors.map((professor) => (
                      <tr key={professor.getId()}>
                        <td>{professor.getName()}</td>
                        <td>
                          {getTranslation(professorTypes, professor.getType())}
                        </td>
                        <td className="flex items-center justify-center space-x-3">
                          <button
                            className="text-sm font-semibold text-sky-600"
                            onClick={() => handleAdd(professor)}
                            title="Eliminar"
                            type="button"
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p>No hay profesores disponibles</p>
          )}
        </div>
      ) : (
        <p>No se encontró el grupo</p>
      )}
    </main>
  );
};

export default EditGroupProfessors;
