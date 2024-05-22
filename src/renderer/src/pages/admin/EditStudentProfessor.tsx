import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DialogAlert from "@renderer/components/DialogAlert";
import { ProfessorInterface } from "../../../../models/Professor";
import { StudentProfessorInterface } from "../../../../models/StudentProfessor";

interface StudentProfessorData {
  id: number | null;
  student: {
    id: number;
    name: string;
  };
  professors: {
    id: number;
    name: string;
    isAdvisor: boolean;
  }[];
}

export default function EditStudentProfessor() {
  const [studentProfessorData, setStudentProfessorData] = useState<
    StudentProfessorData | undefined
  >(undefined);
  const [professors, setProfessors] = useState<ProfessorInterface[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [typeDialog, setTypeDialog] = useState<"success" | "error">("success");
  const [selectedGuia, setSelectedGuia] = useState<string>("");
  const [selectedLector1, setSelectedLector1] = useState<string>("");
  const [selectedLector2, setSelectedLector2] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadedStudentsProfessors: StudentProfessorInterface[] =
      window.mainController.getStudentsProfessors();
    const studentProfessor = loadedStudentsProfessors[0]; // Selecciona el primer estudiante por defecto
    if (studentProfessor) {
      setStudentProfessorData({
        id: studentProfessor.id,
        student: {
          id: studentProfessor.student.id,
          name: studentProfessor.student.name,
        },
        professors: studentProfessor.professors,
      });
      // También establecemos los valores iniciales para los selectores
      const advisor = studentProfessor.professors.find((p) => p.isAdvisor);
      const nonAdvisorProfessors = studentProfessor.professors.filter(
        (p) => !p.isAdvisor,
      );
      const [professorLector1, professorLector2] = nonAdvisorProfessors;
      setSelectedGuia(advisor ? advisor.id.toString() : "");
      setSelectedLector1(
        professorLector1 ? professorLector1.id.toString() : "",
      );
      setSelectedLector2(
        professorLector2 ? professorLector2.id.toString() : "",
      );
    }
  }, []);

  useEffect(() => {
    const loadedProfessors = window.mainController.getProfessors();
    loadedProfessors.sort(sortByName); // Ordenar alfabéticamente
    setProfessors(loadedProfessors);
  }, []);

  const sortByName = (a: ProfessorInterface, b: ProfessorInterface) => {
    return a.name.localeCompare(b.name);
  };

  useEffect(() => {
    if (message !== "") {
      setShowDialog(true);
    }
  }, [message]);

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (studentProfessorData) {
      const studentProfessor_actual = studentProfessorData;
      const studentID = studentProfessor_actual.student.id;
      const profesorGuia = parseInt(selectedGuia);
      const profesorLector1 = parseInt(selectedLector1);
      const profesorLector2 = parseInt(selectedLector2);

      try {
        window.mainController.updateStudentProfessor(
          studentID,
          profesorGuia,
          profesorLector1,
          profesorLector2,
        );
        setTitle("Éxito");
        setTypeDialog("success");
        setMessage("Tutoría modificada con éxito");
      } catch (error) {
        setTitle("Error");
        setTypeDialog("error");
        setMessage("Error al modificar estudiante");
      }
    }
  };

  const updateData = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value } = event.target;
    if (id === "profesorGuia") {
      setSelectedGuia(value);
    } else if (id === "profesorLector1") {
      setSelectedLector1(value);
    } else if (id === "profesorLector2") {
      setSelectedLector2(value);
    }
  };

  if (!studentProfessorData) return null;

  return (
    <main className="gap-6">
      <h1 className="text-3xl font-bold">Editar tutoría</h1>
      <form
        className="flex w-full max-w-2xl flex-col gap-4"
        onSubmit={handleUpdate}
      >
        <div className="flex w-full flex-col gap-3">
          <label
            htmlFor="name"
            className="text-white-900 block text-sm font-medium leading-6"
          >
            Estudiante
          </label>
          <input
            type="text"
            id="name"
            className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600"
            readOnly
            value={studentProfessorData.student.name}
          />
          <label
            htmlFor="profesorGuia"
            className="text-white-900 block text-sm font-medium leading-6"
          >
            Profesor guía
          </label>
          <select
            id="profesorGuia"
            className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600"
            required
            value={selectedGuia}
            onChange={updateData}
          >
            <option value="">Seleccionar</option>
            {professors.map((professor) => (
              <option key={professor.id} value={professor.id?.toString() ?? ""}>
                {professor.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-full flex-col gap-3">
          <label
            htmlFor="profesorLector1"
            className="text-white-900 block text-sm font-medium leading-6"
          >
            Profesor lector 1
          </label>
          <select
            id="profesorLector1"
            className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600"
            required
            value={selectedLector1}
            onChange={updateData}
          >
            <option value="">Seleccionar</option>
            {professors.map((professor) => (
              <option key={professor.id} value={professor.id?.toString() ?? ""}>
                {professor.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-full flex-col gap-3">
          <label
            htmlFor="profesorLector2"
            className="text-white-900 block text-sm font-medium leading-6"
          >
            Profesor lector 2
          </label>
          <select
            id="profesorLector2"
            className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600"
            required
            value={selectedLector2}
            onChange={updateData}
          >
            <option value="">Seleccionar</option>
            {professors.map((professor) => (
              <option key={professor.id} value={professor.id?.toString() ?? ""}>
                {professor.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-md bg-teal-500 px-3 py-1.5 font-semibold text-white shadow-sm hover:bg-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          onClick={handleUpdate}
        >
          Actualizar
        </button>
      </form>

      <DialogAlert
        show={showDialog}
        handleConfirm={() => {
          setShowDialog(false);
          typeDialog === "success" && navigate("/admin/manageTheses/advisors");
        }}
        message={message}
        title={title}
        type={typeDialog}
      />
    </main>
  );
}
