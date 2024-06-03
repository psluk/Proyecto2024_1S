import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightArrowLeft,
  faCheck,
  faMagnifyingGlass,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { convertApiDateToHtmlAttribute } from "../../../utils/DateFormatters";
import { Classroom } from "../../../../../interfaces/PresentationGeneration";
import { PresentationInterface } from "../../../../../models/Presentation";
import DialogAlert from "../../../components/DialogAlert";
import DialogConfirm from "../../../components/DialogConfirm";
import PresentationClassroom from "../../../components/PresentationClassroom";
import { PresentationSwapContext } from "../../../context/PresentationSwapContext";
import { StudentProfessorInterface } from "../../../../../models/StudentProfessor";
import { useNavigate } from "react-router-dom";
import { doDatesOverlap } from "../../../utils/DateOverlap";

const calculateNumberOfPresentations = (
  classrooms: Classroom[],
  presentationInterval: number,
  lunchBreak: {
    startTime: string;
    endTime: string;
  },
  presentations: PresentationInterface[] = [],
  clearCurrentList: boolean = false,
): number => {
  // Array for the presentation slots
  const presentationSlots: {
    startTime: Date;
    endTime: Date;
    classrooms: string[];
  }[] = [];

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

      let presentationsBeforeLunch: number;
      let presentationsAfterLunch: number;

      // If the lunch starts and ends at the same time, it means there is no lunch break
      if (lunchBreakStart.getTime() === lunchBreakEnd.getTime()) {
        presentationsBeforeLunch = Math.floor(
          (endTime.getTime() - startTime.getTime()) /
            (presentationInterval * 60000),
        );
        presentationsAfterLunch = 0;
      } else {
        // Calculate presentations before and after lunch break
        presentationsBeforeLunch = Math.max(
          Math.floor(
            (Math.min(lunchBreakStart.getTime(), endTime.getTime()) -
              startTime.getTime()) /
              (presentationInterval * 60000),
          ),
          0,
        );
        presentationsAfterLunch = Math.max(
          Math.floor(
            (endTime.getTime() -
              Math.max(lunchBreakEnd.getTime(), startTime.getTime())) /
              (presentationInterval * 60000),
          ),
          0,
        );
      }

      // Generate presentations before lunch break
      for (let i = 0; i < presentationsBeforeLunch; i++) {
        const presentationStartTime = new Date(
          startTime.getTime() + i * presentationInterval * 60000,
        );
        const presentationEndTime = new Date(
          presentationStartTime.getTime() + presentationInterval * 60000,
        );

        const existingPresentation = presentationSlots.find(
          (p) =>
            p.startTime.getTime() === presentationStartTime.getTime() &&
            p.endTime.getTime() === presentationEndTime.getTime(),
        );

        if (existingPresentation) {
          if (
            !existingPresentation.classrooms.find(
              (c) =>
                c
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase() ===
                classroom.name
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase(),
            )
          ) {
            existingPresentation.classrooms.push(classroom.name);
          }
        } else {
          presentationSlots.push({
            startTime: presentationStartTime,
            endTime: presentationEndTime,
            classrooms: [classroom.name],
          });
        }
      }

      // Generate presentations after lunch break
      for (let i = 0; i < presentationsAfterLunch; i++) {
        const presentationStartTime = new Date(
          Math.max(lunchBreakEnd.getTime(), startTime.getTime()) +
            i * presentationInterval * 60000,
        );
        const presentationEndTime = new Date(
          presentationStartTime.getTime() + presentationInterval * 60000,
        );
        const existingPresentation = presentationSlots.find(
          (p) =>
            p.startTime.getTime() === presentationStartTime.getTime() &&
            p.endTime.getTime() === presentationEndTime.getTime(),
        );

        if (existingPresentation) {
          if (
            !existingPresentation.classrooms.find(
              (c) =>
                c
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase() ===
                classroom.name
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase(),
            )
          ) {
            existingPresentation.classrooms.push(classroom.name);
          }
        } else {
          presentationSlots.push({
            startTime: presentationStartTime,
            endTime: presentationEndTime,
            classrooms: [classroom.name],
          });
        }
      }
    });
  });

  // If the list is not to be cleared, remove overlapping slots
  if (!clearCurrentList) {
    presentations.forEach((presentation) => {
      const currentStartTime = new Date(presentation.startTime);
      const currentEndTime = new Date(currentStartTime);
      currentEndTime.setMinutes(
        currentEndTime.getMinutes() + presentation.minuteDuration,
      );
      const currentClassroom = presentation.classroom;

      presentationSlots.forEach((slot) => {
        const slotStartTime = slot.startTime;
        const slotEndTime = slot.endTime;
        const slotClassrooms = slot.classrooms;

        if (
          doDatesOverlap(
            currentStartTime,
            currentEndTime,
            slotStartTime,
            slotEndTime,
          ) &&
          slotClassrooms.includes(currentClassroom)
        ) {
          // Remove the classroom from the slot
          const classroomIndex = slotClassrooms.indexOf(currentClassroom);

          if (classroomIndex !== -1) {
            slotClassrooms.splice(classroomIndex, 1);
          }
        }
      });
    });
  }

  return presentationSlots.reduce(
    (acc, slot) => acc + slot.classrooms.length,
    0,
  );
};

