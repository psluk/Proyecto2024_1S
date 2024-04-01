import { useState } from "react";
import electronLogo from ".././assets/electron.svg";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  let navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  // Event handler to handle password change
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  // Event handler to handle login
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await window.database.UserDatabase.login(
        email,
        password,
      );

      // Correct credentials
      if (response) {
        const type = response.userTypeId;
        if (type === 1) {
          console.log("Es de tipo " + type);
          navigate("/admin/home");
        } else if (type === 2) {
          navigate("/professor/home");
        } else if (type === 3) {
          navigate("/student/home");
        } else {
          // Unknown user type
          alert("Tipo de usuario no reconocido");
        }
      } else {
        // Wrong credentials
        return setShowError(true);
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert(
        "Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.",
      );
    }
  };

  return (
    <>
      <main className="px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img className="mx-auto h-10 w-auto" src={electronLogo} alt="logo" />
          <h2 className="text-white-900 mt-10 text-center text-3xl font-bold leading-9 tracking-tight">
            Iniciar sesión
          </h2>

          {showError && (
            <div
              className="mb-4 mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-800"
              role="alert"
            >
              <span className="font-medium">¡No se ha iniciado sesión!</span>{" "}
              Credenciales incorrectas
            </div>
          )}
        </div>

        <div className="mt-3 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="text-white-900 text-m block font-medium leading-6"
              >
                Correo electrónico
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  onChange={handleEmailChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-white-900 text-m mr-10 block font-medium leading-6"
                >
                  Contraseña
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  onChange={handlePasswordChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Iniciar sesión
              </button>
            </div>
          </form>

          <p className="text-m mt-10 text-center text-gray-500">
            ¿No tienes cuenta?
            <Link
              to={"/register"}
              className="font-semibold leading-6 text-blue-600 hover:text-blue-500"
            >
              {" "}
              Crear cuenta
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
