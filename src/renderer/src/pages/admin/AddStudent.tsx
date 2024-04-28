import { useNavigate } from "react-router-dom";
import DialogAlert from "@renderer/components/DialogAlert";
import { useState, useEffect } from "react";

export default function AddStudent() {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [typeDialog, setTypeDialog] = useState<"success" | "error">("success");
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isChecked, setIsEnabled] = useState(false);

  useEffect(() => {
    if (message !== "") {
      setShowDialog(true); // Only show dialog if message is not empty
    }
  }, [message]);

  const handleToggleChange = (isChecked) => {
    setIsEnabled(isChecked); // Actualiza el estado cuando cambia el toggle
  };

  //--------------------------------------------------------------------------------

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const carnet = (form.elements.namedItem("studentId") as HTMLInputElement)
      .value;
    const toggleValue = isChecked;

    try {
      window.mainController.addStudent(name, phone, email, carnet, toggleValue);
      setTitle("Éxito");
      setTypeDialog("success");
      setMessage("Estudiante agregado con éxito");
    } catch {
      setTitle("Error");
      setTypeDialog("error");
      setMessage("Error al agregar estudiante");
    }
  };

  //--------------------------------------------------------------------------------

  return (
    <main className="gap-10">
      <h1 className="text-3xl font-bold">Agregar estudiante</h1>
      <form
        className="flex w-full max-w-2xl flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <div className="flex w-full flex-col gap-3">
          <label
            htmlFor="name"
            className="text-white-900 block text-sm font-medium leading-6"
          >
            Nombre
          </label>
          <input
            type="text"
            id="name"
            className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600"
            required
          />
        </div>
        <div className="flex w-full flex-col gap-3">
          <label
            htmlFor="phone"
            className="text-white-900 block text-sm font-medium leading-6"
          >
            Teléfono
          </label>
          <input
            type="text"
            id="phone"
            className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600"
            required
          />
        </div>
        <div className="flex w-full flex-col gap-3">
          <label
            htmlFor="email"
            className="text-white-900 block text-sm font-medium leading-6"
          >
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600"
          />
        </div>
        <div className="flex w-full flex-col gap-3">
          <label
            htmlFor="studentId"
            className="text-white-900 block text-sm font-medium leading-6"
          >
            Carnet
          </label>
          <input
            type="text"
            id="studentId"
            className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600"
            required
          />
        </div>
        <div className="flex w-full flex-col gap-3">
          <label
            htmlFor="studentId"
            className="text-white-900 block text-sm font-medium leading-6"
          >
            Habilitado
          </label>
          <div>
            <input
              type="checkbox"
              id="enabled"
              checked={isChecked}
              onChange={(e) => handleToggleChange(e.target.checked)}
              className="hidden"
            />
            <label
              htmlFor="enabled"
              className="flex cursor-pointer items-center"
            >
              <div
                className={`h-7 w-14 rounded-full p-1 ${isChecked ? "bg-lime-400" : "bg-slate-50"}`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-slate-600 ${isChecked ? "translate-x-7" : "translate-x-0"}`}
                />
              </div>
              <span className="ml-3">{isChecked ? "Sí" : "No"}</span>
            </label>
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 w-full rounded-md bg-teal-500 px-3 py-1.5 font-semibold text-white shadow-sm hover:bg-teal-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        >
          Agregar
        </button>
      </form>
      <DialogAlert
        show={showDialog}
        type={typeDialog}
        title={title}
        message={message}
        handleConfirm={() => {
          setShowDialog(false);
          typeDialog === "success" && navigate("/admin/manageStudents");
        }}
      />
    </main>
  );
}
