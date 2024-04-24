import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Group from "../../../../../models/Group";
import Student from "../../../../../models/Student";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

const EditGroupStudents = () => {
  const { id } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filteredStudents, setfilteredStudents] = useState<Student[]>([]);
  const Navigate = useNavigate();

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

  const handleAddStudent = (student: Student) => {
    if (!group) {
      return;
    }

    group.addStudent(student);
    setGroup(group);
  
    setStudents(students.filter((s) => s.getId() !== student.getId()));
    setfilteredStudents(filteredStudents.filter((s) => s.getId() !== student.getId()));
  }

    const handleRemoveStudent = (student: Student) => {
        if (!group) {
        return;
        }
    
        group.removeStudent(student);
        setGroup(group);
    
        setStudents([...students, student]);
        setfilteredStudents([...filteredStudents, student]);
    }

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

    setGroup(group);

    const getStudentsWithoutGroup = window.mainController
      .getStudentsWithoutGroup()
      .map((student) => Student.reinstantiate(student) as Student);

    setStudents(getStudentsWithoutGroup);
    setfilteredStudents(getStudentsWithoutGroup);
  }, [id]);

  useEffect(() => {
    if (search === "") {
      setfilteredStudents(students);
    } else {
        setfilteredStudents(
        students.filter((student) =>
          student.getName().toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }
  }, [search, students]);

  return (
    <main>
      {group ? (
        <div className="w-full space-y-16">
          <h1 className="w-full text-center text-3xl font-semibold text-gray-800">
            Estudiantes de grupo {group.getGroupNumber()}
          </h1>
          <div className="w-full">
            <h2 className="mx-auto my-3 w-full max-w-7xl text-2xl font-semibold text-gray-800">
              Estudiantes en grupo
            </h2>
            <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-md shadow-md ">
              <table className="w-full table-auto rounded-md [&>tbody>tr:nth-child(2n+1)]:bg-slate-50 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-1 [&>thead>tr>th]:px-2 [&>thead>tr>th]:py-1">
                <thead>
                  <tr className="bg-sky-600 text-white">
                    <th className="w-2/5 px-2 py-1">
                      <p className="flex items-center justify-start gap-3">
                        Nombre
                      </p>
                    </th>
                    <th className="w-2/5 px-2 py-1">
                      <p className="flex items-center justify-start gap-3">
                        Correo
                      </p>
                    </th>
                    <th className="w-1/5 px-2 py-1">
                      <p className="flex items-center justify-start gap-3">
                        Carnet
                      </p>
                    </th>
                    <th className="w-1/12 px-2 py-1 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {group.getStudents().length ? (
                    group.getStudents().map((student) => (
                      <tr key={student.getId()}>
                        <td>{student.getName()}</td>
                        <td>{student.getEmail()}</td>
                        <td>{student.getUniversityId()}</td>
                        <td className="flex items-center justify-center space-x-3">
                          <button
                            className="text-sm font-semibold text-red-600"
                            onClick={() => handleRemoveStudent(student)}
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
          {students.length ? (
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
                      <th className="w-2/5 px-2 py-1">
                        <p className="flex items-center justify-start gap-3">
                          Correo
                        </p>
                      </th>
                      <th className="w-1/5 px-2 py-1">
                        <p className="flex items-center justify-start gap-3">
                          Carnet
                        </p>
                      </th>
                      <th className="w-1/12 px-2 py-1 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.getId()}>
                        <td>{student.getName()}</td>
                        <td>{student.getEmail()}</td>
                        <td>{student.getUniversityId()}</td>
                        <td className="flex items-center justify-center space-x-3">
                          <button
                            className="text-sm font-semibold text-sky-600"
                            onClick={() => handleAddStudent(student)}
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
            <p>No hay estudiantes disponibles</p>
          )}
        </div>
      ) : (
        <p>No se encontró el grupo</p>
      )}
    </main>
  );
};

export default EditGroupStudents;
