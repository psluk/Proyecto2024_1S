import LogoutButton from "@renderer/components/LogoutButton";

export default function ProfessorHome(): JSX.Element {
  return (
    <div className="flex flex-col gap-10">
      <p>
        <span className="font-bold">Perfil activo:</span> Profesor
      </p>{" "}
      <LogoutButton />
    </div>
  );
}
