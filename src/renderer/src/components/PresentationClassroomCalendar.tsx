import { PresentationInterface } from "../../../models/Presentation";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { containsSearch } from "../utils/Search";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/CustomEventStyling.css";
import CustomCalendar from "./Calendar"; // Override some styles

type Props = {
  classroom: string;
  presentations: PresentationInterface[];
  searchTerm: string;
};

interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  student: string;
  professors: string[];
}

export default function PresentationClassroomCalendar({
  classroom,
  presentations,
  searchTerm,
}: Props): React.ReactElement {
  const navigate = useNavigate();
  const [adaptedPresentations, setAdaptedPresentations] = useState<Event[]>([]);
  const [earliestDate, setEarliestDate] = useState(new Date());

  useEffect(() => {
    setAdaptedPresentations(
      presentations.map((presentation) => {
        const endTime = new Date(presentation.startTime);
        endTime.setMinutes(endTime.getMinutes() + presentation.minuteDuration);

        return {
          id: presentation.id,
          title: presentation.attendees.student.name,
          start: new Date(presentation.startTime),
          end: endTime,
          student: presentation.attendees.student.name,
          professors: presentation.attendees.professors.map(
            (professor) => professor.name,
          ),
        };
      }),
    );
  }, [presentations]);

  useEffect(() => {
    setEarliestDate(
      adaptedPresentations.length > 0
        ? adaptedPresentations.reduce(
            (earliest, presentation) =>
              presentation.start.getTime() < earliest.getTime()
                ? presentation.start
                : earliest,
            adaptedPresentations[0].start,
          )
        : new Date(),
    );
  }, [adaptedPresentations]);

  const onSelectEvent = useCallback((calEvent: Event) => {
    navigate(`/manageTheses/presentations/edit/${calEvent.id}`);
  }, []);

  const eventPropGetter = useCallback(
    (event: Event) => ({
      ...(searchTerm !== ""
        ? containsSearch(classroom, searchTerm) ||
          containsSearch(event.student, searchTerm) ||
          event.professors.some((professor) =>
            containsSearch(professor, searchTerm),
          )
          ? {
              className: "matchingEvent",
            }
          : {
              className: "opacity-50",
            }
        : {}),
    }),
    [searchTerm],
  );

  return (
    <>
      <article className="w-full max-w-7xl overflow-hidden rounded-lg bg-white shadow-md [&_h3]:bg-slate-500 [&_h4:hover]:bg-slate-300">
        <h3 className="relative px-4 py-2 text-2xl font-semibold text-white">
          {classroom}
          <span className="absolute end-4 top-1/2 -translate-y-1/2 text-base">
            {presentations.length}{" "}
            {presentations.length === 1 ? "presentación" : "presentaciones"}
          </span>
        </h3>
        <div className="w-full p-5">
          <CustomCalendar
            events={adaptedPresentations}
            style={{ height: 500 }}
            defaultView="week"
            onSelectEvent={onSelectEvent}
            eventPropGetter={eventPropGetter}
            scrollToTime={new Date(2023, 0, 1, 8)} // Only the hour is important
            date={earliestDate}
          />
        </div>
      </article>
    </>
  );
}
