import {
  faWindowMaximize,
  faWindowRestore,
} from "@fortawesome/free-regular-svg-icons";
import { faBars, faMinus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { adminOptions } from "@renderer/constants/AdminOptions";
import { SessionContext } from "@renderer/context/SessionContext";
import { ShowLogin } from "@renderer/global/ShowLogin";
import { getNameInitials } from "../utils/NameFormatter";
import { useContext, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const routesWithoutMenu = [
  "/",
  "/register",
  "/student/home",
  "/professor/home",
  "/admin/home",
];

export default function TitleBar(): JSX.Element {
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const sessionContext = useContext(SessionContext);
  const session = sessionContext?.session;
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    window.electron.ipcRenderer.send(action);
  };

  window.electron.ipcRenderer.on("maximize", () => {
    setIsMaximized(true);
  });

  window.electron.ipcRenderer.on("unmaximize", () => {
    setIsMaximized(false);
  });

  return (
    <div
      className="absolute top-0 flex w-full flex-row items-center bg-slate-700 text-white"
      id="title-bar"
    >
      <span
        className={`ms-2 flex size-6 items-center justify-center rounded-full bg-white text-slate-700 transition hover:bg-slate-300 ${routesWithoutMenu.includes(pathname) ? "opacity-0" : "cursor-pointer"} transition-opacity duration-300`}
        onClick={() => {
          if (routesWithoutMenu.includes(pathname)) setIsMenuOpen(false);
          else setIsMenuOpen(!isMenuOpen);
        }}
      >
        <FontAwesomeIcon className="size-3" icon={faBars} />
      </span>
      <div
        className={`absolute ${!routesWithoutMenu.includes(pathname) && isMenuOpen ? "left-0" : "-left-full"} w-screen bg-slate-800/50 transition-[left]`}
        id="side-menu-shadow"
        onClick={() => setIsMenuOpen(false)}
      ></div>
      <div
        className={`absolute grid ${!routesWithoutMenu.includes(pathname) && isMenuOpen ? "left-0" : "-left-full"} w-80 items-center overflow-y-auto bg-slate-600 px-5 py-6 shadow-lg transition-[left] duration-300`}
        id="side-menu"
      >
        <nav className="flex h-full w-full flex-col items-center justify-evenly gap-12">
          {ShowLogin && (
            <div className="flex w-full flex-row items-center rounded-md border border-slate-800 bg-slate-500 py-2 shadow-lg">
              <span>
                <span className="mx-2 flex size-10 items-center justify-center rounded-full bg-orange-500 text-xl">
                  {getNameInitials(session?.name || "")}
                </span>
              </span>
              <div className="flex flex-col">
                <p>{session?.name}</p>
                <p className="text-sm">{session?.email}</p>
              </div>
            </div>
          )}
          <ul className="flex flex-col gap-2">
            {adminOptions.map((option, index) => (
              <li key={index}>
                <NavLink
                  to={option.path}
                  className={({ isActive }) =>
                    `flex flex-row items-center gap-5 rounded-lg px-5 py-4 text-xl ${isActive ? "bg-slate-300 font-bold text-cyan-700" : "hover:bg-slate-400"} transition`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>
                    <FontAwesomeIcon className="size-6" icon={option.icon} />
                  </span>
                  {option.name}
                </NavLink>
              </li>
            ))}
          </ul>
          {ShowLogin && (
            <button
              className="flex w-full justify-center rounded-md bg-red-500 px-3 py-1.5 font-semibold leading-6 text-white shadow-md hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              onClick={() => {
                setIsMenuOpen(false);
                sessionContext?.logout();
                navigate("/");
              }}
              type="button"
            >
              Cerrar sesión
            </button>
          )}
        </nav>
      </div>
      <span className="h-full grow" id="draggable-title-bar"></span>
      <ul className="flex h-full flex-row [&>li]:flex [&>li]:h-full [&>li]:w-12 [&>li]:items-center [&>li]:justify-center [&>li]:transition">
        <li
          className="hover:bg-sky-500"
          onClick={() => {
            handleAction("minimize");
          }}
        >
          <FontAwesomeIcon className="size-3" icon={faMinus} />
        </li>
        <li
          className="hover:bg-sky-500"
          onClick={() => {
            handleAction("maximize");
          }}
        >
          <FontAwesomeIcon
            className="size-3"
            icon={isMaximized ? faWindowRestore : faWindowMaximize}
          />
        </li>
        <li
          className="hover:bg-red-600"
          onClick={() => {
            handleAction("close");
          }}
        >
          <FontAwesomeIcon className="size-5" icon={faXmark} />
        </li>
      </ul>
    </div>
  );
}
