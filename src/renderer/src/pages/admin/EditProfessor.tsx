import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { professorTypes } from "../../constants/RecordTypes";
import Professor from "../../../../models/Professor";

interface ProfessorData {
  id: number;
  type: string;
  name: string;
  email: string;
}

export default function EditProfessor() {
  const { id } = useParams();
  const [professorData, setProfessorData] = useState<ProfessorData | undefined>(
    undefined,
  );
  const navigate = useNavigate();

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (professorData) {
      const { id, name, email, type } = professorData;
      if (!name || !type) {
        alert("Por favor, complete todos los campos");
        return;
      }

      try {
        window.mainController.updateProfessor(id, type, name, email);
        alert("Profesor modificado con éxito");
        navigate("/admin/manageProfessors");
      } catch (error) {
        alert("Error al modificar profesor");
      }
    }
  };

  const fetchData = () => {
    const professor = Professor.reinstantiate(window.mainController.getProfessorById(parseInt(id!)));
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
      navigate("/admin/manageProfessors");
    }
    fetchData();
  }, []);

  const updateData = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
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
      </main>
    )
  );
}
