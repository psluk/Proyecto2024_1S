import {
  faWindowMaximize,
  faWindowRestore,
} from "@fortawesome/free-regular-svg-icons";
import { faBars, faMinus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const routesWithoutMenu = [
  "/",
  "/register",
  "/student/home",
  "/professor/home",
  "/admin/home",
];

export default function TitleBar(): JSX.Element {
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const location = useLocation();
  const pathname = location.pathname;

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
      {!routesWithoutMenu.includes(pathname) && (
        <span className="ms-2 flex size-6 cursor-pointer items-center justify-center rounded-full bg-white text-slate-700 transition hover:bg-slate-300">
          <FontAwesomeIcon className="size-3" icon={faBars} />
        </span>
      )}
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
