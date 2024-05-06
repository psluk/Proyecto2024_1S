import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faPlus } from "@fortawesome/free-solid-svg-icons";
import Workload, { WorkloadInterface } from "../../../models/Workload";
import { projectCourses } from "../../../constants/Courses";

export default function WorkloadInfo(props): JSX.Element {
  const [showTables, setShowTables] = useState(false);
  const [workload, setWorkload] = useState<Workload[]>([]);
  const navigate = useNavigate();

  const toggleTables = () => {
    setShowTables(!showTables);
  };

  useEffect(() => {
    if (showTables) {
      const loadedWorkload = window.mainController
        .getWorkloadByProfessorId(props.id as number)
        .map(
          (workload) =>
            Workload.reinstantiate(workload as unknown as WorkloadInterface)!,
        );
      setWorkload(loadedWorkload);
    }
  }, [showTables]);

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
                {workload
                  .filter(
                    (activity) =>
                      activity.getActivityType() === "course" &&
                      !projectCourses.includes(activity.getCode()!),
                  )
                  .map((activity) => (
                    <tr
                      className="border-b border-gray-300"
                      key={activity.getId()}
                    >
                      <td className="px-2">
                        <span className="text-sm font-bold">
                          {activity.getCode()}:{" "}
                        </span>
                        {activity.getName()}{" "}
                        {activity.getGroupNumber() !== null && (
                          <span className="text-xs">
                            (grupo {activity.getGroupNumber()})
                          </span>
                        )}
                      </td>
                      <td className="px-2">{activity.getHours()}</td>
                      <td className="px-2">{activity.getStudents()}</td>
                      <td className="relative space-x-3 px-2">
                        {activity.getWorkload().toLocaleString(["es-CR", "es"])}
                        <Link
                          to={`/admin/editProfessor/${"id"}`}
                          className="absolute right-5 top-1/2 -translate-y-1/2 transform text-sm font-semibold text-blue-600"
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                <tr>
                  <td colSpan={4} className="p-0">
                    <div
                      className="flex w-full cursor-pointer items-center justify-center hover:bg-gray-100"
                      onClick={() =>
                        navigate("/admin/addCourseActivity", {
                          state: {
                            id: props.id,
                            name: props.name,
                          },
                        })
                      }
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
                {workload
                  .filter(
                    (activity) =>
                      activity.getActivityType() === "course" &&
                      projectCourses.includes(activity.getCode()!),
                  )
                  .map((activity) => (
                    <tr
                      className="border-b border-gray-300"
                      key={activity.getId()}
                    >
                      <td className="px-2">
                        <span className="text-sm font-bold">
                          {activity.getCode()}:{" "}
                        </span>
                        {activity.getName()}{" "}
                        {activity.getGroupNumber() !== null && (
                          <span className="text-xs">
                            (grupo {activity.getGroupNumber()})
                          </span>
                        )}
                      </td>
                      <td className="px-2">{activity.getHours()}</td>
                      <td className="px-2">
                        {activity.getStudents()}{" "}
                        {activity.getSuggestedStudents() !== null && (
                          <span
                            className="float-end my-auto cursor-help underline decoration-dashed underline-offset-4"
                            title="Cantidad de estudiantes que se deben asignar de acuerdo con el archivo de Excel"
                          >
                            (de {activity.getSuggestedStudents()})
                          </span>
                        )}
                      </td>
                      <td className="relative space-x-3 px-2">
                        {activity.getWorkload().toLocaleString(["es-CR", "es"])}
                        <Link
                          to={`/admin/editProfessor/${"id"}`}
                          className="absolute right-5 top-1/2 -translate-y-1/2 transform text-sm font-semibold text-blue-600"
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                <tr>
                  <td colSpan={4} className="p-0">
                    <div
                      className="flex w-full cursor-pointer items-center justify-center hover:bg-gray-100"
                      onClick={() =>
                        navigate("/admin/addTFGActivity", {
                          state: {
                            id: props.id,
                            name: props.name,
                          },
                        })
                      }
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
                {workload
                  .filter(
                    (activity) => activity.getActivityType() === "research",
                  )
                  .map((activity) => (
                    <tr
                      className="border-b border-gray-300"
                      key={activity.getId()}
                    >
                      <td className="px-2">{activity.getName()}</td>
                      <td className="relative space-x-3 px-2">
                        {activity.getWorkload().toLocaleString(["es-CR", "es"])}
                        <Link
                          to={`/admin/editProfessor/${"id"}`}
                          className="absolute right-5 top-1/2 -translate-y-1/2 transform text-sm font-semibold text-blue-600"
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                <tr>
                  <td colSpan={4} className="p-0">
                    <div
                      className="flex w-full cursor-pointer items-center justify-center hover:bg-gray-100"
                      onClick={() =>
                        navigate("/admin/addOtherActivity", {
                          state: {
                            id: props.id,
                            name: props.name,
                            pageActivityType: 2,
                          },
                        })
                      }
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
                {workload
                  .filter(
                    (activity) => activity.getActivityType() === "special",
                  )
                  .map((activity) => (
                    <tr
                      className="border-b border-gray-300"
                      key={activity.getId()}
                    >
                      <td className="px-2">{activity.getName()}</td>
                      <td className="relative space-x-3 px-2">
                        {activity.getWorkload().toLocaleString(["es-CR", "es"])}
                        <Link
                          to={`/admin/editProfessor/${"id"}`}
                          className="absolute right-5 top-1/2 -translate-y-1/2 transform text-sm font-semibold text-blue-600"
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                <tr>
                  <td colSpan={4} className="p-0">
                    <div
                      className="flex h-auto w-full cursor-pointer items-center justify-center hover:bg-gray-100"
                      onClick={() =>
                        navigate("/admin/addOtherActivity", {
                          state: {
                            id: props.id,
                            name: props.name,
                            pageActivityType: 3,
                          },
                        })
                      }
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
                {workload
                  .filter(
                    (activity) =>
                      activity.getActivityType() === "administrative",
                  )
                  .map((activity) => (
                    <tr
                      className="border-b border-gray-300"
                      key={activity.getId()}
                    >
                      <td className="px-2">{activity.getName()}</td>
                      <td className="relative space-x-3 px-2">
                        {activity.getWorkload().toLocaleString(["es-CR", "es"])}
                        <Link
                          to={`/admin/editProfessor/${"id"}`}
                          className="absolute right-5 top-1/2 -translate-y-1/2 transform text-sm font-semibold text-blue-600"
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                <tr>
                  <td colSpan={4} className="p-0">
                    <div
                      className="flex w-full cursor-pointer items-center justify-center hover:bg-gray-100"
                      onClick={() =>
                        navigate("/admin/addOtherActivity", {
                          state: {
                            id: props.id,
                            name: props.name,
                            pageActivityType: 4,
                          },
                        })
                      }
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
