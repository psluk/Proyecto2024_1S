import UserCard from "@renderer/components/UserCard";

export default function ProfessorHome(): JSX.Element {
  return (
    <main className="gap-10">
      <p>
        <span className="font-bold">Perfil activo:</span> Profesor
      </p>{" "}
      <UserCard />
    </main>
  );
}
