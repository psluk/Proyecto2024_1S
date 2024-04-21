import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import User from "../../../../models/User";
import DialogAlert from "@renderer/components/DialogAlert";
import DialogConfirm from "@renderer/components/DialogConfirm";

export default function ManageUsers(): JSX.Element {
  const [students, setStudents] = useState<User[]>([]);
  const [professors, setProfessors] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [showDialogConfirm, setShowDialogConfirm] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<number>(0);

  const fetchData = () => {
    setStudents(
      window.mainController
        .getUsersByType("Student")
        .map((user) => User.reinstantiate(user) as User),
    );
    setProfessors(
      window.mainController
        .getUsersByType("Professor")
        .map((user) => User.reinstantiate(user) as User),
    );
    setAdmins(
      window.mainController
        .getUsersByType("Administrator")
        .map((user) => User.reinstantiate(user) as User),
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = (id: number) => {
    setUserToDelete(id);
    setShowDialogConfirm(true);
  };

  const deleteUser = () => {
    try {
      window.mainController.deleteUser(userToDelete);
    } catch (error) {
      setShowDialog(true);
      return;
    }
    fetchData();
  };
  return (
    <main className="gap-2">
      <Link
        to="/admin/home"
        className="text-m mb-8 flex w-auto justify-center rounded-md bg-blue-600 px-3 py-1.5 font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Regresar
      </Link>

      <h1 className="text-3xl font-bold">Administrar usuarios</h1>

      <h2 className="mb-2 mt-4 text-xl font-bold">Estudiantes</h2>

      <div>
        <div className="w-full max-w-7xl overflow-hidden rounded-md shadow-md">
          <table className="h-min w-full table-fixed [&>tbody>tr:nth-child(2n+1)]:bg-slate-50 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-1 [&>thead>tr>th]:px-2 [&>thead>tr>th]:py-1">
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
                    <td>{user.getName()}</td>
                    <td>{user.getEmail()}</td>
                    <td className="flex flex-row justify-evenly">
                      <Link to={`/admin/editUser/${user.getId()}`}>Editar</Link>
                      <button
                        type="button"
                        onClick={() => {
                          handleDelete(user.getId());
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="text-center font-bold italic" colSpan={3}>
                    No hay
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="mb-2 mt-4 text-xl font-bold">Profesores</h2>

      <div>
        <div className="w-full max-w-7xl overflow-hidden rounded-md shadow-md">
          <table className="h-min w-full table-fixed [&>tbody>tr:nth-child(2n+1)]:bg-slate-50 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-1 [&>thead>tr>th]:px-2 [&>thead>tr>th]:py-1">
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
                    <td>{user.getName()}</td>
                    <td>{user.getEmail()}</td>
                    <td className="flex flex-row justify-evenly">
                      <Link to={`/admin/editUser/${user.getId()}`}>Editar</Link>
                      <button
                        type="button"
                        onClick={() => {
                          handleDelete(user.getId());
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="text-center font-bold italic" colSpan={3}>
                    No hay
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="mb-2 mt-4 text-xl font-bold">Administradores</h2>
      <div>
        <div className="mb-10 w-full max-w-7xl overflow-hidden rounded-md shadow-md">
          <table className="h-min w-full table-fixed [&>tbody>tr:nth-child(2n+1)]:bg-slate-50 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-1 [&>thead>tr>th]:px-2 [&>thead>tr>th]:py-1">
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
                    <td>{user.getName()}</td>
                    <td>{user.getEmail()}</td>
                    <td className="flex flex-row justify-evenly">
                      <Link to={`/admin/editUser/${user.getId()}`}>Editar</Link>
                      <button
                        type="button"
                        onClick={() => {
                          handleDelete(user.getId());
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="text-center font-bold italic" colSpan={3}>
                    No hay
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <DialogAlert
        type="error"
        title="Error"
        message="No se pudo eliminar al usuario."
        show={showDialog}
        handleConfirm={() => setShowDialog(false)}
      />
      <DialogConfirm
        title="Eliminar usuario"
        message="¿Está seguro de que desea eliminar este usuario?"
        show={showDialogConfirm}
        handleConfirm={() => deleteUser()}
        handleCancel={() => setShowDialogConfirm(false)}
      />
    </main>
  );
}
