import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  convertApiDateToHtmlAttribute,
  convertApiDateToLocalString,
  convertApiTimeToLocalString,
} from "../../../utils/DateFormatters";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { PresentationInterface } from "../../../../../models/Presentation";
import CustomCalendar from "../../../components/Calendar";

interface Event {
  title: string;
  start: Date;
  end: Date;
  type: string;
}

export default function EditPresentation(): React.ReactElement {
  const navigate = useNavigate();
  const { id } = useParams();
  const [originalPresentation, setOriginalPresentation] =
    useState<PresentationInterface | null>(null);
  const [originalEndDate, setOriginalEndDate] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [events, setEvents] = useState<Event[]>([]);
  const [classroom, setClassroom] = useState<string>("");

  useEffect(() => {
    if (id === undefined) return;

    const presentation = window.mainController.getPresentation(parseInt(id));

    if (!presentation) {
      return;
    }

    const endDate = new Date(presentation.startTime);
    endDate.setMinutes(endDate.getMinutes() + presentation.minuteDuration);
    setOriginalEndDate(endDate.toISOString());

    const start = new Date(presentation.startTime);
    const duration = presentation.minuteDuration;

    const end = new Date(start);
    end.setMinutes(start.getMinutes() + duration);

    // Get the events of the same classroom
    handleClassroomChange(presentation.classroom, presentation.id);

    // Get the events of the same professors
    const otherProfessorEvents: Event[] = [];

    presentation.attendees.professors.forEach((professor, index) => {
      const professorEvents =
        window.mainController.getPresentationsByProfessorId(professor.id);

      professorEvents.forEach((event) => {
        if (event.id === presentation.id) return;

        const startDate = new Date(event.startTime);
        otherProfessorEvents.push({
          title: event.attendees.student.name,
          start: startDate,
          end: new Date(startDate.getTime() + event.minuteDuration * 60000),
          type: `professor-event-${Math.min(index + 1, 4)}`,
        });
      });
    });

    setStartDate(new Date(start));
    setEndDate(convertApiDateToHtmlAttribute(end.toISOString()));
    setEvents((prevEvents) => [
      ...prevEvents.filter(
        (event) => !event.type.startsWith("professor-event"),
      ),
      ...otherProfessorEvents,
    ]);
    setOriginalPresentation(presentation);
  }, []);

  const computeEndDate = (): void => {
    try {
      const start = new Date(
        (document.getElementById("inputDatetime") as HTMLInputElement).value,
      );
      const duration = parseInt(
        (document.getElementById("inputDuration") as HTMLInputElement).value,
      );

      const end = new Date(start);
      end.setMinutes(start.getMinutes() + duration);

      setStartDate(new Date(start));
      setEndDate(convertApiDateToHtmlAttribute(end.toISOString()));
    } catch (e) {
      setEndDate(endDate ?? "");
    }
  };

  const handleClassroomChange = (
    classroom: string,
    originalPresentationId?: number,
  ): void => {
    const clashingPresentations =
      classroom !== ""
        ? window.mainController.getPresentationsByClassroom(classroom)
        : [];

    const classroomEvents: Event[] = [];
    clashingPresentations.forEach((event) => {
      if (
        originalPresentationId !== undefined
          ? event.id === originalPresentationId
          : event.id === originalPresentation?.id
      )
        return;

      const startDate = new Date(event.startTime);
      classroomEvents.push({
        title: event.attendees.student.name,
        start: startDate,
        end: new Date(startDate.getTime() + event.minuteDuration * 60000),
        type: "classroom-event",
      });
    });

    setEvents((prevEvents) => [
      ...classroomEvents,
      ...prevEvents.filter((event) => event.type !== "classroom-event"),
    ]);
    setClassroom(classroom);
  };

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();

    const start = new Date(
      (document.getElementById("inputDatetime") as HTMLInputElement).value,
    );
    const duration = parseInt(
      (document.getElementById("inputDuration") as HTMLInputElement).value,
    );
    const classroom = (
      document.getElementById("inputClassroom") as HTMLInputElement
    ).value;

    const { clashingProfessors, clashingPresentations } =
      window.mainController.updatePresentation(
        originalPresentation?.id ?? 0,
        start,
        duration,
        classroom,
      );

    if (clashingProfessors.length > 0) {
      if (clashingPresentations.length > 0) {
        setErrorMessage(
          `El profesor guía o los profesores lectores del estudiante ya tienen una presentación en ese horario. Además, el aula ${classroom} ya está ocupada en ese horario.`,
        );
      } else {
        setErrorMessage(
          `El profesor guía o los profesores lectores del estudiante ya tienen una presentación en ese horario.`,
        );
      }
    } else {
      if (clashingPresentations.length > 0) {
        setErrorMessage(`El aula ${classroom} ya está ocupada en ese horario.`);
      } else {
        navigate("/admin/manageTheses/presentations");
      }
    }
  };

  const eventPropGetter = useCallback(
    (event: Event) => ({
      ...{
        className: event.type,
      },
    }),
    [],
  );

  useEffect(() => {
    if (endDate === "") return;

    setEvents((prevEvents) => [
      ...prevEvents.filter((event) => event.type !== "current-event"),
      {
        title: originalPresentation?.attendees.student.name ?? "",
        start: startDate,
        end: new Date(endDate),
        type: "current-event",
      },
    ]);
  }, [startDate, endDate]);

  return (
    <main className="gap-10">
      <div className="flex flex-col items-center">
        <h1 className="mb-2 mt-10 text-3xl font-bold">Editar presentación</h1>
        <p className="text-center">
          A continuación, se modificará la siguiente presentación:
        </p>
      </div>
      <div className="w-full max-w-7xl overflow-hidden rounded-lg shadow-md">
        <table className="w-full table-auto bg-white">
          <thead className="bg-slate-500 text-white [&_th]:px-2">
            <tr>
              <th className="w-1/5">Fecha</th>
              <th className="w-1/5">Hora</th>
              <th className="w-1/5">Estudiante</th>
              <th className="w-1/5">Profesor guía</th>
              <th className="w-1/5">Profesores lectores</th>
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(2n)]:bg-gray-200 [&_td]:p-2">
            {originalPresentation && (
              <tr>
                <td>
                  {convertApiDateToLocalString(
                    originalPresentation.startTime,
                    "full",
                  )}
                </td>
                <td>
                  De{" "}
                  {convertApiTimeToLocalString(
                    originalPresentation.startTime,
                    "short",
                  )}{" "}
                  a {convertApiTimeToLocalString(originalEndDate, "short")}
                </td>
                <td>{originalPresentation.attendees.student.name}</td>
                <td>
                  {originalPresentation.attendees.professors.find(
                    (professor) => professor.isAdvisor,
                  )?.name ?? "Sin asignar"}
                </td>
                <td>
                  {originalPresentation.attendees.professors
                    .filter((professor) => !professor.isAdvisor)
                    .map((professor) => professor.name)
                    .join(", ") ?? "Sin asignar"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {originalPresentation && (
        <div className="flex w-full max-w-7xl flex-col items-center gap-8 rounded-lg bg-white p-10 shadow-md lg:flex-row">
          <form
            className="flex w-full flex-col items-center gap-5 lg:w-1/3 [&_input]:rounded-md [&_input]:shadow-sm"
            onSubmit={handleSubmit}
          >
            <h2 className="w-full text-center text-3xl font-bold">
              Presentación
            </h2>
            <label htmlFor="inputDatetime" className="text-lg font-bold">
              Fecha y hora de inicio:
            </label>
            <input
              id="inputDatetime"
              type="datetime-local"
              className="w-full border-0 bg-neutral-200 py-1 text-center font-bold outline-0 ring-0"
              onChange={computeEndDate}
              required={true}
              defaultValue={convertApiDateToHtmlAttribute(
                originalPresentation.startTime,
              )}
            />
            <div className="flex w-full max-w-md flex-col items-start">
              <label htmlFor="inputDuration" className="text-lg font-bold">
                Duración:
              </label>
              <div className="flex w-full flex-row gap-2">
                <input
                  id="inputDuration"
                  type="number"
                  className="w-full border-0 bg-neutral-200 py-1 text-center font-bold outline-0 ring-0"
                  step="1"
                  min="1"
                  defaultValue={originalPresentation.minuteDuration}
                  onChange={computeEndDate}
                  required={true}
                />
                <p>minutos</p>
              </div>
            </div>
            <div className="flex w-full max-w-md flex-col items-start">
              <label htmlFor="inputDatetime" className="text-lg font-bold">
                Fecha y hora de finalización:
              </label>
              <input
                id="inputDatetime"
                type="datetime-local"
                className="w-full border-0 bg-neutral-200 py-1 text-center font-bold outline-0 ring-0"
                disabled={true}
                value={endDate}
              />
            </div>
            <div className="flex w-full max-w-md flex-col items-start">
              <label htmlFor="inputClassroom" className="text-lg font-bold">
                Aula:
              </label>
              <input
                id="inputClassroom"
                type="text"
                className="w-full border-0 bg-neutral-200 py-1 text-center font-bold outline-0 ring-0"
                onChange={(e) => handleClassroomChange(e.target.value)}
                required={true}
                defaultValue={originalPresentation.classroom}
              />
            </div>
            <button
              className="mt-2 max-w-full rounded-lg bg-green-600 px-4 py-1 text-xl font-bold text-white shadow-md transition-colors hover:bg-green-500"
              type="submit"
            >
              <FontAwesomeIcon icon={faCheck} className="me-2 size-5" />
              Modificar
            </button>
            {errorMessage && (
              <p className="-mb-5 w-full rounded-md bg-red-100 p-5 text-red-800">
                {errorMessage}
              </p>
            )}
          </form>
          <div className="flex w-full flex-col items-stretch gap-3 lg:w-2/3">
            <h2 className="w-full text-center text-3xl font-bold">
              Calendario
            </h2>
            <p className="text-center">
              Este calendario le permitirá visualizar posibles choques con otras
              presentaciones.
            </p>
            <CustomCalendar
              events={events}
              style={{ height: 500 }}
              date={startDate}
              defaultView="week"
              onNavigate={() => {}}
              scrollToTime={new Date(2023, 0, 1, startDate.getHours() - 1)} // Only the hour is important
              eventPropGetter={eventPropGetter}
            />
            <div className="self-center">
              <ul className="legend flex flex-row flex-wrap justify-center gap-x-5 [&_span]:inline-block [&_span]:size-3 [&_span]:rounded-md">
                <li>
                  <span className="current-event"></span> Presentación actual
                </li>
                <li>
                  <span className="classroom-event"></span> Aula{" "}
                  <b>{classroom}</b>
                </li>
                {originalPresentation?.attendees.professors.map(
                  (professor, index) => (
                    <li key={index}>
                      <span
                        className={`professor-event-${Math.min(index + 1, 4)}`}
                      ></span>{" "}
                      {index + 1 < 4 ? professor.name : "Otros profesores"}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
