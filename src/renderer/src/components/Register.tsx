import { useState } from "react";
import { Link } from "react-router-dom";

function Register(): JSX.Element {
  const [showError, setShowError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const itcrDomain = /@(itcr\.ac\.cr)$/;
  const estudiantecDomain = /@(estudiantec\.cr)$/;

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const createUser = async (event: React.FormEvent) => {
    event.preventDefault();

    let userType = 0;

    if (itcrDomain.test(email)) {
      userType = 2;
    } else if (estudiantecDomain.test(email)) {
      userType = 3;
    } else {
      setEmailError(true);
      return;
    }

    const newUser = await window.BaseDatos.UsuariosDB.register(
      name,
      email,
      password,
      userType,
    );
    if (!newUser) {
      setShowError(true);
    }

    console.log(newUser);
  };

  return (
    <>
      <div className="items flex w-full flex-col gap-10">
        <Link to={"/"} className="text-blue-600">
          Volver al inicio
        </Link>
      </div>
      <form onSubmit={createUser}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-white-900 text-base font-semibold leading-7">
              Crear cuenta
            </h2>
            <p className="text-white-600 mt-1 text-sm leading-6">
              Ingrese la información solicitada para crear su cuenta.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label
                  htmlFor="name"
                  className="text-white-900 block text-sm font-medium leading-6"
                >
                  Nombre Completo
                </label>
                <div className=" mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-md">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    autoComplete="name"
                    required
                    onChange={handleNameChange}
                    className="text-white-900 block flex-1 border-0 bg-transparent py-1.5 pl-1 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="Nombre completo"
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label
                  htmlFor="name"
                  className="text-white-900 block text-sm font-medium leading-6"
                >
                  Correo Electrónico
                </label>
                <div className=" mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-md">
                  <input
                    type="text"
                    name="email"
                    id="email"
                    autoComplete="email"
                    required
                    onChange={handleEmailChange}
                    className="text-white-900 block flex-1 border-0 bg-transparent py-1.5 pl-1 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="@itcr.ac.cr / @estudiantec.cr"
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label
                  htmlFor="name"
                  className="text-white-900 block text-sm font-medium leading-6"
                >
                  Contraseña
                </label>
                <div className=" mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-md">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    autoComplete="password"
                    required
                    onChange={handlePasswordChange}
                    className="text-white-900 block flex-1 border-0 bg-transparent py-1.5 pl-1 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="Contraseña"
                  />
                </div>
              </div>
            </div>

            {showError && (
              <div
                className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-gray-800 dark:text-red-400"
                role="alert"
              >
                <span className="font-medium">
                  Correo ya en uso, utilice otro
                </span>
              </div>
            )}
            {emailError && (
              <div
                className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-gray-800 dark:text-red-400"
                role="alert"
              >
                <span className="font-medium">
                  Por favor, utilice un correo institucional
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-x-6">
          <button type="button" className="text-sm font-semibold leading-6">
            <Link to={"/"} className="text-white-600">
              Cancelar
            </Link>
          </button>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Registrarme
          </button>
        </div>
      </form>
    </>
  );
}

export default Register;
