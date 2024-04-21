import { SetStateAction, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import User from "../../../models/User";
import DialogAlert from "@renderer/components/DialogAlert";

function Register(): JSX.Element {
  const navigate = useNavigate();

  const [showError, setShowError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showDialog, setShowDialog] = useState<boolean>(false);

  const handleNameChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setName(event.target.value);
  };

  const handleEmailChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setShowError(false);
    setEmailError(false);
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setPassword(event.target.value);
  };

  const createUser = (event: React.FormEvent) => {
    event.preventDefault();

    let newUser: User | null;

    try {
      newUser = User.reinstantiate(
        window.mainController.addUser(name, email, password),
      );
    } catch {
      newUser = null;
    }

    if (!newUser) {
      setShowError(true);
    }

    if (newUser) {
      setShowDialog(true);
    }
  };

  return (
    <main className="gap-10">
      <div>
        <h1 className="text-white-900 mt-10 text-center text-3xl font-bold leading-9 tracking-tight">
          Crear cuenta
        </h1>
        <p className="text-white-600 mt-1 text-sm leading-6">
          Ingrese la información solicitada para crear su cuenta.
        </p>
      </div>

      <form
        onSubmit={createUser}
        className="flex w-full max-w-sm flex-col items-center justify-center gap-4"
      >
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
            onChange={handleNameChange}
            className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-sm"
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
            onChange={handleEmailChange}
            className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-sm"
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
            required
            onChange={handlePasswordChange}
            className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-sm"
            placeholder="Contraseña"
          />
        </div>
        <button
          type="submit"
          className="mt-4 w-full rounded-md bg-blue-600 px-3 py-1.5 font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Registrarme
        </button>
        <p>
          ¿Ya tienes cuenta?{" "}
          <Link to="/" className="text-blue-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
        <div className="border-b border-gray-900/10 pb-12">
          {showError && (
            <div
              className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-800"
              role="alert"
            >
              <span className="font-medium">
                Correo ya en uso. Utilice otro.
              </span>
            </div>
          )}
          {emailError && (
            <div
              className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-800"
              role="alert"
            >
              <span className="font-medium">
                Por favor, utilice un correo institucional.
              </span>
            </div>
          )}
        </div>
      </form>
      <DialogAlert
        title="¡Éxito!"
        message="¡Usuario creado con éxito!"
        show={showDialog}
        handleConfirm={() => {
          setShowDialog(!showDialog);
          navigate("/");
        }}
        type="success"
      />
    </main>
  );
}

export default Register;
