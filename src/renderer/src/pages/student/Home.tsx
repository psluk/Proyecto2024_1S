import UserCard from "@renderer/components/UserCard";

export default function StudentHome(): JSX.Element {
  return (
    <main className="gap-10">
      <p>
        <span className="font-bold">Perfil activo:</span> Estudiante
      </p>{" "}
      
      <UserCard />
    </main>
  );
}
