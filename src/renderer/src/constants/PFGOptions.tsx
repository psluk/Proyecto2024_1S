import {
  faUsersLine,
  faUserGraduate,
  faCalendarDay,
  faChalkboardTeacher,
} from "@fortawesome/free-solid-svg-icons";

export const pfgOptions = [
  {
    name: "Estudiantes",
    icon: faUserGraduate,
    path: "/admin/manageTheses/students",
    background: "bg-emerald-600",
    hoverBackground: "hover:bg-emerald-500",
  },
  {
    name: "Tutores",
    icon: faChalkboardTeacher,
    path: "/admin/manageTheses/advisors",
    background: "bg-purple-600",
    hoverBackground: "hover:bg-purple-500",
  },
  {
    name: "Grupos",
    icon: faUsersLine,
    path: "/admin/manageTheses/groups",
    background: "bg-cyan-600",
    hoverBackground: "hover:bg-cyan-500",
  },
  {
    name: "Presentaciones",
    icon: faCalendarDay,
    path: "/admin/manageTheses/presentations",
    background: "bg-blue-600",
    hoverBackground: "hover:bg-blue-500",
  },
];
