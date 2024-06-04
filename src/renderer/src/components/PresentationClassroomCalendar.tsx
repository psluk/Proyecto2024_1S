import { PresentationInterface } from "../../../models/Presentation";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { containsSearch } from "../utils/Search";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/CustomEventStyling.css"; // Override some styles

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    es,
  },
});

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

  const onSelectEvent = useCallback((calEvent: Event) => {
    navigate(`/admin/manageTheses/presentations/edit/${calEvent.id}`);
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
          <Calendar
            localizer={localizer}
            events={adaptedPresentations}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            culture="es"
            defaultView="week"
            messages={{
              date: "Fecha",
              time: "Hora",
              event: "Presentación",
              allDay: "Todo el día",
              week: "Semana",
              work_week: "Semana laboral",
              day: "Día",
              month: "Mes",
              previous: "←",
              next: "→",
              yesterday: "Ayer",
              tomorrow: "Mañana",
              today: "Hoy",
              agenda: "Agenda",
              noEventsInRange: "No hay presentaciones en estas fechas.",

              showMore: (total) => `+${total} más`,
            }}
            onSelectEvent={onSelectEvent}
            eventPropGetter={eventPropGetter}
          />
        </div>
      </article>
    </>
  );
}
