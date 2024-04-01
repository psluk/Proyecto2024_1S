import LogoutButton from "@renderer/components/LogoutButton";

export default function StudentHome(): JSX.Element {
  return (
    <main className="gap-10">
      <p>
        <span className="font-bold">Perfil activo:</span> Estudiante
      </p>{" "}
      <LogoutButton />
    </main>
  );
}
