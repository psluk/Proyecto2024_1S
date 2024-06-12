import { useLocation, useNavigate } from "react-router-dom";
import React from "react";

export default function NotFound(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <main className="px-6 py-12 lg:px-8">
      <h1 className="text-3xl font-bold">Función no implementada</h1>
      <p className="text-gray-600">
        Aún no se ha implementado esta función. Por favor, inténtelo más tarde.
      </p>
      <div className="flex flex-col items-center py-4">
        <p className="text-gray-600">
          Sírvase de proporcionar esta ruta al equipo de desarrollo:
        </p>
        <code className="rounded-md bg-red-300 px-2 text-red-700">
          {location.pathname}
        </code>
      </div>
      <button
        type="submit"
        className="mt-2 flex justify-center rounded-md bg-blue-600 px-3 py-1.5 font-semibold leading-6 text-white shadow-md transition hover:bg-blue-500"
        onClick={() => {
          navigate("/");
        }}
      >
        Regresar al inicio
      </button>
    </main>
  );
}
