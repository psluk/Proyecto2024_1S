import { useNavigate, useParams } from "react-router-dom";
import { ReactElement, useEffect, useState, useRef } from "react";
import DialogAlert from "@renderer/components/DialogAlert";
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

interface ProfessorsSuggestionsRow {
  professorId: number;
  name: string;
  students: number;
  suggestedStudents: number;
}

export default function EditStudentProfessor(): ReactElement | null {
  const { id } = useParams();
  const [studentProfessorData, setStudentProfessorData] =
    useState<StudentProfessorData | null>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [typeDialog, setTypeDialog] = useState<"success" | "error">("success");
  const [selectedGuia, setSelectedGuia] = useState<string>("");
  const [selectedLector1, setSelectedLector1] = useState<string>("");
  const [selectedLector2, setSelectedLector2] = useState<string>("");

  const initialSelectedGuia = useRef<string>("");
  const initialSelectedLector1 = useRef<string>("");
  const initialSelectedLector2 = useRef<string>("");

  const [professorsSuggestions, setProfessorsSuggestions] = useState<
    ProfessorsSuggestionsRow[]
  >([]);

  const [students, setStudents] = useState<number>(0);
  const [suggestedStudents, setSuggestedStudents] = useState<number>(1);
  const [warning, setWarning] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadedStudentsProfessors: StudentProfessorInterface[] =
      window.mainController.getStudentsProfessors();
    const studentProfessor = loadedStudentsProfessors.find(
      (sp) => sp.student.id === parseInt(id || "0"),
    );
    if (studentProfessor) {
      setStudentProfessorData({
        id: studentProfessor.id,
        student: {
          id: studentProfessor.student.id,
          name: studentProfessor.student.name,
        },
        professors: studentProfessor.professors,
      });
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

      initialSelectedGuia.current = advisor ? advisor.id.toString() : "";
      initialSelectedLector1.current = professorLector1
        ? professorLector1.id.toString()
        : "";
      initialSelectedLector2.current = professorLector2
        ? professorLector2.id.toString()
        : "";
    }
  }, [id]);

  useEffect(() => {
    const loadedProfessorsSuggestions =
      window.mainController.getProfessorsSuggestions();
    const sortedProfessorsSuggestions = loadedProfessorsSuggestions.sort(
      (a, b) => a.name.localeCompare(b.name),
    );
    setProfessorsSuggestions(sortedProfessorsSuggestions);
  }, []);

  useEffect(() => {
    if (students >= suggestedStudents) {
      setWarning(true);
    } else {
      setWarning(false);
    }
  }, []);

  const handleUpdate = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setStudents(0);
    setSuggestedStudents(1);
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

        if (initialSelectedGuia.current !== selectedGuia) {
          window.mainController.updateActivityAdvisor(
            parseInt(initialSelectedGuia.current),
            profesorGuia,
          );
        }

        if (initialSelectedLector1.current !== selectedLector1) {
          window.mainController.updateActivityLector(
            parseInt(initialSelectedLector1.current),
            profesorLector1,
          );
        }
        if (initialSelectedLector2.current !== selectedLector2) {
          window.mainController.updateActivityLector(
            parseInt(initialSelectedLector2.current),
            profesorLector2,
          );
        }

        setTitle("Éxito");
        setTypeDialog("success");
        setMessage("Tutoría modificada con éxito");
        setShowDialog(true);
      } catch (error) {
        console.error(error);
        setTitle("Error");
        setTypeDialog("error");
        setMessage("Error al modificar tutoría");
        setShowDialog(true);
      }
    }
  };

  const updateData = (event: React.ChangeEvent<HTMLSelectElement>): void => {
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
            {professorsSuggestions
              .filter(
                (professor) =>
                  professor.professorId !== parseInt(selectedLector1) &&
                  professor.professorId !== parseInt(selectedLector2),
              ) // Filtrar los nombres que ya están seleccionados en los otros selectores
              .sort((a, b) => a.name.localeCompare(b.name)) // Ordenar alfabéticamente por nombre
              .map((professor) => (
                <option
                  key={professor.professorId}
                  value={professor.professorId.toString()}
                >
                  {professor.name}
                </option>
              ))}
          </select>
          {warning && (
            <div>
              <h1 className=" text-red-400">
                El profesor ya ha alcanzado su número límite de estudiantes
                sugeridos
              </h1>
            </div>
          )}
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
            {professorsSuggestions
              .filter(
                (professor) =>
                  professor.professorId !== parseInt(selectedGuia) &&
                  professor.professorId !== parseInt(selectedLector2),
              ) // Filtrar los nombres que ya están seleccionados en los otros selectores
              .sort((a, b) => a.name.localeCompare(b.name)) // Ordenar alfabéticamente por nombre
              .map((professor) => (
                <option
                  key={professor.professorId}
                  value={professor.professorId.toString()}
                >
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
            {professorsSuggestions
              .filter(
                (professor) =>
                  professor.professorId !== parseInt(selectedGuia) &&
                  professor.professorId !== parseInt(selectedLector1),
              ) // Filtrar los nombres que ya están seleccionados en los otros selectores
              .sort((a, b) => a.name.localeCompare(b.name)) // Ordenar alfabéticamente por nombre
              .map((professor) => (
                <option
                  key={professor.professorId}
                  value={professor.professorId.toString()}
                >
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
