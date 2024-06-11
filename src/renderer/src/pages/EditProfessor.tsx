import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { professorTypes } from "../constants/RecordTypes";
import Professor from "../../../models/Professor";
import DialogAlert from "@renderer/components/DialogAlert";

interface ProfessorData {
  id: number;
  type: string;
  name: string;
  email: string;
}

export default function EditProfessor(): React.ReactElement | undefined {
  const { id } = useParams();
  const [professorData, setProfessorData] = useState<ProfessorData | undefined>(
    undefined,
  );
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [typeDialog, setTypeDialog] = useState<"success" | "error">("success");

  const handleUpdate = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (professorData) {
      const { id, name, email, type } = professorData;
      if (!name.trim() || !type) {
        setTitle("Campos vacíos");
        setTypeDialog("error");
        setMessage("Por favor, complete todos los campos");
        return;
      }

      try {
        window.mainController.updateProfessor(id, type, name, email);
        setTitle("Éxito");
        setTypeDialog("success");
        setMessage("Profesor modificado con éxito");
      } catch (error) {
        setTitle("Error");
        setTypeDialog("error");
        setMessage("Error al modificar profesor");
      }
    }
  };

  const fetchData = (): void => {
    const professor = Professor.reinstantiate(
      window.mainController.getProfessorById(parseInt(id!)),
    );
    if (professor) {
      setProfessorData({
        id: professor.getId(),
        name: professor.getName(),
        email: professor.getEmail() || "",
        type: professor.getType(),
      });
    }
  };

  useEffect(() => {
    if (!id) {
      navigate(-1);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (message !== "") {
      setShowDialog(true);
    }
  }, [message]);

  const updateData = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    setProfessorData({
      ...professorData!,
      [event.target.id]: event.target.value,
    });
  };

  return (
    professorData && (
      <main className="gap-10">
        <h1 className="text-3xl font-bold">Editar profesor</h1>
        <form
          className="flex w-full max-w-2xl flex-col gap-4"
          onSubmit={handleUpdate}
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
              value={professorData.name}
              onChange={updateData}
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
              value={professorData.email}
              onChange={updateData}
            />
          </div>
          <div className="flex w-full flex-col gap-3">
            <label
              htmlFor="professorType"
              className="text-white-900 block text-sm font-medium leading-6"
            >
              Tipo
            </label>
            <select
              id="type"
              className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600"
              required
              value={professorData.type}
              onChange={updateData}
            >
              {professorTypes.map((type, index) => (
                <option key={index} value={type.value}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-blue-600 px-3 py-1.5 font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Actualizar
          </button>
        </form>
        <DialogAlert
          show={showDialog}
          handleConfirm={() => {
            setShowDialog(false);
            typeDialog === "success" && navigate(-1);
          }}
          message={message}
          title={title}
          type={typeDialog}
        />
      </main>
    )
  );
}
