import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  convertApiDateToHtmlAttribute,
} from "../../../utils/DateFormatters";
import { Classroom } from "../../../../../interfaces/PresentationGeneration";
import { PresentationInterface } from "../../../../../models/Presentation";
import DialogAlert from "../../../components/DialogAlert";
import DialogConfirm from "../../../components/DialogConfirm";
import PresentationClassroom from "../../../components/PresentationClassroom";

const calculateNumberOfPresentations = (
  classrooms: Classroom[],
  presentationInterval: number,
  lunchBreak: {
    startTime: string;
    endTime: string;
  },
): number => {
  let totalPresentations = 0;

  classrooms.forEach((classroom) => {
    classroom.schedule.forEach((schedule) => {
      const startTime = new Date(schedule.startTime);
      const endTime = new Date(schedule.endTime);

      // Create instances of the start and end of the lunch break
      const lunchBreakStart = new Date(
        convertApiDateToHtmlAttribute(schedule.startTime).split("T")[0] +
          "T" +
          lunchBreak.startTime,
      );
      const lunchBreakEnd = new Date(
        convertApiDateToHtmlAttribute(schedule.startTime).split("T")[0] +
          "T" +
          lunchBreak.endTime,
      );

      // Calculate presentations before and after lunch break
      const presentationsBeforeLunch = Math.max(
        Math.floor(
          (Math.min(lunchBreakStart.getTime(), endTime.getTime()) -
            startTime.getTime()) /
            (presentationInterval * 60000),
        ),
        0,
      );
      const presentationsAfterLunch = Math.max(
        Math.floor(
          (endTime.getTime() -
            Math.max(lunchBreakEnd.getTime(), startTime.getTime())) /
            (presentationInterval * 60000),
        ),
        0,
      );

      totalPresentations += presentationsBeforeLunch + presentationsAfterLunch;
    });
  });

  return totalPresentations;
};

