import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateLeft,
  faCheck,
  faPen,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Workload, { WorkloadInterface } from "../../../models/Workload";
import { projectCourses as ProjectCourses } from "../../../constants/Courses";
import Course from "../../../models/Course";
import {
  experienceFactors,
  WorkloadTypes,
  WorkloadValue,
} from "../constants/WorkloadParameters";
import DialogConfirm from "./DialogConfirm";

interface WorkloadProps {
  id: number;
  name: string;
}

export default function WorkloadInfo({
  name,
  id,
}: WorkloadProps): React.ReactElement {
  const [showTables, setShowTables] = useState(false);
  const [workload, setWorkload] = useState<Workload[]>([]);
  const navigate = useNavigate();
  const [idCurrentlyEditing, setIdCurrentlyEditing] = useState<number | null>(
    null,
  );
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [projectCourses, setProjectCourses] = useState<Course[]>([]);
  const [activityBeingEdited, setActivityBeingEdited] =
    useState<WorkloadInterface | null>(null);
  const [showDialogConfirm, setShowDialogConfirm] = useState<boolean>(false);
  const [handleConfirm, setHandleConfirm] = useState<() => void>(() => {});
  let selectedId: number | null = null;
  const [confirmationTitle, setConfirmationTitle] = useState<string>("");
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");

  const toggleTables = (): void => {
    setShowTables(!showTables);
  };

  useEffect(() => {
    const loadedCourses = window.mainController.getCourses();
    setAllCourses(
      loadedCourses.map((course) => Course.reinstantiate(course) as Course),
    );
    setCourses(
      loadedCourses
        .filter((course) => !ProjectCourses.includes(course.code))
        .map((course) => Course.reinstantiate(course) as Course),
    );
    setProjectCourses(
      loadedCourses
        .filter((course) => ProjectCourses.includes(course.code))
        .map((course) => Course.reinstantiate(course) as Course),
    );
  }, []);

  useEffect(() => {
    console.log(projectCourses);
  }, [projectCourses]);

  useEffect(() => {
    if (showTables) {
      const loadedWorkload = window.mainController
        .getWorkloadByProfessorId(id as number)
        .map(
          (workload) =>
            Workload.reinstantiate(workload as unknown as WorkloadInterface)!,
        );
      console.log(loadedWorkload);
      setWorkload(loadedWorkload);
    }
  }, [showTables]);

  useEffect(() => {
    if (idCurrentlyEditing !== null) {
      setActivityBeingEdited(
        workload.find((w) => w.getId() === idCurrentlyEditing)!.asObject()!,
      );
    } else {
      setActivityBeingEdited(null);
    }
  }, [idCurrentlyEditing]);

  const updateCourse = (code: string): void => {
    const newCourse = allCourses.find((course) => course.getCode() === code)!;
    setActivityBeingEdited({
      ...activityBeingEdited!,
      code,
      name: newCourse.getName(),
      hours: newCourse.getHours(),
    });
  };

  const editSelectedId = (): void => {
    setIdCurrentlyEditing(selectedId);
    setShowDialogConfirm(false);
  };

  const editActivity = (id: number): void => {
    if (idCurrentlyEditing !== null) {
      setConfirmationTitle("Deshacer cambios");
      setConfirmationMessage(
        "Para editar otra actividad, se desharán los cambios realizados en la actividad actual. ¿Desea continuar?",
      );
      selectedId = id;
      setHandleConfirm(() => editSelectedId);
      setShowDialogConfirm(true);
    } else {
      setIdCurrentlyEditing(id);
    }
  };

  const deleteSelectedId = (): void => {
    if (selectedId !== null) {
      window.mainController.deleteActivity(selectedId);
      setWorkload(workload.filter((w) => w.getId() !== selectedId));
    }
    setShowDialogConfirm(false);
  };

  const deleteActivity = (id: number): void => {
    setConfirmationTitle("Eliminar actividad");
    setConfirmationMessage(
      "¿Está seguro de que desea eliminar la actividad seleccionada?",
    );
    selectedId = id;
    setHandleConfirm(() => deleteSelectedId);
    setShowDialogConfirm(true);
  };

  const saveChanges = (): void => {
    if (activityBeingEdited !== null) {
      const updatedWorkload = workload.map((w) => {
        if (w.getId() === idCurrentlyEditing) {
          return Workload.reinstantiate(activityBeingEdited)!;
        }
        return w;
      });
      setWorkload(updatedWorkload);
      setIdCurrentlyEditing(null);
      window.mainController.updateWorkload(
        activityBeingEdited.id!,
        activityBeingEdited.name,
        activityBeingEdited.hours,
        activityBeingEdited.code
          ? activityBeingEdited.students || 0
          : activityBeingEdited.students,
        activityBeingEdited.workload,
        activityBeingEdited.workloadType,
        id,
        activityBeingEdited.groupNumber,
        activityBeingEdited.suggestedStudents,
        activityBeingEdited.code,
        activityBeingEdited.experienceFactor,
      );
    }
  };

  useEffect(() => {
    // Recalculate the workload when the activity being edited changes
    // Only if it is a course activity
    if (
      activityBeingEdited?.code &&
      activityBeingEdited?.students !== null &&
      activityBeingEdited?.groupNumber !== null &&
      activityBeingEdited?.experienceFactor &&
      activityBeingEdited?.hours !== null
    ) {
      const course = courses.find(
        (course) => course.getCode() === activityBeingEdited.code,
      );
      if (course) {
        try {
          const newWorkload = window.mainController.getCalculatedWorkload(
            activityBeingEdited.code,
            activityBeingEdited.students,
            activityBeingEdited.hours,
            activityBeingEdited.experienceFactor,
            activityBeingEdited.groupNumber,
            id,
          );
          setActivityBeingEdited({
            ...activityBeingEdited,
            workload: newWorkload,
          });
        } catch (error) {
          /* empty */
        }
      }
    }
  }, [
    activityBeingEdited?.code,
    activityBeingEdited?.students,
    activityBeingEdited?.groupNumber,
    activityBeingEdited?.experienceFactor,
  ]);

  return (
    <div className="mb-5">
      <div className="flex bg-blue-200 rounded-md shadow-sm">
        <a
          className="grow px-2 text-start font-bold text-blue-600 hover:text-blue-800"
          onClick={toggleTables}
        >
          {name}
        </a>
      </div>
      {showTables && (
        <div className="flex w-full flex-col-reverse items-center justify-center pb-1 xl:flex-row xl:items-start">
          <div className="workloadContent w-full overflow-hidden rounded-md shadow-md xl:w-3/4 xl:overflow-visible">
            <table className="w-full table-fixed bg-slate-50">
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
                      !ProjectCourses.includes(activity.getCode()!),
                  )
                  .map((activity) => (
                    <tr
                      className={`border-b border-gray-300 ${
                        activity.getWorkloadType() === "extended"
                          ? "bg-orange-200"
                          : activity.getWorkloadType() === "double"
                            ? "bg-blue-200"

                              : activity.getWorkloadType() === "adHonorem"
                                ? "bg-gray-200"
                                : ""
                      } ${
                        activity.getId() === idCurrentlyEditing &&
                        activityBeingEdited !== null
                          ? "editingWorkloadRow"
                          : ""
                      }`}
                      key={activity.getId()}
                    >
                      <td className="px-2">
                        {activity.getId() === idCurrentlyEditing &&
                        activityBeingEdited !== null ? (
                          <div>
                            <select
                              value={activityBeingEdited.code!}
                              className="w-full"
                              onChange={(e) => updateCourse(e.target.value)}
                            >
                              {courses.map((course) => (
                                <option
                                  key={course.getId()}
                                  value={course.getCode()!}
                                >
                                  {course.getCode()}: {course.getName()}
                                </option>
                              ))}
                            </select>
                            <div className="flex items-center gap-1">
                              {activityBeingEdited.experienceFactor ? (
                                <select
                                  value={activityBeingEdited.experienceFactor}
                                  onChange={(e) =>
                                    setActivityBeingEdited({
                                      ...activityBeingEdited,
                                      experienceFactor: e.target.value,
                                    })
                                  }
                                >
                                  {experienceFactors.map((factor) => (
                                    <option
                                      key={factor.value}
                                      value={factor.value}
                                    >
                                      {factor.label}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <></>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <label
                                htmlFor="newGroupNumber"
                                className="text-xs font-bold"
                              >
                                Grupo:
                              </label>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                name="newGroupNumber"
                                value={activityBeingEdited.groupNumber!}
                                className="w-10"
                                onChange={(e) => {
                                  setActivityBeingEdited({
                                    ...activityBeingEdited,
                                    groupNumber: isNaN(parseInt(e.target.value))
                                      ? 0
                                      : parseInt(e.target.value),
                                  });
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm font-bold">
                              {activity.getCode()}:{" "}
                            </span>
                            {activity.getName()}{" "}
                            {activity.getGroupNumber() !== null && (
                              <span className="text-xs">
                                (grupo {activity.getGroupNumber()})
                              </span>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-2">
                        {activity.getId() === idCurrentlyEditing &&
                        activityBeingEdited !== null ? (
                          <div>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={activityBeingEdited.hours!}
                              onChange={(e) =>
                                setActivityBeingEdited({
                                  ...activityBeingEdited,
                                  hours: isNaN(parseInt(e.target.value))
                                    ? 0
                                    : parseInt(e.target.value),
                                })
                              }
                              disabled
                            />
                          </div>
                        ) : (
                          activity.getHours()
                        )}
                      </td>
                      <td className="px-2">
                        {activity.getId() === idCurrentlyEditing &&
                        activityBeingEdited !== null ? (
                          <div>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={activityBeingEdited.students!}
                              onChange={(e) =>
                                setActivityBeingEdited({
                                  ...activityBeingEdited,
                                  students: isNaN(parseInt(e.target.value))
                                    ? 0
                                    : parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                        ) : (
                          activity.getStudents()
                        )}
                      </td>
                      <td className="relative space-x-3 pe-16 ps-2">
                        {activity.getId() === idCurrentlyEditing &&
                        activityBeingEdited !== null ? (
                          <div>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={activityBeingEdited.workload!}
                              onChange={(e) =>
                                setActivityBeingEdited({
                                  ...activityBeingEdited,
                                  workload: isNaN(parseFloat(e.target.value))
                                    ? 0
                                    : parseFloat(e.target.value),
                                })
                              }
                            />
                            <select
                              value={activityBeingEdited.workloadType!}
                              onChange={(e) =>
                                setActivityBeingEdited({
                                  ...activityBeingEdited,
                                  workloadType: e.target.value as WorkloadValue,
                                })
                              }
                            >
                              {WorkloadTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          activity.getWorkload().toLocaleString(["es-CR", "es"])
                        )}
                        <div className="options absolute right-5 top-1/2 flex -translate-y-1/2 transform items-center gap-2 text-sm font-semibold">
                          {activity.getId() === idCurrentlyEditing &&
                          activityBeingEdited !== null ? (
                            <>
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="cursor-pointer text-teal-600"
                                title="Guardar"
                                onClick={() => saveChanges()}
                              />
                              <FontAwesomeIcon
                                icon={faArrowRotateLeft}
                                className="cursor-pointer text-blue-600"
                                title="Cancelar"
                                onClick={() => {
                                  setIdCurrentlyEditing(null);
                                }}
                              />
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon
                                icon={faPen}
                                className="cursor-pointer text-blue-600"
                                title="Editar"
                                onClick={() => editActivity(activity.getId()!)}
                              />
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="cursor-pointer text-red-600"
                                title="Eliminar"
                                onClick={() =>
                                  deleteActivity(activity.getId()!)
                                }
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                <tr>
                  <td colSpan={4} className="p-0">
                    <div
                      className="flex w-full cursor-pointer items-center justify-center hover:bg-gray-100"
                      onClick={() =>
                        navigate("/addCourseActivity", {
                          state: {
                            id: id,
                            name: name,
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
            <table className="w-full table-fixed rounded-md bg-slate-50 [&>tbody>tr:last-child>td:last-child]:pe-0 [&>tbody>tr>td:last-child]:pe-16 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-1 [&>thead>tr>th]:px-2 [&>thead>tr>th]:py-1">
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
                      ProjectCourses.includes(activity.getCode()!),
                  )
                  .map((activity) => (
                    <tr
                      className={`border-b border-gray-300 ${
                        activity.getWorkloadType() === "extended"
                          ? "bg-orange-200"
                          : activity.getWorkloadType() === "double"
                            ? "bg-blue-200"
                              : activity.getWorkloadType() === "adHonorem"
                                ? "bg-gray-200"
                                : ""
                      } ${
                        activity.getId() === idCurrentlyEditing &&
                        activityBeingEdited !== null
                          ? "editingWorkloadRow"
                          : ""
                      }`}
                      key={activity.getId()}
                    >
                      <td className="px-2">
                        {activity.getId() === idCurrentlyEditing &&
                        activityBeingEdited !== null ? (
                          <div>
                            <select
                              value={activityBeingEdited.code!}
                              className="w-full"
                              onChange={(e) => updateCourse(e.target.value)}
                            >
                              {projectCourses.map((course) => (
                                <option
                                  key={course.getId()}
                                  value={course.getCode()!}
                                >
                                  {course.getCode()}: {course.getName()}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm font-bold">
                              {activity.getCode()}:{" "}
                            </span>
                            {activity.getName()}
                          </>
                        )}
                      </td>
                      <td className="px-2">
                        {activity.getId() === idCurrentlyEditing &&
                        activityBeingEdited !== null ? (
                          <div>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={activityBeingEdited.hours!}
                              onChange={(e) =>
                                setActivityBeingEdited({
                                  ...activityBeingEdited,
                                  hours: isNaN(parseInt(e.target.value))
                                    ? 0
                                    : parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                        ) : (
                          activity.getHours()
                        )}
                      </td>
                      <td className="px-2">
                        {activity.getId() === idCurrentlyEditing &&
                        activityBeingEdited !== null ? (
                          <div>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={activityBeingEdited.students!}
                              onChange={(e) =>
                                setActivityBeingEdited({
                                  ...activityBeingEdited,
                                  students: isNaN(parseInt(e.target.value))
                                    ? 0
                                    : parseInt(e.target.value),
                                })
                              }
                              disabled
                            />
                            {activity.getSuggestedStudents() !== null && (
                              <span
                                className="my-auto cursor-help whitespace-nowrap underline decoration-dashed underline-offset-4"
                                title="Cantidad de estudiantes que se deben asignar de acuerdo con el archivo de Excel"
                              >
                                (de {activity.getSuggestedStudents()})
                              </span>
                            )}
                          </div>
                        ) : (
                          <>
                            {activity.getStudents()}{" "}
                            {activity.getSuggestedStudents() !== null && (
                              <span
                                className="float-end my-auto cursor-help underline decoration-dashed underline-offset-4"
                                title="Cantidad de estudiantes que se deben asignar de acuerdo con el archivo de Excel"
                              >
                                (de {activity.getSuggestedStudents()})
                              </span>
                            )}
                          </>
                        )}
                      </td>
                      <td className="relative space-x-3 px-2">
                        {activity.getId() === idCurrentlyEditing &&
                        activityBeingEdited !== null ? (
                          <div>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={activityBeingEdited.workload!}
                              onChange={(e) =>
                                setActivityBeingEdited({
                                  ...activityBeingEdited,
                                  workload: isNaN(parseFloat(e.target.value))
                                    ? 0
                                    : parseFloat(e.target.value),
                                })
                              }
                            />
                            <select
                              value={activityBeingEdited.workloadType!}
                              onChange={(e) =>
                                setActivityBeingEdited({
                                  ...activityBeingEdited,
                                  workloadType: e.target.value as WorkloadValue,
                                })
                              }
                            >
                              {WorkloadTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          activity.getWorkload().toLocaleString(["es-CR", "es"])
                        )}
                        <div className="options absolute right-5 top-1/2 flex -translate-y-1/2 transform items-center gap-2 text-sm font-semibold">
                          {activity.getId() === idCurrentlyEditing &&
                          activityBeingEdited !== null ? (
                            <>
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="cursor-pointer text-teal-600"
                                title="Guardar"
                                onClick={() => saveChanges()}
                              />
                              <FontAwesomeIcon
                                icon={faArrowRotateLeft}
                                className="cursor-pointer text-blue-600"
                                title="Cancelar"
                                onClick={() => {
                                  setIdCurrentlyEditing(null);
                                }}
                              />
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon
                                icon={faPen}
                                className="cursor-pointer text-blue-600"
                                title="Editar"
                                onClick={() => editActivity(activity.getId()!)}
                              />
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="cursor-pointer text-red-600"
                                title="Eliminar"
                                onClick={() =>
                                  deleteActivity(activity.getId()!)
                                }
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                <tr>
                  <td colSpan={4} className="p-0">
                    <div
                      className="flex w-full cursor-pointer items-center justify-center hover:bg-gray-100"
                      onClick={() =>
                        navigate("/addTFGActivity", {
                          state: {
                            id: id,
                            name: name,
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
            <table className="w-full table-auto rounded-md bg-slate-50 [&>tbody>tr:last-child>td:last-child]:pe-0 [&>tbody>tr>td:last-child]:pe-16 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-1 [&>thead>tr>th]:px-2 [&>thead>tr>th]:py-1">
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
                      className={`border-b border-gray-300 ${
                        activity.getWorkloadType() === "extended"
                          ? "bg-orange-200"
                          : activity.getWorkloadType() === "double"
                            ? "bg-blue-200"
                              : activity.getWorkloadType() === "adHonorem"
                                ? "bg-gray-200"
                                : ""
                      } ${
                        activity.getId() === idCurrentlyEditing &&
                        activityBeingEdited !== null
                          ? "editingWorkloadRow"
                          : ""
                      }`}
                      key={activity.getId()}
                    >
                      <td className="px-2">
                        {activity.getId() === idCurrentlyEditing &&
                        activityBeingEdited !== null ? (
                          <div>
                            <input
                              type="text"
                              value={activityBeingEdited.name!}
                              onChange={(e) =>
                                setActivityBeingEdited({
                                  ...activityBeingEdited,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                        ) : (
                          activity.getName()
                        )}
                      </td>
                      <td className="relative space-x-3 px-2">
                        {activity.getId() === idCurrentlyEditing &&
                        activityBeingEdited !== null ? (
                          <div>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={activityBeingEdited.workload!}
                              onChange={(e) =>
                                setActivityBeingEdited({
                                  ...activityBeingEdited,
                                  workload: isNaN(parseFloat(e.target.value))
                                    ? 0
                                    : parseFloat(e.target.value),
                                })
                              }
                            />
                            <select
                              value={activityBeingEdited.workloadType!}
                              onChange={(e) =>
                                setActivityBeingEdited({
                                  ...activityBeingEdited,
                                  workloadType: e.target.value as WorkloadValue,
                                })
                              }
                            >
                              {WorkloadTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          activity.getWorkload().toLocaleString(["es-CR", "es"])
                        )}
                        <div className="options absolute right-5 top-1/2 flex -translate-y-1/2 transform items-center gap-2 text-sm font-semibold">
                          {activity.getId() === idCurrentlyEditing &&
                          activityBeingEdited !== null ? (
                            <>
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="cursor-pointer text-teal-600"
                                title="Guardar"
                                onClick={() => saveChanges()}
                              />
                              <FontAwesomeIcon
                                icon={faArrowRotateLeft}
                                className="cursor-pointer text-blue-600"
                                title="Cancelar"
                                onClick={() => {
                                  setIdCurrentlyEditing(null);
                                }}
                              />
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon
                                icon={faPen}
                                className="cursor-pointer text-blue-600"
                                title="Editar"
                                onClick={() => editActivity(activity.getId()!)}
                              />
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="cursor-pointer text-red-600"
                                title="Eliminar"
                                onClick={() =>
                                  deleteActivity(activity.getId()!)
                                }
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                <tr>
                  <td colSpan={4} className="p-0">
                    <div
                      className="flex w-full cursor-pointer items-center justify-center hover:bg-gray-100"
                      onClick={() =>
                        navigate("/addOtherActivity", {
                          state: {
                            id: id,
                            name: name,
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
            <table className="w-full table-auto rounded-md bg-slate-50 [&>tbody>tr:last-child>td:last-child]:pe-0 [&>tbody>tr>td:last-child]:pe-16 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-1 [&>thead>tr>th]:px-2 [&>thead>tr>th]:py-1">
              <thead>
                <tr className="bg-cyan-600 text-white">
                  <th className="w-3/8">
                    <p className="flex items-center justify-start gap-3">
                      Labores especiales
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
                      className={`border-b border-gray-300 ${
                        activity.getWorkloadType() === "extended"
                          ? "bg-orange-200"
                          : activity.getWorkloadType() === "double"
                            ? "bg-blue-200"
                              : activity.getWorkloadType() === "adHonorem"
                                ? "bg-gray-200"
                                : ""
                      } ${
                        activity.getId() === idCurrentlyEditing &&
                        activityBeingEdited !== null
                          ? "editingWorkloadRow"
                          : ""
                      }`}
                      key={activity.getId()}
                    >
                      <td className="px-2">
                        {activity.getId() === idCurrentlyEditing &&
                        activityBeingEdited !== null ? (
                          <div>
                            <input
                              type="text"
                              value={activityBeingEdited.name!}
                              onChange={(e) =>
                                setActivityBeingEdited({
                                  ...activityBeingEdited,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                        ) : (
                          activity.getName()
                        )}
                      </td>
                      <td className="relative space-x-3 px-2">
                        {activity.getId() === idCurrentlyEditing &&
                        activityBeingEdited !== null ? (
                          <div>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={activityBeingEdited.workload!}
                              onChange={(e) =>
                                setActivityBeingEdited({
                                  ...activityBeingEdited,
                                  workload: isNaN(parseFloat(e.target.value))
                                    ? 0
                                    : parseFloat(e.target.value),
                                })
                              }
                            />
                            <select
                              value={activityBeingEdited.workloadType!}
                              onChange={(e) =>
                                setActivityBeingEdited({
                                  ...activityBeingEdited,
                                  workloadType: e.target.value as WorkloadValue,
                                })
                              }
                            >
                              {WorkloadTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          activity.getWorkload().toLocaleString(["es-CR", "es"])
                        )}
                        <div className="options absolute right-5 top-1/2 flex -translate-y-1/2 transform items-center gap-2 text-sm font-semibold">
                          {activity.getId() === idCurrentlyEditing &&
                          activityBeingEdited !== null ? (
                            <>
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="cursor-pointer text-teal-600"
                                title="Guardar"
                                onClick={() => saveChanges()}
                              />
                              <FontAwesomeIcon
                                icon={faArrowRotateLeft}
                                className="cursor-pointer text-blue-600"
                                title="Cancelar"
                                onClick={() => {
                                  setIdCurrentlyEditing(null);
                                }}
                              />
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon
                                icon={faPen}
                                className="cursor-pointer text-blue-600"
                                title="Editar"
                                onClick={() => editActivity(activity.getId()!)}
                              />
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="cursor-pointer text-red-600"
                                title="Eliminar"
                                onClick={() =>
                                  deleteActivity(activity.getId()!)
                                }
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                <tr>
                  <td colSpan={4} className="p-0">
                    <div
                      className="flex h-auto w-full cursor-pointer items-center justify-center hover:bg-gray-100"
                      onClick={() =>
                        navigate("/addOtherActivity", {
                          state: {
                            id: id,
                            name: name,
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
            <table className="w-full table-auto rounded-md bg-slate-50 [&>tbody>tr:last-child>td:last-child]:pe-0 [&>tbody>tr>td:last-child]:pe-16 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-1 [&>thead>tr>th]:px-2 [&>thead>tr>th]:py-1">
              <thead>
                <tr className="bg-purple-600 text-white">
                  <th className="w-3/8">
                    <p className="flex items-center justify-start gap-3">
                      Labores académicas-administrativas
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
                      className={`border-b border-gray-300 ${
                        activity.getWorkloadType() === "extended"
                          ? "bg-orange-200"
                          : activity.getWorkloadType() === "double"
                            ? "bg-blue-200"
                              : activity.getWorkloadType() === "adHonorem"
                                ? "bg-gray-200"
                                : ""
                      } ${
                        activity.getId() === idCurrentlyEditing &&
                        activityBeingEdited !== null
                          ? "editingWorkloadRow"
                          : ""
                      }`}
                      key={activity.getId()}
                    >
                      <td className="px-2">
                        {activity.getId() === idCurrentlyEditing &&
                        activityBeingEdited !== null ? (
                          <div>
                            <input
                              type="text"
                              value={activityBeingEdited.name!}
                              onChange={(e) =>
                                setActivityBeingEdited({
                                  ...activityBeingEdited,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                        ) : (
                          activity.getName()
                        )}
                      </td>
                      <td className="relative space-x-3 px-2">
                        {activity.getId() === idCurrentlyEditing &&
                        activityBeingEdited !== null ? (
                          <div>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={activityBeingEdited.workload!}
                              onChange={(e) =>
                                setActivityBeingEdited({
                                  ...activityBeingEdited,
                                  workload: isNaN(parseFloat(e.target.value))
                                    ? 0
                                    : parseFloat(e.target.value),
                                })
                              }
                            />
                            <select
                              value={activityBeingEdited.workloadType!}
                              onChange={(e) =>
                                setActivityBeingEdited({
                                  ...activityBeingEdited,
                                  workloadType: e.target.value as WorkloadValue,
                                })
                              }
                            >
                              {WorkloadTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          activity.getWorkload().toLocaleString(["es-CR", "es"])
                        )}
                        <div className="options absolute right-5 top-1/2 flex -translate-y-1/2 transform items-center gap-2 text-sm font-semibold">
                          {activity.getId() === idCurrentlyEditing &&
                          activityBeingEdited !== null ? (
                            <>
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="cursor-pointer text-teal-600"
                                title="Guardar"
                                onClick={() => saveChanges()}
                              />
                              <FontAwesomeIcon
                                icon={faArrowRotateLeft}
                                className="cursor-pointer text-blue-600"
                                title="Cancelar"
                                onClick={() => {
                                  setIdCurrentlyEditing(null);
                                }}
                              />
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon
                                icon={faPen}
                                className="cursor-pointer text-blue-600"
                                title="Editar"
                                onClick={() => editActivity(activity.getId()!)}
                              />
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="cursor-pointer text-red-600"
                                title="Eliminar"
                                onClick={() =>
                                  deleteActivity(activity.getId()!)
                                }
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                <tr>
                  <td colSpan={4} className="p-0">
                    <div
                      className="flex w-full cursor-pointer items-center justify-center hover:bg-gray-100"
                      onClick={() =>
                        navigate("/addOtherActivity", {
                          state: {
                            id: id,
                            name: name,
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
          <div className="flex w-full max-w-md flex-col items-center justify-center p-10 xl:w-1/4">
            <h2 className="mb-3 text-xl font-bold">Resumen</h2>
            <div className="w-full overflow-hidden rounded-md shadow-md">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-600 font-bold text-white">
                    <th>Tipo</th>
                    <th>Horas</th>
                  </tr>
                </thead>
                <tbody>
                  {WorkloadTypes.map((workloadType, index) => {
                    const totalWorkload = workload
                      .filter((w) => w.getWorkloadType() === workloadType.value)
                      .reduce((acc, w) => acc + w.getWorkload(), 0);
                    return (
                      <tr key={index} className={workloadType.color}>
                        <td className="px-3 font-semibold">
                          {workloadType.label}
                        </td>
                        <td
                          className={`px-3 text-center ${workloadType.value === "normal" ? (totalWorkload < 36 ? "bg-yellow-200" : totalWorkload < 43 ? "bg-green-400" : totalWorkload < 44 ? "bg-amber-500" : "bg-red-400") : ""}`}
                        >
                          {totalWorkload.toLocaleString(["es-CR", "es"])}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-600 font-semibold text-white [&>td]:px-3 [&>td]:text-center">
                    <td>Carga total</td>
                    <td>
                      {workload
                        .reduce((acc, w) => acc + w.getWorkload(), 0)
                        .toLocaleString(["es-CR", "es"])}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <DialogConfirm
        title={confirmationTitle}
        message={confirmationMessage}
        handleConfirm={handleConfirm}
        handleCancel={() => {
          setShowDialogConfirm(false);
        }}
        show={showDialogConfirm}
      />
    </div>
  );
}
