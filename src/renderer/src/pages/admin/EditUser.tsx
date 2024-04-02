import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

interface UserDetails {
  type: string;
  name: string;
  email: string;
  password: string;
}

export default function EditUser(): JSX.Element {
  const { userId } = useParams();
  const [userData, setUserData] = useState<UserDetails | undefined>(undefined);
  const navigate = useNavigate();

  const handleUserUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (userData) {
      try {
        await window.database.UserDatabase.updateUser(
          userId,
          userData.type,
          userData.name,
          userData.email,
          userData.password,
        );
        alert("Usuario modificado con éxito");
        navigate("/admin/manageUsers");
      } catch (error) {
        alert("Error al modificar usuario");
      }
    }
  };

  const fetchData = async () => {
    const user = await window.database.UserDatabase.getUser(userId);
    console.log(userId)
    if (user) {
      setUserData(user);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main className="gap-10">
      <Link
        to="/admin/manageUsers"
        className="text-m mb-8 flex w-auto justify-center rounded-md bg-blue-600 px-3 py-1.5 font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Regresar
      </Link>

      <h1 className="text-3xl font-bold">Modificar usuario</h1>

      <form
        onSubmit={handleUserUpdate}
        className="flex w-full max-w-md flex-col items-center justify-center gap-4"
      >
        {userData && (
          <>
            <div className="flex w-full flex-col gap-3">
              <label
                htmlFor="userType"
                className="text-white-900 block text-sm font-medium leading-6"
              >
                Tipo de usuario
              </label>
              <select
                className="rounded-md"
                name="userType"
                id="userType"
                value={userData.type}
                onChange={(event) => {
                  setUserData({ ...userData, type: event.target.value });
                }}
              >
                <option value="Student">Estudiante</option>
                <option value="Professor">Profesor</option>
                <option value="Administrator">Administrador</option>
              </select>
            </div>
            <div className="flex w-full flex-col gap-3">
              <label
                htmlFor="name"
                className="text-white-900 block text-sm font-medium leading-6"
              >
                Nombre completo
              </label>
              <input
                type="text"
                name="name"
                id="name"
                autoComplete="name"
                required
                value={userData.name}
                onChange={(event) => {
                  setUserData({ ...userData, name: event.target.value });
                }}
                className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-md"
                placeholder="Nombre completo"
              />
            </div>
            <div className="flex w-full flex-col gap-3">
              <label
                htmlFor="name"
                className="text-white-900 block text-sm font-medium leading-6"
              >
                Correo institucional
              </label>
              <input
                type="text"
                name="email"
                id="email"
                autoComplete="email"
                required
                value={userData.email}
                onChange={(event) => {
                  setUserData({ ...userData, email: event.target.value });
                }}
                className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-md"
                placeholder="@itcr.ac.cr / @estudiantec.cr"
              />
            </div>
            <div className="flex w-full flex-col gap-3">
              <label
                htmlFor="name"
                className="text-white-900 block text-sm font-medium leading-6"
              >
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                id="password"
                autoComplete="new-password"
                value={userData.password}
                onChange={(event) => {
                  setUserData({ ...userData, password: event.target.value });
                }}
                className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-md"
                placeholder="Digite para reemplazar"
              />
            </div>
          </>
        )}
        <button
          type="submit"
          className="mt-4 w-2/3 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Guardar cambios
        </button>
      </form>
    </main>
  );
}
