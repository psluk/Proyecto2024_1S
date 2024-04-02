import { SessionContext } from "@renderer/context/SessionContext";
import { getNameInitials } from "../utils/NameFormatter";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

const userColors = {
  1: "bg-red-500",
  2: "bg-blue-500",
  3: "bg-emerald-500",
};

export default function UserCard() {
  const sessionContext = useContext(SessionContext);
  const session = sessionContext?.session;
  const navigate = useNavigate();

  return (
    <div className="flex w-full max-w-xl flex-row items-center rounded-lg border border-slate-500 bg-slate-300 py-2 text-lg shadow-md">
      <span className="px-3">
        <span
          className={`mx-2 flex size-10 items-center justify-center rounded-full ${userColors[session?.type || 1]} text-xl text-white`}
        >
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
        onClick={() => {
          sessionContext?.logout();
          navigate("/");
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
