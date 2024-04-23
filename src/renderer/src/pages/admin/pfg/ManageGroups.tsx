import { useEffect, useState } from "react";
import Group from "../../../../../models/Group";
import DebouncedInput from "@renderer/components/DebouncedInput";

const ManageGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);

  const fetchGroups = () => {
    const groups = window.mainController
      .getGroups()
      .map((group) => Group.reinstantiate(group) as Group);

    groups.forEach((group) => {
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
    });

    setGroups(groups);
  };

  const handleRoomChange = (value: string | null, id: number | null) => {
    console.log(value, id);
  };

  const addGroup = () => {
    const group = new Group(
      groups.length + 1,
      groups.length + 1,
      "Sin asignar",
      [],
      [],
      null,
    );

    window.mainController.addGroup(
      group.getGroupNumber(),
      group.getClassroom(),
      [],
      [],
      null,
    );

    fetchGroups();
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <main className="gap-10">
      <h1 className="text-3xl font-bold">Listado de grupos</h1>
      <div className="mx-auto">
        <button
          className="rounded-md bg-blue-500 px-2 py-1 font-semibold text-white"
          onClick={() => {
            addGroup();
          }}
        >
          Añadir grupo
        </button>
        {!groups.length && (
          <button className="rounded-md bg-blue-500 px-2 py-1 font-semibold text-white">
            Generar aleatoriamente
          </button>
        )}
      </div>
      <div className="flex w-full max-w-7xl flex-col items-center justify-between gap-10">
        {groups.length ? (
          groups.map((group) => (
            <div
              className="min-w-[600px] overflow-hidden rounded-md border-2 border-gray-800 bg-white shadow-sm"
              key={group.getId()}
            >
              <div className="flex w-full justify-between bg-gray-600 p-3 font-semibold text-white">
                <h3 className="text-2xl">Grupo {group.getGroupNumber()}</h3>
                <p>
                  Aula:{" "}
                  <DebouncedInput
                    initialValue={group.getClassroom()}
                    onChange={handleRoomChange}
                    id={group.getId()}
                  />
                </p>
              </div>
              <div className="w-full space-y-2 border-b-2 border-b-gray-800 p-3">
                <h5 className="text-xl font-medium">Profesores y lectores</h5>
                <div className="w-full text-lg">
                  {group.getProfessors().map((professor) => (
                    <p>
                      {group.getModerator()?.getId() == professor.getId()
                        ? `${professor.getName()} (Moderador)`
                        : professor.getName()}
                    </p>
                  ))}
                </div>
                <div className="flex w-full justify-end">
                  <button className="rounded-md bg-blue-500 px-2 py-1 font-semibold text-white">
                    Editar
                  </button>
                </div>
              </div>
              <div className="w-full space-y-2 p-3">
                <h5 className="text-xl font-medium">Estudiantes</h5>
                <div className="w-full text-lg">
                  {group.getStudents().map((student) => (
                    <p>{student.getName()}</p>
                  ))}
                </div>
                <div className="flex w-full justify-end">
                  <button className="rounded-md bg-blue-500 px-2 py-1 font-semibold text-white">
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No hay grupos registrados</p>
        )}
      </div>
    </main>
  );
};

export default ManageGroups;
