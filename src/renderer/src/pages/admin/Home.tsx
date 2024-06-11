import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserCard from "@renderer/components/UserCard";
import { adminOptions } from "@renderer/constants/AdminOptions";
import { ShowLogin } from "@renderer/global/ShowLogin";
import { Link, useLocation } from "react-router-dom";
import React from "react";

export default function AdminHome(): React.ReactElement {
  const location = useLocation();
  const { pathname } = location;

  return (
    <main className="gap-16">
      <picture className="flex w-full items-center justify-center gap-6">
        <img src={"/Logo.png"} alt="Logo" className="max-w-32" />
        <h2 className="text-3xl font-bold">
          Gestor de Asignaciones de Defensas de Tesis
        </h2>
      </picture>
      <div className="flex w-full flex-col items-center gap-10">
        {ShowLogin && (
          <>
            <h1 className="text-3xl font-bold">Panel de administración</h1>
            <UserCard />
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
