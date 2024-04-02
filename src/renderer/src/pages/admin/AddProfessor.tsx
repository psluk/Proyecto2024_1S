import { useNavigate } from "react-router-dom";
import { ProfessorModel } from "../../../../models/ProfessorModel";

export default function AddProfessor() {
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value || undefined;
    const professorType = (
      form.elements.namedItem("professorType") as HTMLSelectElement
    ).value;

    const professor = new ProfessorModel(name, professorType, email);
    try {
      const result = await window.database.ProfessorDatabase.addProfessor(professor);
      if (!result) {
        alert("Error al agregar profesor");
        return;
      }
      alert("Profesor agregado con éxito");
      navigate("/admin/manageProfessors");
    } catch {
      alert("Error al agregar profesor");
    }
  };

  return (
    <main className="gap-10">
      <h1 className="text-3xl font-bold">Agregar profesor</h1>
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
            htmlFor="professorType"
            className="text-white-900 block text-sm font-medium leading-6"
          >
            Tipo
          </label>
          <select
            id="professorType"
            className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600"
            required
          >
            <option value="De planta">De planta</option>
            <option value="Interino">Interino</option>
          </select>
        </div>
        <button
          type="submit"
          className="mt-4 w-full rounded-md bg-blue-600 px-3 py-1.5 font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Agregar
        </button>
      </form>
    </main>
  );
}
