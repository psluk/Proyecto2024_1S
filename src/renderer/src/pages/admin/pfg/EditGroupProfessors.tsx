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
import DialogConfirm from "@renderer/components/DialogConfirm";
interface ProfessorsGroup {
  professor: Professor;
  groups: Group[] | null;
}

const EditGroupProfessors = (): React.ReactElement => {
  const { id } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [professors, setProfessors] = useState<ProfessorsGroup[]>([]);
  const [search, setSearch] = useState<string>("");
  const [showDialog, setShowDialog] = useState(false);
  const [filteredProfessors, setFilteredProfessors] = useState<
    ProfessorsGroup[]
  >([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const Navigate = useNavigate();
  const [professorToAdd, setProfessorToAdd] = useState<ProfessorsGroup | null>(
    null,
  );

  const handleDragStart = (e, index): void => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e): void => {
    e.preventDefault();
  };

  const handleDrop = (e, index): void => {
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
        const newGroup = new Group(
          prevGroup.getId(),
          prevGroup.getGroupNumber(),
          prevGroup.getClassroom(),
          prevGroup.getStudents(),
          professors,
          professors[0],
        );

        updateGroup(newGroup);
        return newGroup;
      }
      return prevGroup;
    });

    setDraggedIndex(null);
  };

  const updateGroup = (groupToUpdate: Group): void => {
    if (!groupToUpdate) return;

    window.mainController.updateGroup(
      groupToUpdate.getId(),
      groupToUpdate.getGroupNumber(),
      groupToUpdate.getClassroom(),
      groupToUpdate.getStudents().map((student) => student.asObject()),
      groupToUpdate.getProfessors().map((professor) => professor.asObject()),
      groupToUpdate.getModerator()?.asObject() || null,
    );
  };

  const handleSave = (): void => {
    Navigate("/admin/manageTheses/groups");
  };

  const handleDelete = (professor: Professor): void => {
    if (!group) {
      return;
    }

    // Remove the professor from the group's professor list
    const remainingProfessors = group
      .getProfessors()
      .filter((p) => p.getId() !== professor.getId());

    // Update the group with the modified professor list
    setGroup((prevGroup) => {
      if (!prevGroup) {
        return null;
      }
      const newModerator =
        remainingProfessors.length > 0 ? remainingProfessors[0] : null;
      const updatedGroup = new Group(
        prevGroup.getId(),
        prevGroup.getGroupNumber(),
        prevGroup.getClassroom(),
        prevGroup.getStudents(),
        remainingProfessors,
        newModerator,
      );
      updateGroup(updatedGroup);
      fetchData(updatedGroup);
      return updatedGroup;
    });
  };

  const handleAdd = (professor: ProfessorsGroup): void => {
    if (!group) {
      return;
    }

    if (professor.groups && professor.groups.length > 0) {
      setProfessorToAdd(professor);
      setShowDialog(true);
    } else {
      addProfessorToGroup(professor.professor);
    }
  };

  const addProfessorToGroup = (professor: Professor): void => {
    const professors = Array.from(group!.getProfessors());
    professors.push(professor);
    setGroup((prevGroup) => {
      if (prevGroup) {
        const newGroup = new Group(
          prevGroup.getId(),
          prevGroup.getGroupNumber(),
          prevGroup.getClassroom(),
          prevGroup.getStudents(),
          professors,
          professors[0],
        );
        updateGroup(newGroup);
        return newGroup;
      }
      return prevGroup;
    });

    setProfessors((prevProfessors) => {
      const newProfessors = Array.from(prevProfessors);
      const professorIndex = newProfessors.findIndex(
        (p) => p.professor.getId() === professor.getId(),
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
        (p) => p.professor.getId() === professor.getId(),
      );
      if (professorIndex === -1) {
        return prevFilteredProfessors;
      }
      newFilteredProfessors.splice(professorIndex, 1);
      return newFilteredProfessors;
    });
  };

  const deleteProfessorFromGroups = (professor: Professor): void => {
    window.mainController.deleteProfessorFromGroups(professor.getId());
  };

  const fetchData = (group): void => {
    const groups = window.mainController
      .getGroups()
      .map((group) => Group.reinstantiate(group));

    // Generate ProfessorsGroup objects for all professors in all groups
    const professorGroupsMap: Map<number, ProfessorsGroup> = new Map();

    groups.forEach((group) => {
      group!.getProfessors().forEach((professor) => {
        if (!professorGroupsMap.has(professor.getId())) {
          professorGroupsMap.set(professor.getId(), {
            professor,
            groups: [group!],
          });
        } else {
          professorGroupsMap.get(professor.getId())!.groups!.push(group!);
        }
      });
    });

    const allProfessorsGroups = Array.from(professorGroupsMap.values());

    // Get the unassigned professors
    const unassignedProfessors = window.mainController
      .getProfessors()
      .map((prof) => Professor.reinstantiate(prof))
      .filter(
        (professor) =>
          professor!.getName() !== "Sin Profesor" &&
          !professorGroupsMap.has(professor!.getId()),
      );

    // Create ProfessorsGroup objects for unassigned professors
    const unassignedProfessorsGroups = unassignedProfessors.map(
      (professor) => ({
        professor,
        groups: null,
      }),
    ) as ProfessorsGroup[];

    // Combine the unique professors from all groups and unassigned professors
    const unitedProfessorsGroups = [
      ...allProfessorsGroups,
      ...unassignedProfessorsGroups,
    ];

    // Filter out the professors who are already in the current group
    const professorsNotInGroup: ProfessorsGroup[] = unitedProfessorsGroups
      .filter(
        ({ professor }) =>
          !group.getProfessors().some((p) => p.getId() === professor.getId()),
      )
      .sort((a, b) =>
        a.professor.getType() === "De planta" &&
        b.professor.getType() !== "De planta"
          ? -1
          : a.professor.getType() !== "De planta" &&
              b.professor.getType() === "De planta"
            ? 1
            : a.professor.getType().localeCompare(b.professor.getType()),
      );

    setProfessors(professorsNotInGroup); // Set the professors state
    setFilteredProfessors(professorsNotInGroup); // Set the filtered professors state
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    const groupData = Group.reinstantiate(
      window.mainController.getGroupById(parseInt(id)),
    );

    if (!groupData) {
      return;
    }

    groupData.getProfessors().sort((a, b) => {
      const aIsModerator = groupData.getModerator()?.getId() === a.getId();
      if (aIsModerator) {
        return -1;
      }
      if (groupData.getModerator()?.getId() === b.getId()) {
        return 1;
      }
      return 0;
    });

    setGroup(groupData);

    fetchData(groupData);
  }, [id]);

  useEffect(() => {
    setFilteredProfessors(
      search === ""
        ? professors
        : professors.filter((prof) =>
            prof.professor
              .getName()
              .toLowerCase()
              .includes(search.toLowerCase()),
          ),
    );
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
                      <th className="w-2/5 px-2 py-1">
                        <p className="flex items-center justify-start gap-3">
                          Nombre
                        </p>
                      </th>
                      <th className="w-4/12 px-2 py-1">
                        <p className="flex items-center justify-start gap-3">
                          Tipo
                        </p>
                      </th>
                      <th className="flex items-center justify-start gap-3">
                        Grupos
                      </th>
                      <th className="w-1/12 px-2 py-1 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfessors.map((professor) => (
                      <tr key={professor.professor.getId()}>
                        <td>{professor.professor.getName()}</td>
                        <td>
                          {getTranslation(
                            professorTypes,
                            professor.professor.getType(),
                          )}
                        </td>
                        <td className="">
                          <p>
                            {professor.groups?.filter(
                              (group) => group.getId().toString() !== id,
                            ).length
                              ? professor.groups
                                  ?.filter(
                                    (group) => group.getId().toString() !== id,
                                  )
                                  .map((group) => group.getGroupNumber())
                                  .join(" - ")
                              : "No asignado"}
                          </p>
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
            <p className="w-full text-center text-xl">
              No hay profesores disponibles
            </p>
          )}
        </div>
      ) : (
        <p className="w-full text-center text-2xl">No se encontró el grupo</p>
      )}

      <DialogConfirm
        title="Atención"
        message="El profesor ya se encuentra asignado en otros grupos. ¿Desea mantenerlo en estos grupos?"
        setShow={(show) => setShowDialog(show)}
        handleCancel={() => {
          setShowDialog(false);
          deleteProfessorFromGroups(professorToAdd!.professor);
          addProfessorToGroup(professorToAdd!.professor);
        }}
        handleConfirm={() => {
          setShowDialog(false);
          addProfessorToGroup(professorToAdd!.professor);
        }}
        show={showDialog}
        confirmText="Mantener"
        cancelText="Eliminar"
      />
    </main>
  );
};

export default EditGroupProfessors;
