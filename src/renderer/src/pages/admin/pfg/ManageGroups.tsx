import { useEffect, useState } from "react";
import Group from "../../../../../models/Group";
import DebouncedInput from "@renderer/components/DebouncedInput";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import DialogAlert from "@renderer/components/DialogAlert";
import Student from "../../../../../models/Student";
import Professor from "../../../../../models/Professor";

import RandomGroupsForm from "@renderer/components/RandomGroupsForm";
const ManageGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [filter, setFilter] = useState({ filter: "professor" });
  const [amount, setAmount] = useState(3);
  const [amountStudents, setAmountStudents] = useState(0);
  const [amountProfessors, setAmountProfessors] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
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

  const handleDeleteGroup = (id: number) => {
    window.mainController.deleteGroup(id);
    fetchGroups();
  };

  const handleRoomChange = (value: string | null, id: number | null) => {
    if (id === null) {
      return;
    }

    const group = groups.find((group) => group.getId() === id);

    if (!group) {
      return;
    }

    window.mainController.updateGroup(
      group.getId(),
      group.getGroupNumber(),
      value,
      group.getStudents().map((student) => student.asObject()),
      group.getProfessors().map((professor) => professor.asObject()),
      group.getModerator()?.asObject() || null,
    );

    fetchGroups();
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

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const generateRandomGroups = () => {
    if (groups.length > 0) {
      window.mainController.deleteGroups();
    }
    let students = window.mainController
      .getStudentsWithoutGroup()
      .map((student) => Student.reinstantiate(student) as Student);
    let professors = window.mainController
      .getProfessors()
      .map((professor) => Professor.reinstantiate(professor) as Professor);
    // Shuffle arrays
    students = shuffleArray(students);
    professors = shuffleArray(professors);
    professors = professors.filter(
      (professor) => professor.getName() !== "Sin Profesor",
    );
    // Determine the maximum number of groups based on the available professors
    const amountOfGroups = Math.floor(amountProfessors / amount);
    const groupsToAdd: Group[] = [];
    // Create groups and assign professors
    for (let i = 0; i < amountOfGroups; i++) {
      // Extract professors for this group
      const groupProfessors = professors.splice(0, amount);
      groupsToAdd.push(
        new Group(
          i + 1,
          i + 1,
          "Sin asignar",
          [],
          groupProfessors,
          groupProfessors[0], // Setting the first professor as the moderator
        ),
      );
    }
    // Distribute students among the groups
    students.forEach((student, index) => {
      const groupIndex = index % amountOfGroups;
      groupsToAdd[groupIndex].addStudent(student);
    });
    // Save groups to the database
    window.mainController.addGroups(
      groupsToAdd.map((group) => group.asObject()),
    );
    fetchGroups();
    setShowDialog(false);
  };

  useEffect(() => {
    fetchGroups();
    setAmountProfessors(window.mainController.getProfessors().length);
    setAmountStudents(window.mainController.getStudents().length);
  }, []);

  return (
    <main className="gap-10">
      <h1 className="text-3xl font-bold">Listado de grupos</h1>
      <div className="mx-auto space-x-6">
        <button
          className="rounded-md bg-blue-500 px-2 py-1 font-semibold text-white"
          onClick={() => {
            addGroup();
          }}
        >
          Añadir grupo
        </button>
        <button
          className="rounded-md bg-blue-500 px-2 py-1 font-semibold text-white"
          onClick={() =>
            amountProfessors > 3 && amountStudents > 0 ? setShowDialog(true) : setShowAlert(true)
          }
        >
          Generar aleatoriamente
        </button>
      </div>
      <div className="flex max-w-7xl flex-col flex-wrap items-center justify-center gap-10">
        {groups.length ? (
          groups.map((group) => (
            <div
              className="min-w-[600px] overflow-hidden rounded-md bg-white shadow-md"
              key={group.getId()}
            >
              <div className="flex w-full justify-between bg-gray-600 p-3 font-semibold text-white">
                <h3 className="text-2xl">Grupo {group.getGroupNumber()}</h3>
                <div className="flex gap-6">
                  <p>
                    Aula:{" "}
                    <DebouncedInput
                      initialValue={group.getClassroom()}
                      onChange={handleRoomChange}
                      id={group.getId()}
                    />
                  </p>
                  <button onClick={() => handleDeleteGroup(group.getId())}>
                    <FontAwesomeIcon icon={faXmark} className="text-red-500" />
                  </button>
                </div>
              </div>
              <div className="w-full space-y-2 border-b-2 border-b-gray-800 p-3">
                <h5 className="text-xl font-medium">Profesores y lectores</h5>
                <div className="w-full text-lg">
                  {group.getProfessors().map((professor) => (
                    <p key={professor.getId()}>
                      {group.getModerator()?.getId() == professor.getId()
                        ? `${professor.getName()} (Moderador)`
                        : professor.getName()}
                    </p>
                  ))}
                </div>
                <div className="flex w-full justify-end">
                  <Link
                    className="rounded-md bg-blue-500 px-2 py-1 font-semibold text-white"
                    to={`/admin/manageTheses/groups/editProfessors/${group.getId()}`}
                  >
                    Editar
                  </Link>
                </div>
              </div>
              <div className="w-full space-y-2 p-3">
                <h5 className="text-xl font-medium">Estudiantes</h5>
                <div className="w-full text-lg">
                  {group.getStudents().map((student) => (
                    <p key={student.getId()}>{student.getName()}</p>
                  ))}
                </div>
                <div className="flex w-full justify-end">
                  <Link
                    className="rounded-md bg-blue-500 px-2 py-1 font-semibold text-white"
                    to={`/admin/manageTheses/groups/editStudents/${group.getId()}`}
                  >
                    Editar
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No hay grupos registrados</p>
        )}
      </div>
      <RandomGroupsForm
        handleCancel={() => {
          setShowDialog(false);
        }}
        handleConfirm={() => {
          generateRandomGroups();
        }}
        show={showDialog}
        setFilter={setFilter}
        setAmount={setAmount}
        professorAmount={amountProfessors}
        selectedAmount={amount}
        studentAmount={amountStudents}
      />
      <DialogAlert
        show={showAlert}
        title="Error"
        message="No hay suficientes profesores y estudiantes para generar los grupos."
        handleConfirm={() => {
          setShowAlert(false);
        }}
        type="error"
      />
    </main>
  );
};

export default ManageGroups;
