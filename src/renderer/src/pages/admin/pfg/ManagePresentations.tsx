import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faMagnifyingGlass,
  faPlus,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import { convertApiDateToHtmlAttribute } from "../../../utils/DateFormatters";

interface Classroom {
  name: string;
  schedule: {
    startTime: string;
    endTime: string;
  }[];
}

export default function ManagePresentations(): React.ReactElement {
  const [search, setSearch] = useState<string>("");
  const [showGenerationParameters, setShowGenerationParameters] =
    useState<boolean>(false);
  const [presentationInterval, setPresentationInterval] = useState<number>(30);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [lunchBreak, setLunchBreak] = useState<{
    startTime: string;
    endTime: string;
  }>({ startTime: "12:00", endTime: "13:30" });

  const toggleGenerationParameters = (): void => {
    setShowGenerationParameters(!showGenerationParameters);
  };

  const addClassroom = (): void => {
    const startDate = new Date();
    startDate.setHours(24 + 8);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 3);

    setClassrooms([
      ...classrooms,
      {
        name: `Aula #${classrooms.length + 1}`,
        schedule: [
          {
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
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
    // Convert the lunch break to UTC timestamps
    const lunchBreakStart = new Date(
      `2000-01-01T${lunchBreak.startTime}:00`,
    ).toISOString().split("T")[1];
    const lunchBreakEnd = new Date(
      `2000-01-01T${lunchBreak.endTime}:00`,
    ).toISOString().split("T")[1];

    console.log({
      classrooms,
      presentationInterval,
      lunchBreakStart,
      lunchBreakEnd,
    });
  }

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
            placeholder="Buscar"
            className="h-8 flex-1 rounded-md border-none pl-4 pr-10 focus:outline-none focus:ring-0"
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
        </div>
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
          <p className="max-w-xl">
            Se necesita la información de las aulas disponibles para generar las
            horas de las presentaciones sin choques de horario.
          </p>
          <div className="mt-5 grid w-full grid-cols-1 gap-4 xl:grid-cols-2">
            {classrooms.map((classroom, index) => (
              <article
                className="flex w-full flex-col items-center overflow-hidden rounded-lg shadow-md"
                key={index}
              >
                <div className="mb-1 flex w-full items-center bg-neutral-400">
                  <input
                    className="w-full grow border-0 bg-inherit py-1 text-center text-lg font-bold outline-0 ring-0"
                    value={classroom.name}
                    type="text"
                    onChange={(e) => updateClassroomName(index, e.target.value)}
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
                            className="ms-2 cursor-pointer text-red-500"
                            title="Eliminar"
                            onClick={() => removeSchedule(index, scheduleIndex)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
          <button
            className="max-w-full mt-14 rounded-lg text-xl font-bold bg-green-600 px-4 py-1 text-white shadow-md transition-colors hover:bg-green-500"
            onClick={handleSubmit}
          >
            <FontAwesomeIcon icon={faCheck} className="me-2 size-5" />
            Generar
          </button>
        </div>
      )}
    </main>
  );
}