export default function ManagePresentations(): React.ReactElement {
  const navigate = useNavigate();
  const [search, setSearch] = useState<string>("");
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
  const [unassignedStudents, setUnassignedStudents] = useState<
    StudentProfessorInterface[]
  >([]);
  const presentationSwapContext = useContext(PresentationSwapContext);

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
    // Check if there are duplicate names
    const classroomNames = classrooms.map((classroom) =>
      classroom.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase(),
    );
    const uniqueClassroomNames = new Set(classroomNames);

    if (uniqueClassroomNames.size !== classroomNames.length) {
      // Warn about duplicate names
      setConfirmationDialogParams({
        title: "Advertencia",
        message:
          "Hay aulas con nombres duplicados. Si continúa, se tomarán como si fueran la misma.",
        handleConfirm: () => {
          generatePresentations();
          setShowDialogConfirm(false);
        },
      });
      setShowDialogConfirm(true);
      return;
    }

    // Warn if all presentations have been generated
    if (unassignedStudents.length === 0) {
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
      const { resolved } = window.mainController.generatePresentations(
        classrooms,
        presentationInterval,
        {
          startTime: lunchBreakStart,
          endTime: lunchBreakEnd,
        },
      );
      reloadPresentations();

      const numberOfPresentations = Math.min(
        calculateNumberOfPresentations(
          classrooms,
          presentationInterval,
          lunchBreak,
          presentations,
          unassignedStudents.length === 0,
        ),
        unassignedStudents.length > 0
          ? unassignedStudents.length
          : presentations.length,
      );

      const generated =
        resolved.length -
        (unassignedStudents.length > 0 ? presentations.length : 0);

      setAlertDialogParams({
        title: numberOfPresentations > generated ? "Advertencia" : "Éxito",
        message:
          `Se generaron ${generated} citas${unassignedStudents.length > 0 ? " nuevas" : ""}${numberOfPresentations > generated ? ` de ${numberOfPresentations} posibles` : ""}.` +
          (numberOfPresentations > generated
            ? ` No se pudieron generar ${numberOfPresentations - generated} citas automáticamente, por choque de horarios. Intente agregar nuevos horarios.`
            : ""),
        type: numberOfPresentations > generated ? "error" : "success",
      });
      presentationSwapContext.cancelSwappingPresentation();
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
    const presentations = window.mainController.getPresentations();
    setPresentations(presentations);

    const assignedStudents = presentations.map(
      (presentation) => presentation.attendees.student.id,
    );

    const loadedStudents = window.mainController.getStudentsProfessors();
    setUnassignedStudents(
      loadedStudents.filter(
        (student) =>
          student.professors.length > 0 &&
          !assignedStudents.includes(student.student.id),
      ),
    );
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

  const deletePresentation = (id: number): void => {
    setConfirmationDialogParams({
      title: "Eliminar presentación",
      message: "¿Está seguro de que desea eliminar esta presentación?",
      handleConfirm: () => {
        window.mainController.deletePresentation(id);
        reloadPresentations();
        setShowDialogConfirm(false);
      },
    });
    setShowDialogConfirm(true);
  };

  const handleDeleteAll = (): void => {
    setConfirmationDialogParams({
      title: "Eliminar todas las presentaciones",
      message:
        "¿Está seguro de que desea eliminar todas las presentaciones? Esta acción no se puede deshacer.",
      handleConfirm: () => {
        window.mainController.deletePresentations();
        reloadPresentations();
        setShowDialogConfirm(false);
      },
    });
    setShowDialogConfirm(true);
  };

  return (
    <main className="gap-10">
      <h1 className="text-3xl font-bold">Administrar presentaciones</h1>
      <div className="flex w-full max-w-7xl flex-col items-center justify-between gap-3 md:flex-row">
        <div className="flex w-full max-w-sm items-center rounded-md border border-gray-300 bg-white">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="ml-4 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar presentación"
            className="h-8 flex-1 rounded-md border-none pl-4 pr-10 focus:outline-none focus:ring-0"
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            className="rounded-md bg-blue-500 px-4 py-1 font-semibold text-white shadow-md transition-colors hover:bg-blue-600"
            type="button"
            onClick={() => toggleGenerationParameters()}
          >
            {showGenerationParameters
              ? "Cerrar generación"
              : "Generar aleatoriamente"}
          </button>
          <button
            className="rounded-md bg-red-500 px-4 py-1 font-semibold text-white shadow-md transition-colors hover:bg-red-600 disabled:bg-gray-500 disabled:hover:bg-gray-500"
            type="button"
            onClick={handleDeleteAll}
            disabled={presentations.length === 0}
            title={presentations.length === 0 ? "No hay presentaciones" : ""}
          >
            Eliminar todas las citas
          </button>
        </div>
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
                        <th></th>
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
                          <td>
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="me-1 ms-2 cursor-pointer text-red-500"
                              title="Eliminar"
                              onClick={() =>
                                removeSchedule(index, scheduleIndex)
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
            Hay {numberOfStudents} estudiantes con profesor asignado para su
            defensa.
            {unassignedStudents.length > 0 ? (
              <>
                {" "}
                De ellos,{" "}
                <span className="font-bold">
                  {unassignedStudents.length}
                </span>{" "}
                no tienen su cita de defensa asignada.
              </>
            ) : (
              <>
                {" "}
                Todos ellos tienen su cita asignada.{" "}
                <span className="font-bold text-red-500">
                  Si las genera de nuevo, las sobrescribirá.
                </span>
              </>
            )}
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
                presentations,
                unassignedStudents.length === 0,
              )}
            </span>{" "}
            citas de defensa
            {unassignedStudents.length > 0 && <> nuevas</>}.
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
          Además, puede intercambiar los horarios de dos presentaciones con el
          botón{" "}
          <FontAwesomeIcon
            icon={faArrowRightArrowLeft}
            title="Intercambiar con otra presentación"
            className="rotate-90 px-1 text-cyan-500"
          />{" "}
          a la derecha.
        </p>
      </div>
      {presentations.length > 0 ? (
        groupedPresentations.map((classroom) => (
          <PresentationClassroom
            key={classroom.classroom}
            onDelete={deletePresentation}
            reload={reloadPresentations}
            searchTerm={search}
            {...classroom}
          />
        ))
      ) : (
        <p>Aún no hay presentaciones generadas.</p>
      )}
      <div className="flex flex-col items-center">
        <h2 className="mb-2 mt-10 text-3xl font-bold">
          Estudiantes sin hora de defensa
        </h2>
        <p className="text-center">
          A los siguientes estudiantes no se les ha asignado una hora de
          defensa.
        </p>
      </div>
      <div className="w-full max-w-7xl overflow-hidden rounded-lg shadow-md">
        <table className="w-full table-auto bg-white">
          <thead className="bg-slate-500 text-white [&_th]:px-2">
            <tr>
              <th className="w-1/3">Estudiante</th>
              <th className="w-1/3">Profesor guía</th>
              <th className="w-1/3">Profesores lectores</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(2n)]:bg-gray-200 [&_td]:p-2">
            {unassignedStudents.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center font-bold italic">
                  No hay
                </td>
              </tr>
            ) : (
              unassignedStudents.map((studentProfessor) => (
                <tr key={studentProfessor.student.id}>
                  <td>{studentProfessor.student.name}</td>
                  <td>
                    {studentProfessor.professors[0]
                      ? studentProfessor.professors[0].name
                      : "Sin asignar"}
                  </td>
                  <td>
                    {studentProfessor.professors
                      .slice(1)
                      .map((professor) => professor.name)
                      .join(", ") || "Sin asignar"}
                  </td>
                  <td>
                    <div className="flex w-6 flex-col items-center">
                      <FontAwesomeIcon
                        icon={faPlus}
                        onClick={() =>
                          navigate(
                            `/admin/manageTheses/presentations/add/${studentProfessor.student.id}`,
                          )
                        }
                        title="Asignar"
                        className="rotate-90 cursor-pointer p-2 text-green-600 hover:text-green-500"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
