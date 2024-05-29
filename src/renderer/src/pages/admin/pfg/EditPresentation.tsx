import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  convertApiDateToHtmlAttribute,
  convertApiDateToLocalString,
  convertApiTimeToLocalString,
} from "../../../utils/DateFormatters";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { PresentationInterface } from "../../../../../models/Presentation";

export default function EditPresentation(): React.ReactElement {
  const navigate = useNavigate();
  const { id } = useParams();
  const [originalPresentation, setOriginalPresentation] =
    useState<PresentationInterface | null>(null);
  const [originalEndDate, setOriginalEndDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (id === undefined) return;

    const presentation = window.mainController.getPresentation(parseInt(id));
    let endDate: Date;

    if (presentation) {
      setOriginalPresentation(presentation);
      endDate = new Date(presentation.startTime);
      endDate.setMinutes(endDate.getMinutes() + presentation.minuteDuration);
      setOriginalEndDate(endDate.toISOString());
    }

    setOriginalPresentation(presentation ?? null);
  }, []);

  useEffect(() => {
    if (originalPresentation) {
      const start = new Date(originalPresentation.startTime);
      const duration = originalPresentation.minuteDuration;

      const end = new Date(start);
      end.setMinutes(start.getMinutes() + duration);

      setEndDate(convertApiDateToHtmlAttribute(end.toISOString()));
    }
  }, [originalPresentation]);

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

      setEndDate(convertApiDateToHtmlAttribute(end.toISOString()));
    } catch (e) {
      setEndDate(endDate ?? "");
    }
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
        <form
          className="flex w-full max-w-7xl flex-col items-center gap-5 rounded-lg bg-white p-2 py-10 shadow-md [&_input]:rounded-md [&_input]:shadow-sm"
          onSubmit={handleSubmit}
        >
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
              defaultValue={convertApiDateToHtmlAttribute(
                originalPresentation.startTime,
              )}
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
              onChange={computeEndDate}
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
      )}
    </main>
  );
}
