import {
  faChalkboardUser,
  faChartColumn,
  faFileArrowUp,
  faFileExport,
  faGraduationCap,
  faHouse,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { ShowLogin } from "../global/ShowLogin";

export const adminOptions = [
  {
    name: "Inicio",
    icon: faHouse,
    path: "/admin/home",
    background: "",
    hoverBackground: "",
  },
  {
    name: "Estadísticas",
    icon: faChartColumn,
    path: "/admin/statistics",
    background: "bg-rose-600",
    hoverBackground: "hover:bg-rose-500",
  },
  {
    name: "Profesores",
    icon: faChalkboardUser,
    path: "/admin/manageProfessors",
    background: "bg-purple-600",
    hoverBackground: "hover:bg-purple-500",
  },
  {
    name: "Tesis",
    icon: faGraduationCap,
    path: "/admin/manageTheses",
    background: "bg-cyan-600",
    hoverBackground: "hover:bg-cyan-500",
  },
  {
    name: "Cargar datos",
    icon: faFileArrowUp,
    path: "/admin/uploadFiles",
    background: "bg-blue-600",
    hoverBackground: "hover:bg-blue-500",
  },
  {
    name: "Exportar datos",
    icon: faFileExport,
    path: "/admin/exportFiles",
    background: "bg-green-600",
    hoverBackground: "hover:bg-green-500",
  },
  {
    name: "Usuarios",
    icon: faUser,
    path: "/admin/manageUsers",
    display: ShowLogin,
    background: "bg-slate-600",
    hoverBackground: "hover:bg-slate-500",
  },
].filter((option) => option.display !== false);
