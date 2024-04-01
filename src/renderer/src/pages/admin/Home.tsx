import LogoutButton from "@renderer/components/LogoutButton";
import { Link } from "react-router-dom";

export default function AdminHome(): JSX.Element {
  return (
    <main className="gap-10">
      <p>
        <span className="font-bold">Perfil activo:</span> Administrador
      </p>{" "}
      <Link to="/admin/manageUsers" className="py-2 px-5 rounded-lg shadow-sm bg-teal-600 font-semibold hover:bg-teal-500 transition text-white">Administrar usuarios</Link>
      <LogoutButton />
    </main>
  );
}
