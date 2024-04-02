import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LogoutButton from "@renderer/components/LogoutButton";
import { adminOptions } from "@renderer/constants/AdminOptions";
import { SessionContext } from "@renderer/context/SessionContext";
import { ShowLogin } from "@renderer/global/ShowLogin";
import { getNameInitials } from "@renderer/utils/Initials";
import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminHome(): JSX.Element {
  const sessionContext = useContext(SessionContext);
  const session = sessionContext?.session;
  const location = useLocation();
  const { pathname } = location;

  return (
    <main className="gap-10">
      <div className="flex flex-col items-center gap-10 w-full">
        {ShowLogin && (
          <>
            <h1 className="text-3xl font-bold">Panel de administración</h1>
            <div className="flex w-full max-w-xl flex-row items-center rounded-lg border border-slate-500 bg-slate-300 py-2 text-lg shadow-md">
              <span className="px-3">
                <span className="mx-2 flex size-10 items-center justify-center rounded-full bg-orange-500 text-xl text-white">
                  {getNameInitials(session?.name || "")}
                </span>
              </span>
              <div className="flex grow flex-col">
                <p>{session?.name}</p>
                <p className="text-base">{session?.email}</p>
              </div>
              <button
                className="mx-5 rounded-md bg-red-500 px-3 py-1.5 text-base font-semibold leading-6 text-white shadow-md transition hover:bg-red-400"
                type="button"
              >
                Cerrar sesión
              </button>
            </div>
          </>
        )}
        <ul className="flex w-full max-w-2xl flex-row flex-wrap">
          {adminOptions
            .filter((option) => option.path !== pathname)
            .map((option, index) => (
              <li className="w-1/2 px-2 py-3" key={index}>
                <Link
                  to={option.path}
                  className={`flex flex-row items-center gap-5 rounded-lg px-6 py-8 text-2xl text-white shadow-md transition ${option.background} ${option.hoverBackground}`}
                >
                  <span>
                    <FontAwesomeIcon className="size-8" icon={option.icon} />
                  </span>
                  {option.name}
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </main>
  );
}
