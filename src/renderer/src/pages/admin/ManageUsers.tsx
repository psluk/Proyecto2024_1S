import LogoutButton from "@renderer/components/LogoutButton";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface UserData {
  userId: number;
  name: string;
  email: string;
}

export default function ManageUsers(): JSX.Element {
  const [students, setStudents] = useState<UserData[]>([]);
  const [professors, setProfessors] = useState<UserData[]>([]);
  const [admins, setAdmins] = useState<UserData[]>([]);

  const fetchData = async () => {
    setStudents(
      await window.database.UserDatabase.getUsersByType("Estudiante"),
    );
    setProfessors(
      await window.database.UserDatabase.getUsersByType("Profesor"),
    );
    setAdmins(
      await window.database.UserDatabase.getUsersByType("Administrador"),
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (email: string) => {
    // Confirm first
    if (!window.confirm("¿Está seguro de que desea eliminar este usuario?")) {
      return;
    }
    await window.database.UserDatabase.deleteUser(email);
    fetchData();
  };

  return (
    <div className="flex flex-col items-center gap-2 p-10">
      <Link
        to="/admin/home"
        className="text-m mb-8 flex w-auto justify-center rounded-md bg-blue-600 px-3 py-1.5 font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Regresar
      </Link>

      <h1 className="text-3xl font-bold">Administrar usuarios</h1>

      <h2 className="mb-2 mt-4 text-xl font-bold">Estudiantes</h2>

      <div className="w-full max-w-7xl overflow-hidden rounded-md shadow-md">
        <table className="w-full table-fixed [&>tbody>tr:nth-child(2n+1)]:bg-slate-50 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-1 [&>thead>tr>th]:px-2 [&>thead>tr>th]:py-1">
          <thead>
            <tr className="bg-sky-600 text-white">
              <th>Nombre</th>
              <th>Correo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {students.length ? (
              students.map((user, index) => (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td className="flex flex-row justify-evenly">
                    <Link to={`/admin/editUser/${user.userId}`}>Editar</Link>
                    <button
                      type="button"
                      onClick={() => {
                        handleDelete(user.email);
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="text-center font-bold italic" colSpan={3}>No hay</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mb-2 mt-4 text-xl font-bold">Profesores</h2>

      <div className="w-full max-w-7xl overflow-hidden rounded-md shadow-md">
        <table className="w-full table-fixed [&>tbody>tr:nth-child(2n+1)]:bg-slate-50 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-1 [&>thead>tr>th]:px-2 [&>thead>tr>th]:py-1">
          <thead>
            <tr className="bg-teal-600 text-white">
              <th>Nombre</th>
              <th>Correo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {professors.length ? (
              professors.map((user, index) => (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td className="flex flex-row justify-evenly">
                    <Link to={`/admin/editUser/${user.userId}`}>Editar</Link>
                    <button
                      type="button"
                      onClick={() => {
                        handleDelete(user.email);
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="text-center font-bold italic" colSpan={3}>No hay</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mb-2 mt-4 text-xl font-bold">Administradores</h2>

      <div className="mb-10 w-full max-w-7xl overflow-hidden rounded-md shadow-md">
        <table className="w-full table-fixed [&>tbody>tr:nth-child(2n+1)]:bg-slate-50 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-1 [&>thead>tr>th]:px-2 [&>thead>tr>th]:py-1">
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th>Nombre</th>
              <th>Correo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {admins.length ? (
              admins.map((user, index) => (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td className="flex flex-row justify-evenly">
                    <Link to={`/admin/editUser/${user.userId}`}>Editar</Link>
                    <button
                      type="button"
                      onClick={() => {
                        handleDelete(user.email);
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="text-center font-bold italic" colSpan={3}>No hay</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <LogoutButton />
    </div>
  );
}
