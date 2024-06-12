import {
  faChalkboardUser,
  faChartColumn,
  faFileArrowUp,
  faFileExport,
  faGraduationCap,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";

export const menuOptions = [
  {
    name: "Inicio",
    icon: faHouse,
    path: "/",
    background: "",
    hoverBackground: "",
  },
  {
    name: "Estadísticas",
    icon: faChartColumn,
    path: "/statistics",
    background: "bg-rose-600",
    hoverBackground: "hover:bg-rose-500",
    textColor: "text-rose-700",
  },
  {
    name: "Profesores",
    icon: faChalkboardUser,
    path: "/manageProfessors",
    background: "bg-purple-600",
    hoverBackground: "hover:bg-purple-500",
    textColor: "text-purple-700",
  },
  {
    name: "Tesis",
    icon: faGraduationCap,
    path: "/manageTheses",
    background: "bg-cyan-600",
    hoverBackground: "hover:bg-cyan-500",
    textColor: "text-cyan-700",
  },
  {
    name: "Cargar datos",
    icon: faFileArrowUp,
    path: "/uploadFiles",
    background: "bg-blue-600",
    hoverBackground: "hover:bg-blue-500",
    textColor: "text-blue-700",
  },
  {
    name: "Exportar datos",
    icon: faFileExport,
    path: "/exportFiles",
    background: "bg-green-600",
    hoverBackground: "hover:bg-green-500",
    textColor: "text-green-700",
  },
];
