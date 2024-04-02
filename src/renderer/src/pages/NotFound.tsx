import { useNavigate } from "react-router-dom";

export default function NotFound(): JSX.Element {
  const navigate = useNavigate();

  return (
    <main className="px-6 py-12 lg:px-8">
      <h1 className="text-3xl font-bold">Función no implementada</h1>
      <p className="text-gray-600">
        Aún no se ha implementado esta función. Por favor, inténtelo más tarde.
      </p>
      <button
        type="submit"
        className="mt-5 flex justify-center rounded-md bg-blue-600 px-3 py-1.5 font-semibold leading-6 text-white shadow-md transition hover:bg-blue-500"
        onClick={() => {
          navigate("/admin/home");
        }}
      >
        Regresar al inicio
      </button>
    </main>
  );
}
