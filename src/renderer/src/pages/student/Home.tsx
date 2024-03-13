import LogoutButton from "@renderer/components/LogoutButton";

export default function StudentHome(): JSX.Element {
  return (
    <div className="flex flex-col gap-10">
      <p>
        <span className="font-bold">Perfil activo:</span> Estudiante
      </p>{" "}
      <LogoutButton />
    </div>
  );
}
