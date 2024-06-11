import {
  convertApiDateToLocalString,
  convertApiTimeToLocalString,
} from "../utils/DateFormatters";
import { PresentationInterface } from "../../../models/Presentation";
import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightArrowLeft,
  faBan,
  faPencil,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { PresentationSwapContext } from "../context/PresentationSwapContext";
import { useNavigate } from "react-router-dom";
import { containsSearch } from "../utils/Search";

type Props = {
  classroom: string;
  presentations: PresentationInterface[];
  onDelete: (id: number) => void;
  reload: () => void;
  searchTerm: string;
};

interface IndexedPresentation extends PresentationInterface {
  index: number;
}

export default function PresentationClassroom({
  classroom,
  presentations,
  onDelete,
  reload,
  searchTerm,
}: Props): React.ReactElement {
  const navigate = useNavigate();
  const [expandedDays, setExpandedDays] = useState<string[]>([]);
  const [groupedPresentations, setGroupedPresentations] = useState<
    {
      day: string;
      presentations: IndexedPresentation[];
    }[]
  >([]);
  const presentationSwapContext = useContext(PresentationSwapContext);
  const [filteredPresentationCount, setFilteredPresentationCount] =
    useState<number>(presentations.length);

  useEffect(() => {
    const groupedPresentations: {
      day: string;
      presentations: IndexedPresentation[];
    }[] = [];

    presentations.forEach((presentation) => {
      const day = convertApiDateToLocalString(presentation.startTime, "full");

      const dayIndex = groupedPresentations.findIndex(
        (group) => group.day === day,
      );

      if (dayIndex === -1) {
        groupedPresentations.push({
          day,
          presentations: [{ ...presentation, index: 0 }],
        });
      } else {
        groupedPresentations[dayIndex].presentations.push({
          ...presentation,
          index: groupedPresentations[dayIndex].presentations.length,
        });
      }
    });

    // If the only presentation of a day was removed, collapse that day
    setExpandedDays(
      expandedDays.filter((expandedDay) =>
        groupedPresentations.some((group) => group.day === expandedDay),
      ),
    );

    // If the search term contains the classroom or is empty, don't filter the presentations
    if (searchTerm === "" || containsSearch(classroom, searchTerm)) {
      setGroupedPresentations(groupedPresentations);
      setFilteredPresentationCount(presentations.length);
      return;
    }

    // Filter presentations by search term
    const filteredGroupedPresentations = groupedPresentations
      .map((group) => {
        if (containsSearch(group.day, searchTerm)) {
          return group;
        }

        return {
          day: group.day,
          presentations: group.presentations.filter(
            (presentation) =>
              containsSearch(presentation.attendees.student.name, searchTerm) ||
              presentation.attendees.professors.some((professor) =>
                containsSearch(professor.name, searchTerm),
              ),
          ),
        };
      })
      .filter(
        (group) =>
          containsSearch(group.day, searchTerm) ||
          group.presentations.length > 0,
      );

    setGroupedPresentations(filteredGroupedPresentations);
    setFilteredPresentationCount(
      filteredGroupedPresentations.reduce(
        (acc, group) => acc + group.presentations.length,
        0,
      ),
    );
  }, [presentations, searchTerm]);

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
    <>
      <article className="w-full max-w-7xl overflow-hidden rounded-lg bg-white shadow-md [&_h3]:bg-slate-500 [&_h4:hover]:bg-slate-300">
        <h3 className="relative px-4 py-2 text-2xl font-semibold text-white">
          {classroom}
          <span className="absolute end-4 top-1/2 -translate-y-1/2 text-base">
            {filteredPresentationCount < presentations.length &&
              `${filteredPresentationCount} de `}
            {presentations.length}{" "}
            {presentations.length === 1 ? "presentación" : "presentaciones"}
          </span>
        </h3>
        {groupedPresentations.length > 0 ? (
          groupedPresentations.map((group, index) => {
            // Force the day to be expanded if one of its presentations contains the search term
            const isCurrentDayExpanded =
              expandedDays.includes(group.day) ||
              group.presentations.some(
                (presentation) =>
                  containsSearch(
                    presentation.attendees.student.name,
                    searchTerm,
                  ) ||
                  presentation.attendees.professors.some((professor) =>
                    containsSearch(professor.name, searchTerm),
                  ),
              );

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
                    {group.presentations.length}{" "}
                    {searchTerm === ""
                      ? group.presentations.length === 1
                        ? "presentación"
                        : "presentaciones"
                      : group.presentations.length === 1
                        ? "resultado"
                        : "resultados"}
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
                        {group.presentations.map((presentation) => {
                          const endTime = new Date(presentation.startTime);
                          endTime.setMinutes(
                            endTime.getMinutes() + presentation.minuteDuration,
                          );

                          return (
                            <tr
                              key={presentation.id}
                              className={`[&>td]:p-2 ${presentationSwapContext.swappingPresentation !== null ? (presentationSwapContext.swappingPresentation === presentation.id ? "!bg-amber-300" : "cursor-pointer hover:!bg-amber-100") : ""}`}
                              onClick={() => {
                                presentationSwapContext.setNewPresentationId(
                                  presentation.id,
                                  reload,
                                );
                              }}
                            >
                              <td className="bg-gray-300 text-center font-bold">
                                {presentation.index + 1}
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
                                <div className="flex h-[6rem] w-6 flex-col items-center justify-center">
                                  {presentationSwapContext.swappingPresentation !==
                                  null ? (
                                    presentationSwapContext.swappingPresentation ===
                                      presentation.id && (
                                      <FontAwesomeIcon
                                        icon={faBan}
                                        onClick={() =>
                                          presentationSwapContext.cancelSwappingPresentation()
                                        }
                                        title="Cancelar intercambio"
                                        className="cursor-pointer p-2 text-cyan-500 hover:text-cyan-400"
                                      />
                                    )
                                  ) : (
                                    <>
                                      <FontAwesomeIcon
                                        icon={faPencil}
                                        onClick={() =>
                                          navigate(
                                            `/manageTheses/presentations/edit/${presentation.id}`,
                                          )
                                        }
                                        title="Editar"
                                        className="cursor-pointer p-2 text-emerald-500 hover:text-emerald-400"
                                      />
                                      <FontAwesomeIcon
                                        icon={faArrowRightArrowLeft}
                                        onClick={() =>
                                          presentationSwapContext.setSwappingPresentationId(
                                            presentation.id,
                                          )
                                        }
                                        title="Intercambiar con otra presentación"
                                        className="rotate-90 cursor-pointer p-2 text-cyan-500 hover:text-cyan-400"
                                      />
                                      <FontAwesomeIcon
                                        icon={faXmark}
                                        onClick={() =>
                                          onDelete(presentation.id)
                                        }
                                        title="Eliminar presentación"
                                        className="cursor-pointer p-2 text-red-500 hover:text-red-400"
                                      />
                                    </>
                                  )}
                                </div>
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
          })
        ) : (
          <div className="p-5 text-center font-bold italic">
            <p>No hay resultados</p>
          </div>
        )}
      </article>
      {typeof presentationSwapContext.swappingPresentation === "number" &&
        presentations
          .map((p) => p.id)
          .includes(presentationSwapContext.swappingPresentation) && (
          <div className="absolute bottom-5 start-5 z-[5] max-w-96 animate-pulse overflow-hidden rounded-md border border-slate-200 bg-slate-500 p-2 text-xl text-white shadow-md">
            <p>
              Haga clic en la presentación con la que quiere intercambiar la que
              está seleccionada
            </p>
          </div>
        )}
    </>
  );
}
