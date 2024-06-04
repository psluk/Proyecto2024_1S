import { Calendar, CalendarProps, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/CustomEventStyling.css"; // Override some styles
import React from "react";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    es,
  },
});

interface EventWithStartAndEnd {
  start: Date;
  end: Date;
}

export default function CustomCalendar<
  TEvent extends EventWithStartAndEnd = EventWithStartAndEnd,
  TResource extends object = object,
>(
  props: Omit<CalendarProps<TEvent, TResource>, "localizer">,
): React.ReactElement {
  return (
    <Calendar
      localizer={localizer}
      startAccessor="start"
      endAccessor="end"
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
      {...props}
    />
  );
}