export default function ManagePresentations(): React.ReactElement {
  const [showGenerationParameters, setShowGenerationParameters] =
    useState<boolean>(false);
  const [presentationInterval, setPresentationInterval] = useState<number>(90);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [lunchBreak, setLunchBreak] = useState<{
    startTime: string;
    endTime: string;
  }>({ startTime: "12:30", endTime: "13:30" });
  const [presentations, setPresentations] = useState<PresentationInterface[]>(
    [],
  );
  const [groupedPresentations, setGroupedPresentations] = useState<
    { classroom: string; presentations: PresentationInterface[] }[]
  >([]);
  const numberOfStudents = window.mainController
    .getStudentsProfessors()
    .filter((sp) => sp.professors.length > 0).length;
  const [alertDialogParams, setAlertDialogParams] = useState<{
    title: string;
    message: string;
    type: "success" | "error";
  }>({
    title: "",
    message: "",
    type: "success",
  });
  const [showAlertDialog, setShowAlertDialog] = useState<boolean>(false);
  const [confirmationDialogParams, setConfirmationDialogParams] = useState<{
    title: string;
    message: string;
    handleConfirm: () => void;
  }>({
    title: "",
    message: "",
    handleConfirm: () => {},
  });
  const [showConfirmationDialog, setShowDialogConfirm] =
    useState<boolean>(false);

  const toggleGenerationParameters = (): void => {
    setShowGenerationParameters(!showGenerationParameters);
  };

  const nextDayHours = (): { startTime: string; endTime: string } => {
    const startDate = new Date();
    startDate.setHours(24 + 8);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 4);
    endDate.setMinutes(endDate.getMinutes() + 30);

    return {
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
    };
  };

  const addClassroom = (): void => {
    const { startTime, endTime } = nextDayHours();

    setClassrooms([
      ...classrooms,
      {
        name: `Aula #${classrooms.length + 1}`,
        schedule: [
          {
            startTime,
            endTime,
          },
        ],
      },
    ]);
  };

  const updateClassroomName = (index: number, name: string): void => {
    const newClassrooms = [...classrooms];
    newClassrooms[index].name = name;
    setClassrooms(newClassrooms);
  };

  const addClassroomSchedule = (index: number): void => {
    // Duplicate the last schedule entry
    const newClassrooms = [...classrooms];

    if (newClassrooms[index].schedule.length === 0) {
      const { startTime, endTime } = nextDayHours();
      newClassrooms[index].schedule.push({
        startTime,
        endTime,
      });
      setClassrooms(newClassrooms);
      return;
    }

    const lastSchedule =
      newClassrooms[index].schedule[newClassrooms[index].schedule.length - 1];
    newClassrooms[index].schedule.push({
      startTime: lastSchedule.startTime,
      endTime: lastSchedule.endTime,
    });
    setClassrooms(newClassrooms);
  };

  const updateSchedule = (
    index: number,
    scheduleIndex: number,
    inputType: "date" | "startTime" | "endTime",
    value: string,
  ): void => {
    const newClassrooms = [...classrooms];
    const affectedSchedule = newClassrooms[index].schedule[scheduleIndex];

    switch (inputType) {
      case "date":
        affectedSchedule.startTime = new Date(
          value +
            "T" +
            convertApiDateToHtmlAttribute(affectedSchedule.startTime).split(
              "T",
            )[1],
        ).toISOString();
        affectedSchedule.endTime = new Date(
          value +
            "T" +
            convertApiDateToHtmlAttribute(affectedSchedule.endTime).split(
              "T",
            )[1],
        ).toISOString();
        break;
      case "startTime":
        affectedSchedule.startTime = new Date(
          convertApiDateToHtmlAttribute(affectedSchedule.startTime).split(
            "T",
          )[0] +
            "T" +
            value,
        ).toISOString();
        break;
      case "endTime":
        affectedSchedule.endTime = new Date(
          convertApiDateToHtmlAttribute(affectedSchedule.startTime).split(
            "T",
          )[0] +
            "T" +
            value,
        ).toISOString();
        break;
      default:
        break;
    }

    setClassrooms(newClassrooms);
  };

  const removeSchedule = (index: number, scheduleIndex: number): void => {
    const newClassrooms = [...classrooms];
    newClassrooms[index].schedule.splice(scheduleIndex, 1);
    setClassrooms(newClassrooms);
  };

  const removeClassroom = (index: number): void => {
    const newClassrooms = [...classrooms];
    newClassrooms.splice(index, 1);
    setClassrooms(newClassrooms);
  };

  const handleSubmit = (): void => {
    // Warn if there are already presentations
    if (presentations.length > 0) {
      setConfirmationDialogParams({
        title: "Advertencia",
        message: "Ya se han generado presentaciones. ¿Desea sobreescribirlas?",
        handleConfirm: () => {
          generatePresentations();
          setShowDialogConfirm(false);
        },
      });
      setShowDialogConfirm(true);
      return;
    }
    generatePresentations();
  };

  const generatePresentations = (): void => {
    // Convert the lunch break to UTC timestamps
    const lunchBreakStart = new Date(`2000-01-01T${lunchBreak.startTime}:00`)
      .toISOString()
      .split("T")[1];
    const lunchBreakEnd = new Date(`2000-01-01T${lunchBreak.endTime}:00`)
      .toISOString()
      .split("T")[1];

    try {
      const { resolved, unresolved } =
        window.mainController.generatePresentations(
          classrooms,
          presentationInterval,
          {
            startTime: lunchBreakStart,
            endTime: lunchBreakEnd,
          },
        );
      setPresentations(resolved);

      const numberOfPresentations = calculateNumberOfPresentations(
        classrooms,
        presentationInterval,
        lunchBreak,
      );

      setAlertDialogParams({
        title: "Éxito",
        message:
          `Se generaron ${resolved.length} presentaciones de ${numberOfPresentations} posibles.` +
          (unresolved.length > 0
            ? ` No se pudieron generar ${unresolved.length} presentaciones.`
            : ""),
        type: "success",
      });
    } catch (error) {
      setAlertDialogParams({
        title: "Error",
        message: "Error al generar las presentaciones.",
        type: "error",
      });
      return;
    } finally {
      setShowAlertDialog(true);
    }
  };

  const reloadPresentations = (): void => {
    setPresentations(window.mainController.getPresentations());
  };

  useEffect(() => {
    reloadPresentations();
  }, []);

  useEffect(() => {
    const groupedPresentations: {
      classroom: string;
      presentations: PresentationInterface[];
    }[] = [];

    const classrooms: string[] = [];

    presentations.forEach((presentation) => {
      if (!classrooms.includes(presentation.classroom)) {
        classrooms.push(presentation.classroom);
      }
    });

    classrooms.forEach((classroom) => {
      const classroomPresentations = presentations.filter(
        (presentation) => presentation.classroom === classroom,
      );
      groupedPresentations.push({
        classroom,
        presentations: classroomPresentations,
      });
    });
    setGroupedPresentations(groupedPresentations);
  }, [presentations]);

  return (
    <main className="gap-10">
      <h1 className="text-3xl font-bold">Administrar presentaciones</h1>
      <div className="flex w-full max-w-7xl flex-col items-center justify-between gap-3 md:flex-row">
        <button
          className="h-8 rounded-md bg-blue-500 px-4 font-semibold text-white shadow-md transition-colors hover:bg-blue-600"
          type="button"
          onClick={() => toggleGenerationParameters()}
        >
          {showGenerationParameters
            ? "Cerrar generación"
            : "Generar aleatoriamente"}
        </button>
      </div>
      {showGenerationParameters && (
        <div className="flex w-full max-w-7xl flex-col items-center rounded-md bg-gray-100 p-10 shadow-md">
          <h2 className="mb-2 text-2xl font-bold">Parámetros de generación</h2>
          <div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
            <div className="flex items-center gap-4">
              <label htmlFor="presentationInterval" className="text-lg">
                Duración de cada presentación (minutos):
              </label>
              <input
                type="number"
                id="presentationInterval"
                className="h-8 w-16 rounded-md border border-gray-300 focus:outline-none focus:ring-0"
                value={presentationInterval}
                onChange={(e) => {
                  setPresentationInterval(Number(e.target.value));
                }}
              />
            </div>
            <div className="flex flex-col items-center gap-3 md:flex-row">
              <p
                className="me-1 cursor-help text-xl font-bold underline decoration-dashed underline-offset-4"
                title="No se generarán asignaciones durante la hora de almuerzo."
              >
                Almuerzo:
              </p>
              <div className="flex items-center gap-1">
                <label htmlFor="lunchBreakStart" className="text-lg">
                  Desde
                </label>
                <input
                  type="time"
                  id="lunchBreakStart"
                  className="h-8 rounded-md border border-gray-300 focus:outline-none focus:ring-0"
                  value={lunchBreak.startTime}
                  onChange={(e) => {
                    setLunchBreak({ ...lunchBreak, startTime: e.target.value });
                  }}
                />
              </div>
              <div className="flex items-center gap-1">
                <label htmlFor="lunchBreakEnd" className="text-lg">
                  Hasta
                </label>
                <input
                  type="time"
                  id="lunchBreakEnd"
                  className="h-8 rounded-md border border-gray-300 focus:outline-none focus:ring-0"
                  value={lunchBreak.endTime}
                  onChange={(e) => {
                    setLunchBreak({ ...lunchBreak, endTime: e.target.value });
                  }}
                />
              </div>
            </div>
          </div>
          <h2 className="mb-2 mt-12 text-2xl font-bold">
            Disponibilidad de aulas
          </h2>
          <p className="max-w-xl text-center">
            Se necesita la información de las aulas disponibles para generar las
            horas de las presentaciones sin choques de horario.
          </p>
          <div className="mt-5 grid w-full grid-cols-1 gap-4 xl:grid-cols-2">
            {classrooms.map((classroom, index) => (
              <article
                className="flex w-full flex-col items-center justify-between overflow-hidden rounded-lg bg-white shadow-md"
                key={index}
              >
                <div className="flex w-full flex-col items-center">
                  <div className="mb-1 flex w-full items-center bg-neutral-400">
                    <input
                      className="w-full grow border-0 bg-inherit py-1 text-center text-lg font-bold outline-0 ring-0"
                      value={classroom.name}
                      type="text"
                      onChange={(e) =>
                        updateClassroomName(index, e.target.value)
                      }
                    />
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="mx-2 cursor-pointer text-red-600"
                      title="Eliminar"
                      onClick={() => removeClassroom(index)}
                    />
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Inicio</th>
                        <th>Fin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classroom.schedule.map((schedule, scheduleIndex) => (
                        <tr key={scheduleIndex}>
                          <td>
                            <input
                              type="date"
                              value={
                                convertApiDateToHtmlAttribute(
                                  schedule.startTime,
                                ).split("T")[0]
                              }
                              className="w-full border-0 bg-neutral-200 py-1 text-center font-bold outline-0 ring-0"
                              onChange={(e) =>
                                updateSchedule(
                                  index,
                                  scheduleIndex,
                                  "date",
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="time"
                              value={
                                convertApiDateToHtmlAttribute(
                                  schedule.startTime,
                                ).split("T")[1]
                              }
                              className="w-full border-0 bg-neutral-200 py-1 text-center outline-0 ring-0"
                              onChange={(e) =>
                                updateSchedule(
                                  index,
                                  scheduleIndex,
                                  "startTime",
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="time"
                              value={
                                convertApiDateToHtmlAttribute(
                                  schedule.endTime,
                                ).split("T")[1]
                              }
                              className="w-full border-0 bg-neutral-200 py-1 text-center outline-0 ring-0"
                              onChange={(e) =>
                                updateSchedule(
                                  index,
                                  scheduleIndex,
                                  "endTime",
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  className="my-2 max-w-full place-self-center rounded-lg bg-slate-500 px-3 py-1 text-sm text-white shadow-md transition-colors hover:bg-slate-400"
                  onClick={() => addClassroomSchedule(index)}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2 size-3" />
                  Agregar horario
                </button>
              </article>
            ))}
            <button
              className={`max-w-full place-self-start justify-self-center rounded-lg bg-blue-500 px-4 py-1 text-white shadow-md transition-colors hover:bg-blue-400 ${classrooms.length % 2 === 0 ? "xl:col-span-2" : "col-span-1"}`}
              onClick={addClassroom}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2 size-4" />
              Agregar aula
            </button>
          </div>
          <p className="mt-10 text-center">
            Hay <span className="font-bold">{numberOfStudents}</span>{" "}
            estudiantes con profesor asignado para su defensa.
            {numberOfStudents === 0 && (
              <>
                <br />
                <span className="animate-pulse font-bold text-red-500">
                  ¡No se asignarán las presentaciones sin asignar a los
                  profesores!
                </span>
              </>
            )}
            <br />
            Esta distribución de aulas permite{" "}
            <span className="font-bold">
              {calculateNumberOfPresentations(
                classrooms,
                presentationInterval,
                lunchBreak,
              )}
            </span>{" "}
            defensas.
          </p>
          <button
            className="mt-2 max-w-full rounded-lg bg-green-600 px-4 py-1 text-xl font-bold text-white shadow-md transition-colors hover:bg-green-500"
            onClick={handleSubmit}
          >
            <FontAwesomeIcon icon={faCheck} className="me-2 size-5" />
            Generar
          </button>
        </div>
      )}
      <div className="flex flex-col items-center">
        <h2 className="mb-2 mt-10 text-3xl font-bold">
          Lista de presentaciones
        </h2>
        <p className="text-center">
          Puede ver las presentaciones haciendo clic en cada fecha.
        </p>
        <p className="text-center">
          Además, puede arrastrar una presentación a otra para intercambiar sus
          horarios.
        </p>
      </div>
      {presentations.length > 0 ? (
        groupedPresentations.map((classroom) => (
          <PresentationClassroom
            key={classroom.classroom}
            onDelete={deletePresentation}
            {...classroom}
          />
        ))
      ) : (
        <p>Aún no hay presentaciones generadas.</p>
      )}
      <DialogAlert
        title={alertDialogParams.title}
        message={alertDialogParams.message}
        show={showAlertDialog}
        handleConfirm={() => {
          setShowAlertDialog(false);
        }}
        type={alertDialogParams.type}
      />
      <DialogConfirm
        title={confirmationDialogParams.title}
        message={confirmationDialogParams.message}
        handleConfirm={confirmationDialogParams.handleConfirm}
        handleCancel={() => {
          setShowDialogConfirm(false);
        }}
        show={showConfirmationDialog}
      />
    </main>
  );
}
