import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Student from "../../../../models/Student";
import DialogAlert from "@renderer/components/DialogAlert";

interface StudentData {
  id: number;
  name: string;
  phoneNumber: string;
  email: string;
  universityId: string;
  isEnabled: boolean;
}

export default function EditStudent() {
  const { id } = useParams();
  const [studentData, setStudentData] = useState<StudentData | undefined>(
    undefined,
  );
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [typeDialog, setTypeDialog] = useState<"success" | "error">("success");
  const [isChecked, setIsChecked] = useState(false);

  const handleToggleChange = (checked) => {
    setIsChecked(checked);
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (studentData) {
      const { id, name, phoneNumber, email, universityId, isEnabled } =
        studentData;
      if (!name.trim()) {
        setTitle("Campos vacíos");
        setTypeDialog("error");
        setMessage("Por favor, complete todos los campos");
        return;
      }

      try {
        window.mainController.updateStudent(
          id,
          name,
          phoneNumber,
          email,
          universityId,
          isEnabled,
        );
        setTitle("Éxito");
        setTypeDialog("success");
        setMessage("Estudiante modificado con éxito");
      } catch (error) {
        setTitle("Error");
        setTypeDialog("error");
        setMessage("Error al modificar estudiante");
      }
    }
  };

  const fetchData = () => {
    const student = Student.reinstantiate(
      window.mainController.getStudentById(parseInt(id!)),
    );
    if (student) {
      setStudentData({
        id: student.getId(),
        name: student.getName(),
        phoneNumber: student.getPhoneNum(),
        email: student.getEmail() || "",
        universityId: student.getUniversityId(),
        isEnabled: student.getIsEnabled(),
      });
      setIsChecked(student.getIsEnabled()); // Inicializa el estado isChecked
    }
  };

  useEffect(() => {
    if (!id) {
      navigate("/admin/manageStudents");
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (message !== "") {
      setShowDialog(true);
    }
  }, [message]);

  const updateData = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setStudentData({
      ...studentData!,
      [event.target.id]: event.target.value,
    });
  };

  return (
    studentData && (
      <main className="gap-10">
        <h1 className="text-3xl font-bold">Editar estudiante</h1>
        <form
          className="flex w-full max-w-2xl flex-col gap-4"
          onSubmit={handleUpdate}
        >
          <div className="flex w-full flex-col gap-3">
            <label
              htmlFor="name"
              className="text-white-900 block text-sm font-medium leading-6"
            >
              Nombre
            </label>
            <input
              type="text"
              id="name"
              className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600"
              required
              value={studentData.name}
              onChange={updateData}
            />
          </div>
          <div className="flex w-full flex-col gap-3">
            <label
              htmlFor="phoneNumber"
              className="text-white-900 block text-sm font-medium leading-6"
            >
              Teléfono
            </label>
            <input
              type="text"
              id="phoneNumber"
              className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600"
              required
              value={studentData.phoneNumber}
              onChange={updateData}
            />
          </div>
          <div className="flex w-full flex-col gap-3">
            <label
              htmlFor="email"
              className="text-white-900 block text-sm font-medium leading-6"
            >
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600"
              value={studentData.email}
              onChange={updateData}
            />
          </div>
          <div className="flex w-full flex-col gap-3">
            <label
              htmlFor="universityId"
              className="text-white-900 block text-sm font-medium leading-6"
            >
              Carnet
            </label>
            <input
              type="text"
              id="universityId"
              className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600"
              required
              value={studentData.universityId}
              onChange={updateData}
            />
          </div>
          <div className="flex w-full flex-col gap-3">
            <label
              htmlFor="isEnabled"
              className="text-white-900 block text-sm font-medium leading-6"
            >
              Habilitado
            </label>
            <input
              type="checkbox"
              id="enabled"
              checked={isChecked}
              onChange={(e) => handleToggleChange(e.target.checked)}
              className="hidden"
            />
            <label
              htmlFor="enabled"
              className="flex cursor-pointer items-center"
            >
              <div
                className={`h-7 w-14 rounded-full p-1 ${isChecked ? "bg-lime-400" : "bg-slate-50"}`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-slate-600 ${isChecked ? "translate-x-7" : "translate-x-0"}`}
                />
              </div>
              <span className="ml-3">{isChecked ? "Sí" : "No"}</span>
            </label>
          </div>
          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-blue-600 px-3 py-1.5 font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Actualizar
          </button>
        </form>
        <DialogAlert
          show={showDialog}
          handleConfirm={() => {
            setShowDialog(false);
            typeDialog === "success" && navigate("/admin/manageStudents");
          }}
          message={message}
          title={title}
          type={typeDialog}
        />
      </main>
    )
  );
}
