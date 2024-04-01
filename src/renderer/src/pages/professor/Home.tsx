import LogoutButton from "@renderer/components/LogoutButton";

export default function ProfessorHome(): JSX.Element {
  return (
    <main className="gap-10">
      <p>
        <span className="font-bold">Perfil activo:</span> Profesor
      </p>{" "}
      <LogoutButton />
    </main>
  );
}
