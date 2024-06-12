import {
  faWindowMaximize,
  faWindowRestore,
} from "@fortawesome/free-regular-svg-icons";
import {
  faArrowLeft,
  faBars,
  faMinus,
  faThumbtack,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { menuOptions } from "@renderer/constants/MenuOptions";
import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const routesWithoutMenu = ["/"];

export default function TitleBar(): React.ReactElement {
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [keepMenuOpen, setKeepMenuOpen] = useState<boolean>(
    localStorage.getItem("keepMenuOpen") === "true",
  );
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();

  const handleAction = (action: string): void => {
    window.electron.ipcRenderer.send(action);
  };

  window.electron.ipcRenderer.on("maximize", () => {
    setIsMaximized(true);
  });

  window.electron.ipcRenderer.on("unmaximize", () => {
    setIsMaximized(false);
  });

  useEffect(() => {
    setIsMenuOpen(!routesWithoutMenu.includes(pathname));
    localStorage.setItem("keepMenuOpen", keepMenuOpen.toString());
  }, [keepMenuOpen]);

  return (
    <>
      <div
        className="absolute top-0 z-10 flex w-full flex-row items-center bg-slate-700 text-white"
        id="title-bar"
      >
        {!keepMenuOpen && (
          <span
            className={`ms-2 flex size-6 items-center justify-center rounded-full bg-white text-slate-700 transition hover:bg-slate-300 ${routesWithoutMenu.includes(pathname) ? "opacity-0" : "cursor-pointer"} transition-opacity duration-300`}
            onClick={() => {
              if (routesWithoutMenu.includes(pathname)) setIsMenuOpen(false);
              else setIsMenuOpen(!isMenuOpen);
            }}
            title={routesWithoutMenu.includes(pathname) ? "" : "Menú"}
          >
            <FontAwesomeIcon className="size-3" icon={faBars} />
          </span>
        )}
        <span
          className={`ms-2 flex size-6 items-center justify-center rounded-full bg-white text-slate-700 transition hover:bg-slate-300 ${routesWithoutMenu.includes(pathname) ? "opacity-0" : "cursor-pointer"} transition-opacity duration-300`}
          onClick={() => {
            if (!routesWithoutMenu.includes(pathname)) {
              try {
                navigate(-1);
              } catch (error) {
                /* don't do anything */
              }
            }
          }}
          title={routesWithoutMenu.includes(pathname) ? "" : "Regresar"}
        >
          <FontAwesomeIcon className="size-3" icon={faArrowLeft} />
        </span>
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
      <div
        className={`absolute ${!keepMenuOpen && !routesWithoutMenu.includes(pathname) && isMenuOpen ? "left-0" : "-left-full"} w-screen bg-slate-800/50 transition-[left]`}
        id="side-menu-shadow"
        onClick={() => setIsMenuOpen(false)}
      ></div>
      <div
        className={`${keepMenuOpen ? "mt-8" : "absolute"} grid ${!routesWithoutMenu.includes(pathname) && isMenuOpen ? "left-0" : "-left-full"} z-10 w-96 items-center overflow-y-auto bg-slate-600 px-5 py-2 text-white shadow-lg transition-[left] duration-300`}
        id="side-menu"
      >
        <nav className="flex h-full w-full flex-col items-center justify-evenly gap-12">
          <ul className="flex w-full grow flex-col justify-center gap-2">
            {menuOptions.map((option, index) => (
              <li key={index}>
                <NavLink
                  to={option.path}
                  className={({ isActive }) =>
                    `flex flex-row items-center gap-5 rounded-lg px-5 py-4 text-xl ${isActive ? `bg-slate-300 font-bold ${option.textColor ?? "text-cyan-700"}` : "hover:bg-slate-400"} transition`
                  }
                  onClick={() => !keepMenuOpen && setIsMenuOpen(false)}
                >
                  <span>
                    <FontAwesomeIcon className="size-6" icon={option.icon} />
                  </span>
                  {option.name}
                </NavLink>
              </li>
            ))}
          </ul>
          <span
            onClick={() => setKeepMenuOpen(!keepMenuOpen)}
            className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-white text-slate-700 transition hover:bg-slate-200"
          >
            <FontAwesomeIcon
              icon={keepMenuOpen ? faXmark : faThumbtack}
              className="size-4"
            />
          </span>
        </nav>
      </div>
    </>
  );
}
