import {
  convertApiDateToLocalString,
  convertApiTimeToLocalString,
} from "../utils/DateFormatters";
import { PresentationInterface } from "../../../models/Presentation";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

export default function PresentationClassroom(props): React.ReactElement {
  const classroom = props.classroom as string;
  const presentations = props.presentations as PresentationInterface[];
  const onDelete = props.onDelete as (id: number) => void;
  const [expandedDays, setExpandedDays] = React.useState<string[]>([]);
  const [groupedPresentations, setGroupedPresentations] = React.useState<
    {
      day: string;
      presentations: PresentationInterface[];
    }[]
  >([]);

  React.useEffect(() => {
    const groupedPresentations: {
      day: string;
      presentations: PresentationInterface[];
    }[] = [];

    presentations.forEach((presentation) => {
      const day = convertApiDateToLocalString(presentation.startTime, "full");

      const dayIndex = groupedPresentations.findIndex(
        (group) => group.day === day,
      );

      if (dayIndex === -1) {
        groupedPresentations.push({
          day,
          presentations: [presentation],
        });
      } else {
        groupedPresentations[dayIndex].presentations.push(presentation);
      }
    });

    setGroupedPresentations(groupedPresentations);
  }, [presentations]);

  const toggleDay = (day: string): void => {
    if (expandedDays.includes(day)) {
      setExpandedDays(
        expandedDays.filter((expandedDay) => expandedDay !== day),
      );
    } else {
      setExpandedDays([...expandedDays, day]);
    }
  };

  return (
    <article className="w-full max-w-7xl overflow-hidden rounded-lg bg-white shadow-md [&_h3]:bg-slate-500 [&_h4:hover]:bg-slate-300">
      <h3 className="relative px-4 py-2 text-2xl font-semibold text-white">
        {classroom}
        <span className="absolute end-4 top-1/2 -translate-y-1/2 text-base">
          {presentations.length} presentaciones
        </span>
      </h3>
      {groupedPresentations.map((group, index) => {
        const isCurrentDayExpanded = expandedDays.includes(group.day);

        return (
          <div
            key={index}
            className="m-5 overflow-hidden rounded-md border border-slate-300"
          >
            <h4
              className={`relative w-full cursor-pointer text-start font-bold transition-[font-size,padding,background-color] duration-500 ${isCurrentDayExpanded ? "bg-slate-200 p-2 text-xl" : "px-2"}`}
              onClick={() => toggleDay(group.day)}
            >
              {group.day}
              <span className="absolute end-2 top-1/2 -translate-y-1/2 text-sm">
                {group.presentations.length} presentaciones
              </span>
            </h4>
            <div className="overflow-hidden">
              <div
                className={`${isCurrentDayExpanded ? "-mt-0" : "-mt-[100%]"} transition-[margin-top] duration-300`}
              >
                <table className="w-full table-auto">
                  <thead className="bg-slate-500 text-white">
                    <tr>
                      <th className="px-2">N.º</th>
                      <th className="w-1/3 px-2">Hora</th>
                      <th className="w-1/3 px-2">Estudiante</th>
                      <th className="w-1/3 px-2">Profesores</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="[&>tr:nth-child(2n)]:bg-gray-200">
                    {group.presentations.map((presentation, index) => {
                      const endTime = new Date(presentation.startTime);
                      endTime.setMinutes(
                        endTime.getMinutes() + presentation.minuteDuration,
                      );

                      return (
                        <tr key={presentation.id} className="[&>td]:p-2">
                          <td className="bg-gray-300 text-center font-bold">
                            {index + 1}
                          </td>
                          <td>
                            De{" "}
                            {convertApiTimeToLocalString(
                              presentation.startTime,
                              "short",
                            )}{" "}
                            a{" "}
                            {convertApiTimeToLocalString(
                              endTime.toISOString(),
                              "short",
                            )}
                          </td>
                          <td>{presentation.attendees.student.name}</td>
                          <td>
                            <ol className="list-decimal">
                              {presentation.attendees.professors.map(
                                (professor) => (
                                  <li key={professor.id} className="ms-5">
                                    {professor.name}{" "}
                                    {professor.isAdvisor && (
                                      <span className="text-sm font-bold">
                                        (guía)
                                      </span>
                                    )}
                                  </li>
                                ),
                              )}
                            </ol>
                          </td>
                          <td>
                            <FontAwesomeIcon
                              icon={faXmark}
                              onClick={() => onDelete(presentation.id)}
                              title="Eliminar presentación"
                              className="cursor-pointer p-2 text-red-500 hover:text-red-400"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}
    </article>
  );
}