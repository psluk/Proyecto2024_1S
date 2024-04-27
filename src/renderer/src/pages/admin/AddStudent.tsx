import { useNavigate } from "react-router-dom";
import DialogAlert from "@renderer/components/DialogAlert";
import { useState, useEffect } from "react";

export default function AddStudent() {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [typeDialog, setTypeDialog] = useState<"success" | "error">("success");
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (message !== "") {
      setShowDialog(true); // Only show dialog if message is not empty
    }
  }, [message]);

  const handleCheckboxChange = () => {
    setIsChecked((prevChecked) => !prevChecked);
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
          <div style={{ position: "relative" }}>
            <input
              type="checkbox"
              id="enabled"
              checked={isChecked}
              onChange={handleCheckboxChange}
              className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-lime-400 checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-lime-400 checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:bg-lime-400 checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-lime-400 dark:checked:after:bg-lime-500 dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
            />
            <label
              htmlFor="myCheckbox"
              className="inline-block pl-[0.15rem] hover:cursor-pointer"
            >
              {isChecked ? "Sí" : "No"}
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
