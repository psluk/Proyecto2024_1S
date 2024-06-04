import React, { useCallback, useEffect, useState } from "react";
import { StudentProfessorInterface } from "../../../../../models/StudentProfessor";
import { useNavigate, useParams } from "react-router-dom";
import { convertApiDateToHtmlAttribute } from "../../../utils/DateFormatters";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import CustomCalendar from "../../../components/Calendar";

interface Event {
  title: string;
  start: Date;
  end: Date;
  type: string;
}

export default function AddPresentation(): React.ReactElement {
  const navigate = useNavigate();
  const { id } = useParams();
  const [unassignedStudent, setUnassignedStudent] =
    useState<StudentProfessorInterface | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [events, setEvents] = useState<Event[]>([]);
  const [classroom, setClassroom] = useState<string>("");

  useEffect(() => {
    if (id === undefined) return;

    const unassignedStudents = window.mainController.getStudentsProfessors();
    const unassignedStudent = unassignedStudents.find(
      (studentProfessor) => studentProfessor.student.id === parseInt(id),
    );

    if (!unassignedStudent) {
      return;
    }

    setUnassignedStudent(unassignedStudent ?? null);

    // Get the events of the same professors
    const otherProfessorEvents: Event[] = [];

    unassignedStudent.professors.forEach((professor, index) => {
      const professorEvents =
        window.mainController.getPresentationsByProfessorId(professor.id);

      professorEvents.forEach((event) => {
        const startDate = new Date(event.startTime);
        otherProfessorEvents.push({
          title: event.attendees.student.name,
          start: startDate,
          end: new Date(startDate.getTime() + event.minuteDuration * 60000),
          type: `professor-event-${Math.min(index + 1, 4)}`,
        });
      });
    });

    setEvents(otherProfessorEvents);
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

  const handleClassroomChange = (classroom: string): void => {
    const clashingPresentations =
      classroom !== ""
        ? window.mainController.getPresentationsByClassroom(classroom)
        : [];

    const classroomEvents: Event[] = [];
    clashingPresentations.forEach((event) => {
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
      window.mainController.addPresentation(
        unassignedStudent?.student.id ?? 0,
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
        navigate(-1);
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
        title: unassignedStudent?.student.name ?? "",
        start: startDate,
        end: new Date(endDate),
        type: "current-event",
      },
    ]);
  }, [startDate, endDate]);

  return (
    <main className="gap-10">
      <div className="flex flex-col items-center">
        <h1 className="mb-2 mt-10 text-3xl font-bold">Añadir presentación</h1>
        <p className="text-center">
          A continuación, se le añadirá una hora de presentación al siguiente
          estudiante:
        </p>
      </div>
      <div className="w-full max-w-7xl overflow-hidden rounded-lg shadow-md">
        <table className="w-full table-auto bg-white">
          <thead className="bg-slate-500 text-white [&_th]:px-2">
            <tr>
              <th className="w-1/3">Estudiante</th>
              <th className="w-1/3">Profesor guía</th>
              <th className="w-1/3">Profesores lectores</th>
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(2n)]:bg-gray-200 [&_td]:p-2">
            {unassignedStudent && (
              <tr>
                <td>{unassignedStudent.student.name}</td>
                <td>
                  {unassignedStudent.professors[0]
                    ? unassignedStudent.professors[0].name
                    : "Sin asignar"}
                </td>
                <td>
                  {unassignedStudent.professors
                    .slice(1)
                    .map((professor) => professor.name)
                    .join(", ") || "Sin asignar"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex w-full max-w-7xl flex-col items-center gap-8 rounded-lg bg-white p-10 shadow-md lg:flex-row">
        <form
          className="flex w-full flex-col items-center gap-5 lg:w-1/3 [&_input]:rounded-md [&_input]:shadow-sm"
          onSubmit={handleSubmit}
        >
          <h2 className="w-full text-center text-3xl font-bold">
            Presentación
          </h2>
          <div className="flex w-full max-w-md flex-col items-start">
            <label htmlFor="inputDatetime" className="text-lg font-bold">
              Fecha y hora de inicio:
            </label>
            <input
              id="inputDatetime"
              type="datetime-local"
              className="w-full border-0 bg-neutral-200 py-1 text-center font-bold outline-0 ring-0"
              onChange={computeEndDate}
              required={true}
            />
          </div>
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
                defaultValue={90}
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
            />
          </div>
          <button
            className="mt-2 max-w-full rounded-lg bg-green-600 px-4 py-1 text-xl font-bold text-white shadow-md transition-colors hover:bg-green-500"
            type="submit"
          >
            <FontAwesomeIcon icon={faCheck} className="me-2 size-5" />
            Añadir
          </button>
          {errorMessage && (
            <p className="-mb-5 w-full rounded-md bg-red-100 p-5 text-red-800">
              {errorMessage}
            </p>
          )}
        </form>
        <div className="flex w-full flex-col items-stretch gap-3 lg:w-2/3">
          <h2 className="w-full text-center text-3xl font-bold">Calendario</h2>
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
              {unassignedStudent?.professors.map((professor, index) => (
                <li key={index}>
                  <span
                    className={`professor-event-${Math.min(index + 1, 4)}`}
                  ></span>{" "}
                  {index + 1 < 4 ? professor.name : "Otros profesores"}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
