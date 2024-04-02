import { useNavigate, useParams } from "react-router-dom";
import { ProfessorModel } from "../../../../models/ProfessorModel";
import { useEffect, useState } from "react";

export default function EditProfessor() {
  const { professorId } = useParams();
  const [professorData, setProfessorData] = useState<any>(undefined);
  const navigate = useNavigate();

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (professorData) {
      try {
        const result = await window.database.ProfessorDatabase.updateProfessor(
          new ProfessorModel(
            professorData.name,
            professorData.professorType,
            professorData.email || undefined,
            parseInt(professorId!),
          ),
        );

        if (!result) {
          alert("Error al modificar profesor");
          return;
        }
        alert("Profesor modificado con éxito");
        navigate("/admin/manageProfessors");
      } catch (error) {
        alert("Error al modificar profesor");
      }
    }
  };

  const fetchData = async () => {
    const professor = await window.database.ProfessorDatabase.getProfessor(
      parseInt(professorId!),
    );
    if (professor) {
      setProfessorData({
        ...professor,
        professorType:
          professor.professorType 
      });
    }
  };

  useEffect(() => {
    if (!professorId) {
      navigate("/admin/manageProfessors");
    }
    fetchData();
  }, []);

  const updateData = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setProfessorData({
      ...professorData,
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
              value={professorData.email || ""}
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
              id="professorType"
              className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600"
              required
              value={professorData.professorType}
              onChange={updateData}
            >
              <option value="Permanent">De planta</option>
              <option value="Temporary">Interino</option>
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
