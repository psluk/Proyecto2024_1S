import { Link } from "react-router-dom";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faPlus } from "@fortawesome/free-solid-svg-icons";

export default function WorkloadInfo(props): JSX.Element {
  const [showTables, setShowTables] = useState(false);

  const toggleTables = () => {
    setShowTables(!showTables);
  };

  const handleAddItem = () => {
    console.log("Labor agregada");
  };

  return (
    <div className="mb-5 overflow-hidden rounded-md shadow-md">
      <div className=" bg-blue-200">
        <a
          className="px-2 py-1 font-bold text-blue-500 hover:text-blue-700"
          onClick={toggleTables}
        >
          {props.name}
        </a>
      </div>
      {showTables && (
        <div>
          <div className="">
            <table className="w-full table-fixed rounded-md bg-slate-50">
              <thead>
                <tr className="bg-sky-600 text-white">
                  <th className="w-1/2 px-2">
                    <p className="flex items-center justify-start gap-3">
                      Labores docentes
                    </p>
                  </th>
                  <th className="w-1/8 px-2">
                    <p className="flex items-center justify-start gap-3">
                      Horas
                    </p>
                  </th>
                  <th className="w-1/8 px-2 text-start">Estudiantes</th>
                  <th className="w-1/4 bg-blue-800 px-2 text-start">Carga</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="px-2">METODOS NUMERICOS PARA INGENIERIA G1</td>
                  <td className="px-2">4</td>
                  <td className="px-2">24</td>
                  <td className="relative space-x-3 px-2">10.25
                    <Link
                      to={`/admin/editProfessor/${"id"}`}
                      className="absolute right-5 top-1/2 -translate-y-1/2 transform text-sm font-semibold text-blue-600"
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </Link>
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="px-2">MODELACION Y SIMULACION G1</td>
                  <td className="px-2">4</td>
                  <td className="px-2">26</td>
                  <td className="relative space-x-3 px-2">
                    11.75
                    <Link
                      to={`/admin/editProfessor/${"id"}`}
                      className="absolute right-5 top-1/2 -translate-y-1/2 transform text-sm font-semibold text-blue-600"
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </Link>
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="px-2">TRANSFERENCIA DE CALOR Y MASA G1</td>
                  <td className="px-2">4</td>
                  <td className="px-2">16</td>
                  <td className="relative space-x-3 px-2">
                    10
                    <Link
                      to={`/admin/editProfessor/${"id"}`}
                      className="absolute right-5 top-1/2 -translate-y-1/2 transform text-sm font-semibold text-blue-600"
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="p-0">
                    <div
                      className="flex w-full cursor-pointer items-center justify-center hover:bg-gray-100"
                      onClick={handleAddItem}
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        className="text-blue-600"
                      />
                      <span className="ml-2 font-semibold text-blue-600">
                        Agregar labor
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <table className="w-full table-fixed rounded-md bg-slate-50 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-1 [&>thead>tr>th]:px-2 [&>thead>tr>th]:py-1">
              <thead>
                <tr className="bg-red-600 text-white">
                  <th className="w-1/2">
                    <p className="flex items-center justify-start gap-3">
                      Labores TFG
                    </p>
                  </th>
                  <th className="w-1/8">
                    <p className="flex items-center justify-start gap-3">
                      Horas
                    </p>
                  </th>
                  <th className="w-1/8 text-start">Estudiantes</th>
                  <th className="w-45 w-1/4 bg-blue-800 text-start">Carga</th>
                </tr>
              </thead>
              <tbody>
              <tr className="border-b border-gray-300">
                  <td className="px-2">PRÁCTICA DIRIGIDA G1</td>
                  <td className="px-2">2</td>
                  <td className="px-2"></td>
                  <td className="relative space-x-3 px-2">
                    0
                    <Link
                      to={`/admin/editProfessor/${"id"}`}
                      className="absolute right-5 top-1/2 -translate-y-1/2 transform text-sm font-semibold text-blue-600"
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </Link>
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="px-2">PROYECTO FINAL DE GRADUACION G1</td>
                  <td className="px-2">2</td>
                  <td className="px-2">2</td>
                  <td className="relative space-x-3 px-2">
                    4
                    <Link
                      to={`/admin/editProfessor/${"id"}`}
                      className="absolute right-5 top-1/2 -translate-y-1/2 transform text-sm font-semibold text-blue-600"
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </Link>
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="px-2">PROY. DE GRADUACIÓN (lecturas)</td>
                  <td className="px-2">1</td>
                  <td className="px-2"></td>
                  <td className="relative space-x-3 px-2">
                    0
                    <Link
                      to={`/admin/editProfessor/${"id"}`}
                      className="absolute right-5 top-1/2 -translate-y-1/2 transform text-sm font-semibold text-blue-600"
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="p-0">
                    <div
                      className="flex w-full cursor-pointer items-center justify-center hover:bg-gray-100"
                      onClick={handleAddItem}
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        className="text-blue-600"
                      />
                      <span className="ml-2 font-semibold text-blue-600">
                        Agregar labor
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <table className="w-full table-auto rounded-md bg-slate-50 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-1 [&>thead>tr>th]:px-2 [&>thead>tr>th]:py-1">
              <thead>
                <tr className="bg-yellow-600 text-white">
                  <th className="w-3/8">
                    <p className="flex items-center justify-start gap-3">
                      Labores de investigación
                    </p>
                  </th>
                  <th className="w-45 w-1/4 bg-blue-800 text-start">Carga</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-300">
                  <td>Proyecto 9</td>
                  <td className="space-x-3">
                    10

                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td>Proyecto 5</td>
                  <td className="space-x-3">
                    4

                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="p-0">
                    <div
                      className="flex w-full cursor-pointer items-center justify-center hover:bg-gray-100"
                      onClick={handleAddItem}
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        className="text-blue-600"
                      />
                      <span className="ml-2 font-semibold text-blue-600">
                        Agregar labor
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <table className="w-full table-auto rounded-md bg-slate-50 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-1 [&>thead>tr>th]:px-2 [&>thead>tr>th]:py-1">
              <thead>
                <tr className="bg-cyan-600 text-white">
                  <th className="w-3/8">
                    <p className="flex items-center justify-start gap-3">
                      Labores Especiales
                    </p>
                  </th>
                  <th className="w-45 w-1/4 bg-blue-800 text-start">Carga</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="p-0">
                    <div
                      className="flex h-auto w-full cursor-pointer items-center justify-center hover:bg-gray-100"
                      onClick={handleAddItem}
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        className="text-blue-600"
                      />
                      <span className="ml-2 font-semibold text-blue-600">
                        Agregar labor
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <table className="w-full table-auto rounded-md bg-slate-50 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-1 [&>thead>tr>th]:px-2 [&>thead>tr>th]:py-1">
              <thead>
                <tr className="bg-purple-600 text-white">
                  <th className="w-3/8">
                    <p className="flex items-center justify-start gap-3">
                      Labores Académicas-Administrativas
                    </p>
                  </th>
                  <th className="w-45 w-1/4 bg-blue-800 text-start">Carga</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-300">
                  <td>Miembro U.I.P</td>
                  <td className="space-x-3">
                    4
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="p-0">
                    <div
                      className="flex w-full cursor-pointer items-center justify-center hover:bg-gray-100"
                      onClick={handleAddItem}
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        className="text-blue-600"
                      />
                      <span className="ml-2 font-semibold text-blue-600">
                        Agregar labor
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
